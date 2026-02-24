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
    windowMinimize: () => electron_1.ipcRenderer.invoke('window-minimize'),
    windowMaximize: () => electron_1.ipcRenderer.invoke('window-maximize'),
    windowClose: () => electron_1.ipcRenderer.invoke('window-close'),
    windowIsMaximized: () => electron_1.ipcRenderer.invoke('window-is-maximized'),
    onMaximizedChange: (callback) => {
        const handler = (_event, isMaximized) => callback(isMaximized);
        electron_1.ipcRenderer.on('window-maximized-changed', handler);
        return () => electron_1.ipcRenderer.removeListener('window-maximized-changed', handler);
    },
});
//# sourceMappingURL=preload.js.map