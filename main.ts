import { app, BrowserWindow, ipcMain, screen } from 'electron';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as url from 'url';

const electronDl = require('electron-dl');

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {
  console.log('asdf');

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

async function downloadTeaseInfo(teaseId: string) {
  const url = `https://milovana.com/webteases/showtease.php?id=${teaseId}`;
  const response = await axios.get(url, {
    transformResponse: [],
    responseType: 'text'
  });
  const doc = cheerio.load(response.data);
  const title = doc('body').attr('data-title');
  return title;
}

async function downloadTease(teaseId: string) {
  const url = `https://milovana.com/webteases/geteosscript.php?id=${teaseId}`;
  return axios.get(url).then(response => response.statusText);
}

function setupIpc() {
  console.log('test');
  ipcMain.on('load-tease', async (event, teaseId) => {
    let teaseInfo = await downloadTeaseInfo(teaseId);
    event.reply('tease-loaded', teaseInfo);
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
