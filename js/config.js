

window.api.invoke('loadConfig')
.then(result => {
    if (result) {
        document.getElementById('host').value = result.database.host;
        document.getElementById('user').value = result.database.user;
        document.getElementById('password').value = result.database.password;
        document.getElementById('database').value = result.database.database;
        document.getElementById('max-queries').value = result.database.maxQueries;
    }
});

document.getElementById('save-config').addEventListener('click', () => {
    const config = {
        database: {
            host: document.getElementById('host').value,
            user: document.getElementById('user').value,
            password: document.getElementById('password').value,
            database: document.getElementById('database').value,
            maxQueries: document.getElementById('max-queries').value
        }
    };

    window.api.send('saveConfig', config);
});
