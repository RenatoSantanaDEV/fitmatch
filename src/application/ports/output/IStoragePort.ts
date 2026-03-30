export interface IStoragePort {
  uploadFile(fileName: string, file: Blob, folder: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}
