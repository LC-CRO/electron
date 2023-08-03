const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DBManager = require('./dbManager');
const fs = require('fs');
let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
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
    await connect_datbase();
});


async function connect_datbase() {
    dbManager = new DBManager(); //not pass config, use config.js now
    try {
        await dbManager.connect(config);
        console.log("[CORE] Database connected !");
        return 'connected';
    } catch (err) {
        console.log("[CORE] Database connect error ", err);
        throw new Error(err.message);
    }
}

ipcMain.handle('getEvent', async (event, date) => {
    console.log("[CORE] get event...");
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        const result = await dbManager.getEvent(date);
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('updateEvent', async (event, { date, title }) => {
    console.log("[CORE] update event...");
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        await dbManager.updateEvent(date, title);
        return 'updated';
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('deleteEvent', async (event, date) => {
    console.log("[CORE] delete event...");
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        await dbManager.deleteEvent(date);
        return 'deleted';
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('getTotalEvents', async (event) => {
    console.log("[CORE] get total events...");
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        const result = await dbManager.getTotalEvents();
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('getMonthEvents', async (event, year, month) => {
    console.log("[CORE] get month events...");
    if(!dbManager) throw new Error('Not connected to DB');
    try {
        const result = await dbManager.getMonthEvents(year, month);
        return result;
    } catch (err) {
        throw new Error(err.message);
    }
});

ipcMain.handle('Isdatabaseoverload', async (event) => {
    return dbManager.isOverloaded();
});

ipcMain.handle('loadConfig', () => {
    console.log("[CORE] request config");
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8'));
    return config;
});

ipcMain.on('saveConfig', async (event, newConfig) => {
    await fs.writeFileSync(path.join(__dirname, 'config.js'), 'module.exports = ' + JSON.stringify(newConfig, null, 2));
    await connect_datbase();
});

ipcMain.on('navigate', (event, route) => {
    switch(route) {
        case 'calendar':
            mainWindow.loadFile('index.html');
            break;
        case 'settings':
            mainWindow.loadFile('config.html');
            break;
        default:
            console.error(`Unknown route: ${route}`);
    }
});