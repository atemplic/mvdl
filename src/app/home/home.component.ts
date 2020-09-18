import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services/electron/electron.service';
import { IpcRenderer } from 'electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private readonly ipcRenderer: IpcRenderer;

  url: string = 'https://milovana.com/webteases/showtease.php?id=40253';
  teaseInfo: string | undefined = "i";

  loadTease() {
    this.ipcRenderer.send('load-tease', this.parseTeaseId(this.url));
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
    this.ipcRenderer.on('tease-loaded', (event, teaseInfo) => {
      this.ngZone.run(() => this.teaseInfo = teaseInfo);
    });
  }

}
