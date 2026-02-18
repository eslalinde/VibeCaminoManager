"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_serve_1 = __importDefault(require("electron-serve"));
const electron_updater_1 = require("electron-updater");
const isProd = electron_1.app.isPackaged;
const loadURL = (0, electron_serve_1.default)({ directory: path_1.default.join(__dirname, '..', 'out') });
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path_1.default.join(__dirname, '..', 'build-resources', 'icon.ico'),
    });
    loadURL(mainWindow);
    if (!isProd) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    // Auto-updates (prod only)
    if (isProd) {
        electron_updater_1.autoUpdater.autoDownload = true;
        electron_updater_1.autoUpdater.autoInstallOnAppQuit = true;
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        electron_updater_1.autoUpdater.on('update-available', () => {
            mainWindow?.webContents.send('update-available');
        });
        electron_updater_1.autoUpdater.on('update-downloaded', () => {
            mainWindow?.webContents.send('update-downloaded');
        });
    }
});
electron_1.app.on('window-all-closed', () => {
    electron_1.app.quit();
});
// IPC handlers
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('install-update', () => {
    electron_updater_1.autoUpdater.quitAndInstall();
});
//# sourceMappingURL=main.js.map