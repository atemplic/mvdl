# Introduction

MVDL is a downloader for EOS teases on [Milovana](https://milovana.com).  Releases for Mac, Windows, and Linux are available on the [releases page](https://github.com/atemplic/mvdl/releases).

To use, just select a download location (defaults to your system's downloads directory).  Copy the full url of an EOS tease, press load, and the downloads will start.  It will create a new directory containing JSON files for the metadata and script file, and a subdirectory for the images and other files.

## Caveats and limitations

This is a downloader only, and no player exists for the downloaded files.  It is intended to be used for backups in case Milovana disappears from the web, at which time a player could be developed.

It only supports EOS teases.  There are separate downloaders for other formats.

I did not pay Apple the tax to sign this application, so you'll need to jump through [some hoops](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac) to install it on recent versions of macOS.  Pinky promise it's not malware.

Linux builds haven't been tested but should work.

## Credit

MVDL was built on top of [angular-electron](https://github.com/maximegris/angular-electron).

# Development

Clone this repository locally :

``` bash
git clone https://github.com/atemplic/mvdl.git
```

Install dependencies with npm :

``` bash
npm install
```

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload !

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Browser mode

Maybe you only want to execute the application in the browser with hot reload ? Just run `npm run ng:serve:web`.

## Included Commands

| Command                  | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `npm run ng:serve`       | Execute the app in the browser                                                       |
| `npm run build`          | Build the app. Your built files are in the /dist folder.                             |
| `npm run build:prod`     | Build the app with Angular aot. Your built files are in the /dist folder.            |
| `npm run electron:local` | Builds your application and start electron                                           |
| `npm run electron:build` | Builds your application and creates an app consumable based on your operating system |
