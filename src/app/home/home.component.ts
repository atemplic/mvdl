import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services/electron/electron.service';
import { IpcRenderer, ipcMain } from 'electron';
import { TeaseStatus } from '../../../tease-status'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private readonly ipcRenderer: IpcRenderer;

  url: string = 'https://milovana.com/webteases/showtease.php?id=40253';
  status: TeaseStatus = {};
  outputDir = '';

  get imagesDownloaded(): number {
    if (this.status.script?.images) {
      return this.status.script.images.filter(i => i.downloaded).length;
    }
    return 0;
  }

  loadTease() {
    this.ipcRenderer.send('load-tease', this.parseTeaseId(this.url));
  }

  selectOutput() {
    this.ipcRenderer.send('select-output');
  }

  parseTeaseId(teaseUrl: string): string | null {
    let match = teaseUrl.match(/milovana.com\/webteases\/showtease.php\?id=(\d+)/);
    if (match) {
      return match[1];
    }
    return null;
  }

  constructor(private readonly router: Router, electronService: ElectronService, private readonly ngZone: NgZone) {
    this.ipcRenderer = electronService.ipcRenderer;
  }

  ngOnInit(): void {
    this.ipcRenderer.on('tease-loaded', (event, status: TeaseStatus) => {
      this.ngZone.run(() => this.status = status);
    });

    this.ipcRenderer.on('output-selected', (event, outputPath: string) => {
      this.ngZone.run(() => this.outputDir = outputPath);
    })

    this.ipcRenderer.send('view-output');
  }

}
