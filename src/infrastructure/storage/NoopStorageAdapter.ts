import { IStoragePort } from '../../application/ports/output/IStoragePort';

export class NoopStorageAdapter implements IStoragePort {
  async uploadFile(fileName: string, _file: Blob, folder: string): Promise<string> {
    const url = `/uploads/${folder}/${fileName}`;
    console.log(`[Storage] Would upload ${fileName} to ${folder}`);
    return url;
  }

  async deleteFile(url: string): Promise<void> {
    console.log(`[Storage] Would delete ${url}`);
  }
}
