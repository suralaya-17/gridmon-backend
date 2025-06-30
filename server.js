const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  const conn = await pool.getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS beban (
      id VARCHAR(50) PRIMARY KEY,
      bay VARCHAR(100),
      tanggal DATE,
      jam VARCHAR(10),
      arus FLOAT,
      daya FLOAT,
      daya_reaktif FLOAT,
      tegangan FLOAT,
      timestamp BIGINT
    )
  `);
  conn.release();
})();

app.get('/api/beban', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM beban');
  res.json(rows);
});

app.post('/api/beban', async (req, res) => {
  const { bay, tanggal, jam, arus, daya, daya_reaktif, tegangan } = req.body;
  const id = Date.now().toString();
  const timestamp = Date.now();

  try {
    const [check] = await pool.query(
      'SELECT * FROM beban WHERE bay = ? AND tanggal = ? AND jam = ?',
      [bay, tanggal, jam]
    );
    if (check.length > 0) {
      return res.status(409).json({ message: 'Data duplikat' });
    }

    await pool.query(
      `INSERT INTO beban (id, bay, tanggal, jam, arus, daya, daya_reaktif, tegangan, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bay, tanggal, jam, arus, daya, daya_reaktif, tegangan, timestamp]
    );
    res.status(201).json({ message: 'Data disimpan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menyimpan data' });
  }
});

app.put('/api/beban/:id', async (req, res) => {
  const { id } = req.params;
  const { bay, tanggal, jam, arus, daya, daya_reaktif, tegangan } = req.body;

  try {
    const [check] = await pool.query(
      'SELECT * FROM beban WHERE bay = ? AND tanggal = ? AND jam = ? AND id != ?',
      [bay, tanggal, jam, id]
    );
    if (check.length > 0) {
      return res.status(409).json({ message: 'Data duplikat saat update' });
    }

    await pool.query(
      `UPDATE beban SET bay=?, tanggal=?, jam=?, arus=?, daya=?, daya_reaktif=?, tegangan=?, timestamp=?
       WHERE id=?`,
      [bay, tanggal, jam, arus, daya, daya_reaktif, tegangan, Date.now(), id]
    );
    res.json({ message: 'Data diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update' });
  }
});

app.delete('/api/beban/:id', async (req, res) => {
  await pool.query('DELETE FROM beban WHERE id = ?', [req.params.id]);
  res.json({ message: 'Data dihapus' });
});

app.delete('/api/beban', async (req, res) => {
  await pool.query('DELETE FROM beban');
  res.json({ message: 'Semua data dihapus' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
