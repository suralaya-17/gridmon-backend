# Gridmon Backend (MySQL + Railway)

## 📦 Instalasi Lokal
```bash
npm install
npm start
```

## ⚙️ Variabel Lingkungan
Buat file `.env` berdasarkan `.env.example` dan isi dengan kredensial MySQL Anda.

## 🚀 Deploy ke Railway
1. Login ke [https://railway.app](https://railway.app)
2. Buat proyek baru, pilih MySQL Database
3. Tambahkan project dari GitHub (atau upload manual)
4. Atur Environment Variables dari tab "Variables"

## 📡 Endpoint API
- GET     `/api/beban` → ambil semua data
- POST    `/api/beban` → simpan data
- PUT     `/api/beban/:id` → edit data
- DELETE  `/api/beban/:id` → hapus 1 data
- DELETE  `/api/beban` → hapus semua data
