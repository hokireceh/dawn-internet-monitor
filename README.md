# 🌅 Dawn Internet Monitor

Monitor akun Dawn Internet Anda secara real-time dengan notifikasi ke Discord! Script Node.js ini akan memantau points dan referral Anda secara otomatis 24/7.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-Webhook-7289DA.svg)](https://discord.com/)

## ✨ Fitur

- 🔄 **Auto-Monitoring**: Cek points & referrals secara otomatis
- 📊 **Real-time Console**: Tampilan data langsung di terminal
- 📤 **Discord Notifications**: Notifikasi otomatis ke Discord channel
- 📈 **Change Detection**: Deteksi perubahan points dan referral baru
- ⚡ **Instant Alerts**: Kirim notifikasi segera saat ada perubahan
- ⚠️ **Error Handling**: Notifikasi error otomatis ke Discord
- 🎨 **Rich Embeds**: Format cantik dengan warna dan emoji
- ⚙️ **Configurable**: Interval dapat disesuaikan via .env
- 🛡️ **Cloudflare Protection**: Auto-bypass Cloudflare dengan cloudscraper

## 📋 Prerequisites

- Node.js 20 atau lebih tinggi
- npm atau yarn
- Akun Dawn Internet
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

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit file `.env`** dengan data Anda (lihat bagian Configuration)

## ⚙️ Configuration

### Dapatkan Token Dawn Internet

1. Login ke [Dawn Internet](https://www.dawninternet.com/)
2. Buka **Developer Tools** (F12)
3. Buka tab **Network**
4. Refresh halaman
5. Cari request ke `api.dawninternet.com` (bisa referral/stats atau point)
6. Lihat **Headers** untuk mendapatkan:
   - `USER_ID`: dari URL parameter `user_id`
   - `AUTH_TOKEN`: dari header `Authorization` (copy yang setelah "Bearer ")

**Catatan**: Anda hanya perlu AUTH_TOKEN, tidak perlu PRIVY_TOKEN. Token ini sudah cukup untuk kedua endpoint (referral stats dan points).

### Setup Discord Webhook

1. Buka **Discord Server**
2. **Server Settings** → **Integrations** → **Webhooks**
3. Klik **Create Webhook** atau **New Webhook**
4. Beri nama (misal: "Dawn Monitor")
5. Pilih channel tujuan
6. **Copy Webhook URL**
7. Paste ke `.env` sebagai `DISCORD_WEBHOOK_URL`

### Environment Variables

```env
# Dawn Internet API Configuration
USER_ID=your_user_id_here
AUTH_TOKEN=your_auth_token_here

# Discord Webhook URL (optional - logs hanya di console jika tidak diset)
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/YOUR_ID/YOUR_TOKEN

# Interval Configuration (dalam milliseconds)
CHECK_INTERVAL=60000       # Check API setiap 60 detik (1 menit)
DISCORD_INTERVAL=300000    # Kirim ke Discord setiap 300 detik (5 menit)
```

**Required**: USER_ID, AUTH_TOKEN  
**Optional**: DISCORD_WEBHOOK_URL, CHECK_INTERVAL, DISCORD_INTERVAL

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
           DAWN INTERNET MONITOR
============================================================

Waktu Check: 21/12/2025, 16.15.34

📊 REFERRAL STATS:
------------------------------------------------------------
Referral Code      : 8syn4h
Total Referrals    : 3
Points dari Referral: 355,513
Usage Count        : 0/5000
Code Created       : 26/09/2025, 11.12.36

💰 POINTS INFO:
------------------------------------------------------------
Personal Points    : 244,565
Referral Points    : 355,321
Total Points       : 599,886
Last Updated       : 02/10/2025, 09.17.16

============================================================
Next check dalam 60 detik
Next Discord log dalam 245 detik
Tekan Ctrl+C untuk berhenti
============================================================
```

### Discord Notification
- **Rich Embed** dengan warna dan emoji
- **Timestamp** otomatis
- **Field terpisah** untuk Referral & Points
- **Change detection** ditampilkan jika ada perubahan points atau referral baru
- **Error alerts** otomatis jika terjadi masalah

## 📁 Project Structure

```
dawn-internet-monitor/
├── index.js           # Main monitoring script
├── package.json       # Dependencies & scripts
├── .env              # Environment variables (private)
├── .gitignore        # Git configuration
├── README.md         # Documentation
└── LICENSE           # MIT License
```

## 🔧 Troubleshooting

### Error: "Konfigurasi berikut tidak ditemukan di .env"
- Pastikan file `.env` sudah dibuat
- Periksa USER_ID dan AUTH_TOKEN sudah diisi dengan benar
- Jangan lupa copy AUTH_TOKEN tanpa "Bearer " prefix

### Error: "Invalid token" (HTTP 401)
- Token Anda sudah expired (token expire setiap ~2.5 jam)
- Login ulang ke Dawn Internet
- Ambil token baru dari Developer Tools (Network tab)
- Update di file `.env`

### Error: "Gagal kirim ke Discord"
- Periksa Discord Webhook URL sudah benar
- Pastikan webhook masih aktif (belum didelete dari Discord)
- Pastikan bot memiliki permission write message di channel yang dituju

### Monitor tidak start
- Pastikan Node.js sudah terinstall: `node --version`
- Run `npm install` untuk install dependencies
- Periksa console output untuk error messages

## 🚀 Deployment

### Deploy di Replit
1. Fork/import repository ke Replit
2. Setup `.env` dengan secrets
3. Run `npm start` atau setup workflow untuk auto-start
4. Keep always on (untuk Replit paid plan)

### Deploy di Server/VPS
1. Clone repository
2. Setup `.env` dengan credentials Anda
3. Install PM2 untuk persistent process: `npm install -g pm2`
4. Start dengan PM2: `pm2 start index.js --name "dawn-monitor"`
5. Save PM2 config: `pm2 save`

## 📝 Dependencies

- **dotenv**: Manage environment variables
- **cloudscraper**: Bypass Cloudflare protection
- **nodemon** (dev): Auto-restart saat file berubah

## 🤝 Contributing

Contributions, issues, dan feature requests sangat diterima!

1. Fork repository
2. Create branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is [MIT](LICENSE) licensed.

## ⚠️ Disclaimer

Tool ini dibuat untuk keperluan monitoring pribadi. Gunakan dengan bijak dan patuhi Terms of Service dari Dawn Internet. Developer tidak bertanggung jawab atas penggunaan yang melanggar ToS.

## 💖 Support

Jika tool ini bermanfaat, berikan ⭐ di repository!

## 📞 Contact

- GitHub: [@hokireceh](https://github.com/hokireceh)
- Repository: [dawn-internet-monitor](https://github.com/hokireceh/dawn-internet-monitor)

---

**Made with ❤️ by [hokireceh](https://github.com/hokireceh)**
