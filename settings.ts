import { app } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';
import { exception } from 'console';

export class Settings {
  private static readonly APP_DATA_PATH = path.join(app.getPath('appData'), 'MVDL');
  private static readonly SETTINGS_FILE_PATH = path.join(Settings.APP_DATA_PATH, 'settings.json');
  private static instance: Settings;

  private internal: SettingsInternal;

  getOutputPath(): string {
    return this.internal.outputPath;
  }

  async setOutputPath(newPath: string) {
    this.internal.outputPath = newPath;
    await this.writeSettingsFile();
  }

  private async initialize() {
    await this.createDataPath();
    await this.readOrCreateSettingsFile();
  }

  private async createDataPath() {
    try {
      await fs.access(Settings.APP_DATA_PATH);
    } catch {
      await fs.mkdir(Settings.APP_DATA_PATH);
    }
  }

  private async readOrCreateSettingsFile() {
    try {
      const result = <string>await fs.readFile(Settings.SETTINGS_FILE_PATH, {
        encoding: 'utf-8',
      });
      const json = JSON.parse(result);
      this.internal = {
        outputPath: json.outputPath,
      }
      if (!this.internal.outputPath) {
        throw new exception('Output path missing.');
      }
    } catch (error) {
      console.log(error);
      this.internal = {
        outputPath: app.getPath('downloads'),
      }
      await this.writeSettingsFile();
    }
  }

  private async writeSettingsFile() {
    await fs.writeFile(Settings.SETTINGS_FILE_PATH, JSON.stringify(this.internal));
  }

  private constructor() { }

  static async getInstance(): Promise<Settings> {
    if (Settings.instance) {
      return Settings.instance;
    } else {
      let newSettings = new Settings();
      await newSettings.initialize();
      Settings.instance = newSettings;
      return newSettings;
    }
  }

}

interface SettingsInternal {
  outputPath: string;
}
