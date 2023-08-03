const mysql = require('mysql2/promise');

class DBManager {
    constructor() {
        this.currentQueries = 0;
    }

    async connect(config) {
        if (!this.connection) {
            try {
                this.connection = await mysql.createConnection(config.database);
                console.log("Connecté à la base de données MySQL!");
                try {
                    await this.createTable();
                    console.log('Table créée ou déjà existante');
                } catch (err) {
                    console.log('Erreur lors de la création de la table:', err);
                }
            } catch (error) {
                console.log("Erreur de connexion à la base de données:", error);
                this.connection = null;
            }
        }
    }

    async createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE,
            title VARCHAR(255),
            UNIQUE KEY (date)
        )
    `;
        await this.query(sql);
    }

    async close() {
        await this.connection.end();
    }

    async query(sql, params) {
        this.currentQueries++;
        try {
            const result = await this.connection.query(sql, params);
            this.currentQueries--;
            return result;
        } catch (error) {
            this.currentQueries--;
            throw error;
        }
    }

    async getEvent(date) {
        const [rows] = await this.query('SELECT * FROM events WHERE date = ?', [date]);
        return rows[0];
    }

    async updateEvent(date, title) {
        await this.query('INSERT INTO events (date, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = ?', [date, title, title]);
    }

    async deleteEvent(date) {
        await this.query('DELETE FROM events WHERE date = ?', [date]);
    }

    async getTotalEvents() {
        const [rows] = await this.query('SELECT COUNT(*) as total FROM events');
        return rows[0].total;
    }

    async getMonthEvents(year, month) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const [rows] = await this.query('SELECT COUNT(*) as total FROM events WHERE date BETWEEN ? AND ?', [startOfMonth, endOfMonth]);
        return rows[0].total;
    }

    isOverloaded() {
        return this.currentQueries > this.config.database.maxQueries;
    }
}

module.exports = DBManager;
