const {
    contextBridge,
    ipcRenderer,
    remote
} = require("electron");

let contextBridge_validChannels = ["getEvent", "updateEvent", "deleteEvent", "connectToDB", "getTotalEvents", "getMonthEvents", "Isdatabaseoverload", "loadConfig", "saveConfig", "navigate"];
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            if (contextBridge_validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            } else {
                remote.dialog.showErrorBox('Invalid Channel', 'Attempted to send data on an invalid channel.');
            }
        },
        receive: (channel, func) => {
            if (contextBridge_validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            } else {
                remote.dialog.showErrorBox('Invalid Channel', 'Attempted to receive data on an invalid channel.');
            }
        },
        invoke: (channel, data) => {
            if (contextBridge_validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            } else {
                remote.dialog.showErrorBox('Invalid Channel', 'Attempted to invoke data on an invalid channel.');
            }
        }
    }
);
