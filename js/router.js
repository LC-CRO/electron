document.getElementById('calendar-link').addEventListener('click', function() {
    window.api.send('navigate', 'calendar');
});

document.getElementById('settings-link').addEventListener('click', function() {
    window.api.send('navigate', 'settings');
});
