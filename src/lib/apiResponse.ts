import { NextResponse } from 'next/server';
import { DomainError } from '../domain/errors/DomainError';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: unknown) {
  return NextResponse.json({ error }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function unprocessable(message: string) {
  return NextResponse.json({ error: message }, { status: 422 });
}

export function serverError() {
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof DomainError) {
    return unprocessable(err.message);
  }
  console.error('[API Error]', err);
  return serverError();
}
