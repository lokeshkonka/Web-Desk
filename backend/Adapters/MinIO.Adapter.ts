import type { StorageAdapter } from "./Storage.Adapter";
import { Client } from "minio";
import { Readable } from "stream";
import { env } from "../Configs/env";

export class MinIOAdapter implements StorageAdapter {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: env.MINIO_ENDPOINT || 'localhost',
      port: env.MINIO_PORT ? parseInt(env.MINIO_PORT) : 9000,
      useSSL: env.MINIO_USE_SSL === 'true',
      accessKey: env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: env.MINIO_SECRET_KEY || 'minioadmin',
    });
    this.bucket = env.MINIO_BUCKET || 'webdesk-uploads';
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
      }
    } catch (err) {
      console.error('Failed to initialize MinIO bucket:', err);
    }
  }

  async upload(stream: NodeJS.ReadableStream, filename: string): Promise<{ path: string; size: number }> {
    // Minio putObject can take a stream, but we need to know the size if we don't use multipart or stream it fully.
    // However, if we don't know the size, we can just pass the stream and let MinIO handle it, but it might buffer.
    // For size, we can stat it after, but S3 API returns object metadata.
    await this.client.putObject(this.bucket, filename, stream as Readable);
    const stat = await this.client.statObject(this.bucket, filename);
    return { path: filename, size: stat.size };
  }

  async delete(filepath: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucket, filepath);
      return true;
    } catch (err) {
      return false;
    }
  }

  async stream(filepath: string): Promise<Readable> {
    return this.client.getObject(this.bucket, filepath);
  }

  async exists(filepath: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, filepath);
      return true;
    } catch (err) {
      return false;
    }
  }
}
