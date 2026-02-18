"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    onUpdateAvailable: (callback) => {
        electron_1.ipcRenderer.on('update-available', callback);
        return () => electron_1.ipcRenderer.removeListener('update-available', callback);
    },
    onUpdateDownloaded: (callback) => {
        electron_1.ipcRenderer.on('update-downloaded', callback);
        return () => electron_1.ipcRenderer.removeListener('update-downloaded', callback);
    },
    installUpdate: () => electron_1.ipcRenderer.invoke('install-update'),
});
//# sourceMappingURL=preload.js.map