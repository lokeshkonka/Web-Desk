import { Readable } from "stream";

export interface StorageAdapter {
  upload(stream: NodeJS.ReadableStream, filename: string): Promise<{ path: string; size: number }>;
  delete(path: string): Promise<boolean>;
  stream(path: string): Promise<Readable>;
  exists(path: string): Promise<boolean>;
}
