import { EventEmitter } from 'node:events';
import { Client, type Notification } from 'pg';
import { ChatRealtimePayload } from '../../application/ports/output/IChatRealtimePort';
import { CHAT_NOTIFY_CHANNEL } from './PgNotifyChatAdapter';

type ListenState = 'idle' | 'connecting' | 'ready' | 'closed';

interface PgListenSingleton {
  emitter: EventEmitter;
  client: Client | null;
  state: ListenState;
  ensurePromise: Promise<void> | null;
}

const globalForListen = globalThis as unknown as {
  __pgChatListen?: PgListenSingleton;
};

function getSingleton(): PgListenSingleton {
  if (!globalForListen.__pgChatListen) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    globalForListen.__pgChatListen = {
      emitter,
      client: null,
      state: 'idle',
      ensurePromise: null,
    };
  }
  return globalForListen.__pgChatListen;
}

function resolveConnectionString(): string {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    ''
  );
}

async function connect(singleton: PgListenSingleton): Promise<void> {
  if (singleton.state === 'ready') return;
  if (singleton.state === 'connecting' && singleton.ensurePromise) {
    await singleton.ensurePromise;
    return;
  }
  singleton.state = 'connecting';
  singleton.ensurePromise = (async () => {
    const connectionString = resolveConnectionString();
    if (!connectionString) {
      singleton.state = 'idle';
      throw new Error('No Postgres connection string available for chat LISTEN');
    }

    const sslRequired =
      /sslmode=require/i.test(connectionString) ||
      process.env.NODE_ENV === 'production';

    const client = new Client({
      connectionString,
      ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
    });

    client.on('error', (err) => {
      console.error('[PgListenClient] client error', err);
    });

    client.on('end', () => {
      singleton.state = 'closed';
      singleton.client = null;
      // Schedule reconnect after a backoff.
      setTimeout(() => {
        if (singleton.emitter.listenerCount('message') === 0) return;
        void connect(singleton).catch((e) =>
          console.error('[PgListenClient] reconnect failed', e),
        );
      }, 2000);
    });

    client.on('notification', (msg: Notification) => {
      if (msg.channel !== CHAT_NOTIFY_CHANNEL) return;
      if (!msg.payload) return;
      try {
        const parsed = JSON.parse(msg.payload) as ChatRealtimePayload;
        singleton.emitter.emit('message', parsed);
      } catch (err) {
        console.error('[PgListenClient] malformed notification payload', err);
      }
    });

    await client.connect();
    await client.query(`LISTEN ${CHAT_NOTIFY_CHANNEL}`);
    singleton.client = client;
    singleton.state = 'ready';
  })();

  try {
    await singleton.ensurePromise;
  } finally {
    singleton.ensurePromise = null;
  }
}

/**
 * Subscribes to chat realtime notifications. Returns an unsubscribe function
 * that removes the listener. The underlying pg connection is established
 * lazily on first subscription and reused across all subscribers in the
 * Node process.
 */
export async function subscribeToChat(
  handler: (payload: ChatRealtimePayload) => void,
): Promise<() => void> {
  const singleton = getSingleton();
  await connect(singleton);
  singleton.emitter.on('message', handler);
  return () => {
    singleton.emitter.off('message', handler);
  };
}
