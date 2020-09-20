import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { TeaseMetadata, TeaseStatus, TeaseScript, Image } from './tease-status';

export class Downloader {

  private teases: Map<string, TeaseStatus> = new Map();

  static async downloadMetadata(teaseId: string): Promise<TeaseMetadata> {
    const url = `https://milovana.com/webteases/showtease.php?id=${teaseId}`;
    const response = await axios.get(url, {
      transformResponse: [],
      responseType: 'text'
    });
    const doc = cheerio.load(response.data);
    return {
      id: doc('body').attr('data-tease-id'),
      authorId: doc('body').attr('data-author-id'),
      title: doc('body').attr('data-title'),
      author: doc('body').attr('data-author'),
    };
  }
  static async downloadScript(teaseId: string): Promise<TeaseScript> {
    const url = `https://milovana.com/webteases/geteosscript.php?id=${teaseId}`;
    const response = await axios.get(url, {
      transformResponse: [],
      responseType: 'text'
    });

    let images: Image[] = [];
    const script = JSON.parse(response.data);
    if (script.galleries) {
      for (const galleryId in script.galleries) {
        const gallery = script.galleries[galleryId];

        if (gallery.images) {
          for (const image of gallery.images) {
            images.push({
              id: image.id,
              hash: image.hash,
              galleryId: galleryId,
              galleryName: gallery.name,
              downloaded: false,
            })
          }
        }

      }
    }

    return {
      scriptText: response.data,
      images,
    };
  }

  async downloadTeaseInfo(teaseId: string): Promise<TeaseStatus> {
    const tease = {
      metadata: await Downloader.downloadMetadata(teaseId),
      script: await Downloader.downloadScript(teaseId),
    }
    this.teases.set(teaseId, tease);
    return tease;
  }

  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startImageDownloads(teaseId: string, listener: (status: TeaseStatus) => void) {
    if (this.teases.has(teaseId)) {
      let tease = this.teases.get(teaseId);
      for (const i in tease.script?.images) {
        tease.script.images[i].downloaded = true;
        listener(tease);
        await Downloader.sleep(1000);
      }
    }
  }
}
