const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DBManager = require('./dbManager');

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

let dbManager = null;

ipcMain.handle('connectToDB', async (event) => {
    dbManager = new DBManager(); //not pass config, use config.js now
    try {
        await dbManager.connect();
        return 'connected';
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('getEvent', async (event, date) => {
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        const result = await dbManager.getEvent(date);
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('updateEvent', async (event, { date, title }) => {
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        await dbManager.updateEvent(date, title);
        return 'updated';
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('deleteEvent', async (event, date) => {
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        await dbManager.deleteEvent(date);
        return 'deleted';
    } catch (err) {
        throw new Error(err.message);
    }
});
