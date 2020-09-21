import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as url from 'url';
import { TeaseStatus, TeaseMetadata } from './tease-status';
import { Downloader } from './downloader';
import { Settings } from './settings';
import { promises as fs } from 'fs';

const electronDl = require('electron-dl');

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
let settings: Settings;

async function createWindow(): Promise<BrowserWindow> {
  settings = await Settings.getInstance();
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      enableRemoteModule: false // true if you want to use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

function downloadTeaseToFile(url: string) {
  electronDl.download(win, url);
}

function setupIpc() {
  ipcMain.on('load-tease', async (event, teaseId) => {
    let downloader = new Downloader();
    let status = await downloader.downloadTeaseInfo(teaseId);
    event.reply('tease-loaded', status);

    downloader.startImageDownloads(teaseId, (status) => event.reply('tease-loaded', status));
  });

  ipcMain.on('select-output', async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    if (result.filePaths.length == 1) {
      const outputPath = result.filePaths[0];
      settings.setOutputPath(outputPath);
      event.reply('output-selected', outputPath);
    }
  });

  ipcMain.on('view-output', async (event) => {
    event.reply('output-selected', settings.getOutputPath());
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(() => {
    setupIpc();
    createWindow();
  }, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
