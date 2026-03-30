# 🌅🌿 Dawn & Grass Internet Monitor

Monitor akun **Dawn Internet** dan **Grass** secara real-time dengan notifikasi ke Discord! Script Node.js ini memantau points, referral, dan device aktif secara otomatis 24/7.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Webhook-7289DA.svg)](https://discord.com/)

## ✨ Fitur

- 🔄 **Dual Monitor**: Pantau Dawn Internet & Grass sekaligus dalam satu script
- 📊 **Real-time Console**: Tampilan data lengkap langsung di terminal
- 📤 **Discord Notifications**: Notifikasi otomatis ke Discord channel
- 📈 **Change Detection**: Deteksi perubahan points dan referral baru
- ⚡ **Instant Alerts**: Kirim notifikasi segera saat ada perubahan
- ⚠️ **Error Handling**: Notifikasi error otomatis ke Discord
- 🎨 **Rich Embeds**: Format cantik dengan warna dan emoji
- ⚙️ **Configurable**: Interval dapat disesuaikan via environment variables
- 🛡️ **Cloudflare Bypass**: Auto-bypass Cloudflare dengan cloudscraper

## 📋 Prerequisites

- Node.js 20 atau lebih tinggi
- npm
- Akun Dawn Internet dan/atau akun Grass
- Discord Server dengan webhook access (opsional tapi recommended)

## 🚀 Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/hokireceh/dawn-internet-monitor.git
   cd dawn-internet-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables** — isi sesuai panduan di bawah

## ⚙️ Configuration

### 🌅 Dapatkan Token Dawn Internet

1. Login ke [Dawn Internet](https://www.dawninternet.com/)
2. Buka **Developer Tools** (F12) → tab **Network**
3. Refresh halaman, cari request ke `api.dawninternet.com`
4. Buka tab **Headers**, ambil:
   - `USER_ID`: dari parameter `user_id` di URL
   - `AUTH_TOKEN`: dari header `Authorization` (copy yang **setelah** kata "Bearer ")

### 🌿 Dapatkan Token Grass

1. Login ke [app.getgrass.io](https://app.getgrass.io/)
2. Buka **Developer Tools** (F12) → tab **Network**
3. Refresh halaman, cari request ke `api.grass.io`
4. Buka tab **Headers**, ambil nilai dari header `authorization` (keseluruhan JWT, dimulai dengan `eyJ...`)

### Discord Webhook

1. Buka **Discord Server** → **Server Settings** → **Integrations** → **Webhooks**
2. Klik **New Webhook**, beri nama dan pilih channel
3. Copy **Webhook URL**

Kamu bisa menggunakan satu webhook yang sama untuk Dawn dan Grass, atau webhook terpisah dengan mengisi `GRASS_DISCORD_WEBHOOK_URL`.

### Environment Variables

```env
# ── Dawn Internet ─────────────────────────────────────────
USER_ID=your_dawn_user_id
AUTH_TOKEN=your_dawn_auth_token

# ── Grass ─────────────────────────────────────────────────
GRASS_AUTH_TOKEN=your_grass_jwt_token

# ── Discord ───────────────────────────────────────────────
# Digunakan untuk Dawn (dan Grass jika GRASS_DISCORD_WEBHOOK_URL tidak diset)
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# (Opsional) Webhook terpisah khusus Grass
# GRASS_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# ── Interval (milliseconds) ───────────────────────────────
CHECK_INTERVAL=600000      # Check API setiap 600 detik (10 menit)
DISCORD_INTERVAL=600000    # Kirim Discord setiap 600 detik (10 menit)
```

**Required (minimal salah satu)**: `AUTH_TOKEN` + `USER_ID` (Dawn) atau `GRASS_AUTH_TOKEN` (Grass)  
**Optional**: `DISCORD_WEBHOOK_URL`, `GRASS_DISCORD_WEBHOOK_URL`, `CHECK_INTERVAL`, `DISCORD_INTERVAL`

## 🎮 Usage

### Start Monitor
```bash
npm start
```

### Development Mode (auto-restart dengan nodemon)
```bash
npm run dev
```

### Stop Monitor
Tekan `Ctrl + C`

## 📊 Output

### Console Output

```
============================================================
         DAWN & GRASS INTERNET MONITOR
============================================================
Waktu: 31/3/2026, 03.53.52

============================================================
              DAWN INTERNET MONITOR
============================================================
📊 REFERRAL STATS:
------------------------------------------------------------
Referral Code       : 8syn4h
Total Referrals     : 3
Points dari Referral: 356,529
Usage Count         : 0/5000

💰 POINTS INFO:
------------------------------------------------------------
Personal Points     : 281,245
Referral Points     : 356,337
Total Points        : 637,582

============================================================
                  GRASS MONITOR
============================================================
👤 USER INFO:
------------------------------------------------------------
Username            : doaemak
Country             : Indonesia

💰 POINTS:
------------------------------------------------------------
Total Points        : 1,719,478.08
Uptime Points       : 1,560,138
Referral Points     : 52,990
Desktop Points      : 558,004

👥 REFERRAL:
------------------------------------------------------------
Referral Code       : sTt1b0dE9hniV8-
Total Referrals     : 7
Qualified Referrals : 2

📱 ACTIVE DEVICES:
------------------------------------------------------------
Device 1 [desktop]
  IP Score          : 75
  Multiplier        : x2

🏆 EPOCH EARNINGS:
------------------------------------------------------------
Epoch Name          : Epoch 17
Period              : 2026-03-04 → 2026-04-03
Points this Epoch   : 57,454.16

============================================================
Next check dalam 600 detik
============================================================
```

### Discord Notification

Setiap layanan mengirim embed terpisah ke Discord berisi:
- **Dawn**: Referral stats, personal points, referral points, total points, perubahan sejak check sebelumnya
- **Grass**: User info, breakdown points lengkap, referral, daftar active devices (IP score & multiplier), epoch earnings saat ini

## 📁 Project Structure

```
dawn-grass-monitor/
├── index.js           # Main monitoring script (Dawn + Grass)
├── package.json       # Dependencies & scripts
├── .gitignore         # Git configuration
├── README.md          # Dokumentasi
└── LICENSE            # MIT License
```

## 🔧 Troubleshooting

### Error: "Tidak ada konfigurasi valid"
- Pastikan minimal satu layanan dikonfigurasi (`AUTH_TOKEN`+`USER_ID` untuk Dawn, atau `GRASS_AUTH_TOKEN` untuk Grass)

### Error: "Invalid token" / HTTP 401
- Token sudah expired — login ulang ke dashboard layanan yang bersangkutan
- Ambil token baru dari Developer Tools (Network tab)
- Update environment variable dengan token baru

### Error: "Gagal kirim ke Discord"
- Periksa Webhook URL sudah benar dan masih aktif
- Pastikan webhook belum dihapus dari Discord

### Monitor tidak start
- Pastikan Node.js sudah terinstall: `node --version`
- Jalankan `npm install` untuk install dependencies
- Periksa console output untuk detail error

## 🚀 Deployment

### Deploy di Replit
1. Import repository ke Replit
2. Set environment variables melalui tab **Secrets**
3. Workflow `npm start` sudah otomatis terkonfigurasi

### Deploy di Server/VPS
1. Clone repository & setup environment variables
2. Install PM2: `npm install -g pm2`
3. Start: `pm2 start index.js --name "dawn-grass-monitor"`
4. Simpan config: `pm2 save && pm2 startup`

## 📝 Dependencies

- **dotenv**: Manage environment variables
- **cloudscraper**: Bypass Cloudflare protection
- **nodemon** (dev): Auto-restart saat file berubah

## 📝 License

This project is [MIT](LICENSE) licensed.

## ⚠️ Disclaimer

Tool ini dibuat untuk keperluan monitoring pribadi. Gunakan dengan bijak dan patuhi Terms of Service dari Dawn Internet dan Grass. Developer tidak bertanggung jawab atas penggunaan yang melanggar ToS.

## 💖 Support

Jika tool ini bermanfaat, berikan ⭐ di repository!

## 📞 Contact

- GitHub: [@hokireceh](https://github.com/hokireceh)
- Repository: [dawn-internet-monitor](https://github.com/hokireceh/dawn-internet-monitor)

---

**Made with ❤️ by [hokireceh](https://github.com/hokireceh)**
