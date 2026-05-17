# 🌅🌿 Dawn & Grass Internet Monitor

Monitor akun **Dawn Internet** dan **Grass** secara real-time dengan notifikasi ke Discord! Script Node.js ini memantau points, referral, dan device aktif secara otomatis 24/7 — sekaligus **menjalankan Grass WebSocket node** dan **Dawn ping** untuk mengumpulkan uptime points terus-menerus.

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
- 🌐 **Dawn Ping**: HTTP ping otomatis setiap 20 menit ke endpoint Dawn untuk mengumpulkan uptime points
- 🔌 **Grass WebSocket Node**: Menjalankan node Grass secara otomatis (checkin → WebSocket → earn uptime points) dengan auto-reconnect

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

> ⚠️ Token Dawn bertipe `session` dan berlaku selama **30 hari**. Perbarui setiap bulan.

### 🌿 Dapatkan Token Grass

1. Login ke [app.getgrass.io](https://app.getgrass.io/)
2. Buka **Developer Tools** (F12) → tab **Network**
3. Refresh halaman, cari request ke `api.grass.io`
4. Buka tab **Headers**, ambil nilai dari header `authorization` (keseluruhan JWT, dimulai dengan `eyJ...`)

> ⚠️ Token Grass umumnya berlaku selama **1 tahun**. Perbarui jika muncul error 401.

### Discord Webhook

1. Buka **Discord Server** → **Server Settings** → **Integrations** → **Webhooks**
2. Klik **New Webhook**, beri nama dan pilih channel
3. Copy **Webhook URL**

Kamu bisa menggunakan satu webhook yang sama untuk Dawn dan Grass, atau webhook terpisah dengan mengisi `GRASS_DISCORD_WEBHOOK_URL`.

### Environment Variables

```env
# ── Dawn Internet ─────────────────────────────────────────
USER_ID=your_dawn_user_id
AUTH_TOKEN=your_dawn_auth_token_without_bearer_prefix

# ── Grass ─────────────────────────────────────────────────
GRASS_AUTH_TOKEN=your_grass_jwt_token

# ── Discord ───────────────────────────────────────────────
# Digunakan untuk Dawn (dan Grass jika GRASS_DISCORD_WEBHOOK_URL tidak diset)
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# (Opsional) Webhook terpisah khusus Grass
# GRASS_DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# ── Interval (milliseconds) ───────────────────────────────
CHECK_INTERVAL=300000      # Check API setiap 300 detik (5 menit), default: 300000
DISCORD_INTERVAL=600000    # Kirim Discord setiap 600 detik (10 menit), default: 600000
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
Waktu: 18/5/2026, 01.43.00
⏳ Dawn: Mengambil data...
🔌 Grass Node: Checkin ke director...

============================================================
              DAWN INTERNET MONITOR
============================================================
Waktu Check: 18/5/2026, 01.43.00
📊 REFERRAL STATS:
------------------------------------------------------------
Referral Code       : xxxxxxxx
Total Referrals     : 3
Points dari Referral: 357,389
Usage Count         : 0/5000

💰 POINTS INFO:
------------------------------------------------------------
Personal Points     : 304,645
Referral Points     : 357,197
Total Points        : 661,842

✅ Dawn Ping ✓ — Pong received at 18/5/2026, 01.43.00

============================================================
                  GRASS MONITOR
============================================================
👤 USER INFO:
------------------------------------------------------------
Username            : yourUsername
Country             : Indonesia
Wallet              : YourWalletAddress

💰 POINTS:
------------------------------------------------------------
Total Points        : 1,871,387.95
Uptime Points       : 1,711,903
Referral Points     : 52,990
Desktop Points      : 709,710
Android Points      : 23,211
Extension Points    : 6,512

👥 REFERRAL:
------------------------------------------------------------
Referral Code       : xxxxxxxxxxxxxxx
Total Referrals     : 7
Qualified Referrals : 2

📱 ACTIVE DEVICES:
------------------------------------------------------------
Device 1 [extension]
  IP Score          : 75
  Multiplier        : x1
  Agg Uptime        : 21j 13m
  Last Connected    : 18/05/2026, 01.36.07
Device 2 [desktop]
  IP Score          : 75
  Multiplier        : x2
  Agg Uptime        : 21j 13m

🏆 EPOCH EARNINGS:
------------------------------------------------------------
Epoch Name          : Epoch 19
Period              : 2026-05-07 → 2026-06-07
Points this Epoch   : 30,433.62
Uptime this Epoch   : 202j 56m

✅ Grass Node: WebSocket OPEN — Node aktif, earning uptime points!

============================================================
Next check dalam 300 detik
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
- Dawn: token berlaku 30 hari | Grass: token berlaku ~1 tahun

### Error: "Gagal kirim ke Discord"
- Periksa Webhook URL sudah benar dan masih aktif
- Pastikan webhook belum dihapus dari Discord

### Grass Node tidak connect
- Pastikan `GRASS_AUTH_TOKEN` valid dan belum expired
- Cek log untuk pesan error dari WebSocket atau checkin endpoint
- Script akan auto-reconnect secara otomatis jika koneksi terputus

### Monitor tidak start
- Pastikan Node.js sudah terinstall: `node --version`
- Jalankan `npm install` untuk install dependencies
- Periksa console output untuk detail error

## 🚀 Deployment

### Deploy di Replit
1. Import repository ke Replit
2. Set environment variables melalui tab **Secrets**
3. Workflow `node index.js` sudah otomatis terkonfigurasi

### Deploy di Server/VPS
1. Clone repository & setup environment variables
2. Install PM2: `npm install -g pm2`
3. Start: `pm2 start index.js --name "dawn-grass-monitor"`
4. Simpan config: `pm2 save && pm2 startup`

## 📝 Dependencies

- **dotenv**: Manage environment variables
- **cloudscraper**: Bypass Cloudflare protection
- **ws**: WebSocket client untuk Grass node
- **uuid**: Generate UUID untuk extension/browser ID
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
