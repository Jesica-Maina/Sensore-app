const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('sensore.db');

db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY, name TEXT, role TEXT, password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS pressure_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id TEXT, 
        timestamp TEXT, 
        row INTEGER, 
        col INTEGER, 
        pressure INTEGER
    )`);
    
    // Add users
    db.run(`INSERT OR IGNORE INTO users VALUES ('patient123','John Doe','patient','pass123')`);
    db.run(`INSERT OR IGNORE INTO users VALUES ('clinician456','Dr. Smith','clinician','pass456')`);
    db.run(`INSERT OR IGNORE INTO users VALUES ('admin789','Admin','admin','admin')`);
    
    // ADD 20 DEMO PRESSURE READINGS!
    const demoData = [
        ['patient123', '2026-02-10T23:00:01', 1, 1, 45],
        ['patient123', '2026-02-10T23:00:02', 1, 2, 67],
        ['patient123', '2026-02-10T23:00:03', 1, 3, 23],
        ['patient123', '2026-02-10T23:00:04', 2, 1, 89],
        ['patient123', '2026-02-10T23:00:05', 2, 2, 120],
        ['patient123', '2026-02-10T23:00:06', 2, 3, 34],
        ['patient123', '2026-02-10T23:00:07', 3, 1, 78],
        ['patient123', '2026-02-10T23:00:08', 3, 2, 156],
        ['patient123', '2026-02-10T23:00:09', 3, 3, 45],
        ['patient123', '2026-02-10T23:05:01', 4, 1, 92],
        ['patient123', '2026-02-10T23:05:02', 4, 2, 67],
        ['patient123', '2026-02-10T23:05:03', 4, 3, 134],
        ['patient123', '2026-02-10T23:05:04', 5, 1, 23],
        ['patient123', '2026-02-10T23:05:05', 5, 2, 89],
        ['patient123', '2026-02-10T23:05:06', 5, 3, 167],
        ['patient123', '2026-02-10T23:10:01', 6, 1, 45],
        ['patient123', '2026-02-10T23:10:02', 6, 2, 123],
        ['patient123', '2026-02-10T23:10:03', 6, 3, 78],
        ['patient123', '2026-02-10T23:10:04', 7, 1, 156],
        ['patient123', '2026-02-10T23:10:05', 7, 2, 34]
    ];
    
    demoData.forEach(([user_id, timestamp, row, col, pressure]) => {
        db.run(`INSERT INTO pressure_data (user_id, timestamp, row, col, pressure) VALUES (?,?,?,?,?)`, 
               [user_id, timestamp, row, col, pressure]);
    });
    
    console.log('✅ Database ready with 20 pressure readings!');
});

app.post('/api/login', (req, res) => {
    const { userId, password } = req.body;
    db.get("SELECT * FROM users WHERE user_id=? AND password=?", [userId, password], (err, user) => {
        if (user) res.json({ success: true, user });
        else res.json({ success: false });
    });
});

app.get('/api/data/:userId', (req, res) => {
    const { userId } = req.params;
    const sessionUser = req.query.sessionUser;
    
    db.get("SELECT role FROM users WHERE user_id=?", [sessionUser], (err, session) => {
        if (session && (session.role === 'admin' || sessionUser === userId)) {
            db.all("SELECT * FROM pressure_data WHERE user_id=? ORDER BY id DESC", [userId], (err, data) => {
                res.json(data);
            });
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    });
});

app.listen(3000, () => console.log('🚀 http://localhost:3000'));
