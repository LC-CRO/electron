const mysql = require('mysql2');
const config = require('./config.js');

class DBManager {
    constructor() {
        this.config = config;
        this.connection = null;
    }

    async connect() {
        if (!this.connection) {
            this.connection = mysql.createConnection(this.config.database);
            this.connection.connect(error => {
                if (error) {
                    console.log("Erreur de connexion à la base de données:", error);
                    this.connection = null;
                } else {
                    console.log("Connecté à la base de données MySQL!");
                    this.createTable()
                        .then(() => console.log('Table créée ou déjà existante'))
                        .catch(err => console.log('Erreur lors de la création de la table:', err));
                }
            });
        }
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE,
            title VARCHAR(255),
            UNIQUE KEY (date)
        )
    `;

        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }


    close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    getEvent(date) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM events WHERE date = ?', [date], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results[0]);
            });
        });
    }

    updateEvent(date, title) {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO events (date, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = ?', [date, title, title], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }

    deleteEvent(date) {
        return new Promise((resolve, reject) => {
            this.connection.query('DELETE FROM events WHERE date = ?', [date], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
            });
        });
    }
}

module.exports = DBManager;
