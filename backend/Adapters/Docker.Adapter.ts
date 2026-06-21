import Docker from 'dockerode';

export class DockerAdapter {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async createContainer(name: string, image: string, opts?: any) {
    await this.pullImageIfNotExists(image);

    const container = await this.docker.createContainer({
      Image: image,
      name: name,
      Tty: true,
      Cmd: ['tail', '-f', '/dev/null'],
      HostConfig: {
        Memory: opts?.memory || 512 * 1024 * 1024, // default 512MB
        NanoCpus: opts?.cpus ? opts.cpus * 1e9 : 1 * 1e9, // default 1 CPU
        Privileged: false,
      },
      ...opts
    });
    return container;
  }

  async pullImageIfNotExists(image: string) {
    const images = await this.docker.listImages();
    // Normalize image name to check
    const searchImage = image.includes(':') ? image : `${image}:latest`;
    const exists = images.some(img => img.RepoTags?.includes(searchImage));
    if (!exists) {
      return new Promise((resolve, reject) => {
        this.docker.pull(searchImage, (err: any, stream: any) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, onFinished, onProgress);
          function onFinished(err: any, output: any) {
            if (err) return reject(err);
            resolve(output);
          }
          function onProgress() {}
        });
      });
    }
  }

  async startContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.start();
  }

  async stopContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.stop();
  }

  async removeContainer(containerId: string) {
    const container = this.docker.getContainer(containerId);
    await container.remove({ force: true });
  }

  async listContainers() {
    return this.docker.listContainers({ all: true });
  }

  async getContainerLogs(containerId: string) {
    const container = this.docker.getContainer(containerId);
    const logs = await container.logs({ stdout: true, stderr: true, timestamps: true, tail: 100 });
    return logs.toString('utf8');
  }

  getContainer(containerId: string) {
    return this.docker.getContainer(containerId);
  }

  getDocker() {
    return this.docker;
  }
}
