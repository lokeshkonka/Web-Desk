import type { StorageAdapter } from "./Storage.Adapter";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

export class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), "uploads");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(stream: NodeJS.ReadableStream, filename: string): Promise<{ path: string; size: number }> {
    const filePath = path.join(this.baseDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    await pipeline(stream, writeStream);
    const stat = await fs.promises.stat(filePath);
    return { path: filename, size: stat.size };
  }

  async delete(filepath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filepath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }

  async stream(filepath: string): Promise<Readable> {
    const fullPath = path.join(this.baseDir, filepath);
    if (!fs.existsSync(fullPath)) {
      throw new Error("File not found");
    }
    return fs.createReadStream(fullPath);
  }

  async exists(filepath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filepath);
    return fs.existsSync(fullPath);
  }
}
