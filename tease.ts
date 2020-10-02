import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { TeaseMetadata, TeaseStatus } from './tease-status';
import { promises as fs, createWriteStream } from 'fs';
import sanitize from 'sanitize-filename';
import * as path from 'path';
import Bottleneck from 'bottleneck';

export interface File {
  id: string;
  hash: string;
  downloaded: boolean;
  extension: string;
}

export interface Image extends File {
  galleryId: string;
  galleryName: string;
}

export class Tease {
  private metadata: TeaseMetadata;
  private scriptText: string;
  private images: Image[] = [];
  private limiter = new Bottleneck({
    minTime: 500,
    maxConcurrent: 1,
  });

  private async downloadMetadata(): Promise<void> {
    const url = `https://milovana.com/webteases/showtease.php?id=${this.teaseId}`;
    const response = await axios.get(url, {
      transformResponse: [],
      responseType: 'text'
    });
    const doc = cheerio.load(response.data);
    this.metadata = {
      id: doc('body').attr('data-tease-id'),
      authorId: doc('body').attr('data-author-id'),
      title: doc('body').attr('data-title'),
      author: doc('body').attr('data-author'),
    };
  }

  private async downloadScript(): Promise<void> {
    const url = `https://milovana.com/webteases/geteosscript.php?id=${this.teaseId}`;
    const response = await axios.get(url, {
      transformResponse: [],
      responseType: 'text'
    });

    this.scriptText = response.data;
  }

  private parseFiles() {
    const script = JSON.parse(this.scriptText);

    if (script.files) {
      for (const fileId in script.files) {
        const file = script.files[fileId];

        this.images.push({
          id: file.id,
          hash: file.hash,
          galleryId: null,
          galleryName: null,
          downloaded: false,
          extension: path.extname(fileId).slice(1),
        })
      }
    }

    if (script.galleries) {
      for (const galleryId in script.galleries) {
        const gallery = script.galleries[galleryId];

        if (gallery.images) {
          for (const image of gallery.images) {
            this.images.push({
              id: image.id,
              hash: image.hash,
              galleryId: galleryId,
              galleryName: gallery.name,
              downloaded: false,
              extension: "jpg",
            })
          }
        }

      }
    }
  }

  constructor(public outputPath: string, private teaseId: string) {

  }

  async downloadTeaseInfo(): Promise<void> {
    await this.downloadMetadata();
    await this.downloadScript();
    this.parseFiles();
    await this.saveTeaseInfo();
  }

  async saveTeaseInfo(): Promise<void> {
    if (this.metadata?.title) {
      const teasePath = path.join(this.outputPath, sanitize(this.metadata.title));
      const imagesPath = path.join(teasePath, 'images');
      try {
        await fs.access(teasePath);
      } catch {
        fs.mkdir(teasePath);
      }

      try {
        await fs.access(imagesPath);
      } catch {
        fs.mkdir(imagesPath);
      }

      await fs.writeFile(path.join(teasePath, 'metadata.json'), JSON.stringify(this.metadata));
      await fs.writeFile(path.join(teasePath, 'script.json'), this.scriptText);
    }
  }

  getStatus(): TeaseStatus {
    return {
      metadata: this.metadata,
      totalFiles: this.images.length,
      downloadedFiles: this.images.filter(i => i.downloaded).length,
      errors: [],
    };

  }

  async startImageDownloads(listener: (status: TeaseStatus) => void) {
    for (const image of this.images) {
      const url = `https://media.milovana.com/timg/${image.hash}.${image.extension}`
      const imagePath = path.join(this.outputPath, sanitize(this.metadata?.title), 'images', `${image.hash}.${image.extension}`);
      if (await fs.access(imagePath).then(() => true).catch(() => false)) {
        image.downloaded = true;
        listener(this.getStatus());
        continue;
      }
      this.limiter.schedule(async () => {
        console.log(url);
        console.log(imagePath);

        const writer = createWriteStream(imagePath);
        const response = await axios.get(url, {
          method: 'get',
          responseType: 'stream',
        });
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          console.log(err);
          fs.unlink(imagePath);
        });
        writer.on('close', () => {
          if (!error) {
            image.downloaded = true;
            listener(this.getStatus());
          }
        });
      });
    }
  }
}
