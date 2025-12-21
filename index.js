require('dotenv').config();
const cloudscraper = require('cloudscraper');

// Konfigurasi dari .env
const CONFIG = {
  userId: process.env.USER_ID,
  authToken: process.env.AUTH_TOKEN,
  privyToken: process.env.PRIVY_TOKEN,
  discordWebhook: process.env.DISCORD_WEBHOOK_URL,
  interval: parseInt(process.env.CHECK_INTERVAL) || 60000,
  sendInterval: parseInt(process.env.DISCORD_INTERVAL) || 300000 // Kirim ke Discord setiap 5 menit
};

let lastDiscordSend = 0;
let previousData = null;

// Base headers yang digunakan untuk semua request
const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'DNT': '1'
};

// Fungsi untuk mendapatkan stats referral
async function getReferralStats() {
  const headers = {
    ...baseHeaders,
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${CONFIG.authToken}`
  };

  try {
    const response = await cloudscraper.get('https://api.dawninternet.com/referral/stats', {
      headers: headers,
      json: true
    });
    return response;
  } catch (error) {
    throw new Error(`Referral Stats Request Failed: ${error.message}`);
  }
}

// Fungsi untuk mendapatkan points
async function getPoints() {
  const headers = {
    ...baseHeaders,
    'Accept': '*/*',
    'Authorization': `Bearer ${CONFIG.authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await cloudscraper.get(`https://api.dawninternet.com/point?user_id=${CONFIG.userId}`, {
      headers: headers,
      json: true
    });
    return response;
  } catch (error) {
    throw new Error(`Points Request Failed: ${error.message}`);
  }
}

// Fungsi untuk kirim ke Discord
async function sendToDiscord(referralData, pointsData, isUpdate = false) {
  if (!CONFIG.discordWebhook) {
    console.log('⚠️  Discord webhook tidak dikonfigurasi');
    return;
  }

  const https = require('https');

  const totalPoints = pointsData.points + pointsData.referral_points;
  let changeText = '';

  if (isUpdate && previousData) {
    const prevTotal = previousData.points.points + previousData.points.referral_points;
    const pointsDiff = totalPoints - prevTotal;
    const referralDiff = referralData.totalReferrals - previousData.referral.totalReferrals;
    
    if (pointsDiff !== 0 || referralDiff !== 0) {
      changeText = '\n\n**📈 Perubahan:**\n';
      if (pointsDiff > 0) changeText += `• Points: +${formatNumber(pointsDiff)}\n`;
      if (referralDiff > 0) changeText += `• Referrals: +${referralDiff}\n`;
    }
  }

  const embed = {
    embeds: [{
      title: '🌅 Dawn Internet Monitor',
      description: `**Status Update** - ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
      color: isUpdate ? 3447003 : 5763719, // Biru untuk update, hijau untuk notifikasi
      fields: [
        {
          name: '👥 Referral Stats',
          value: [
            `**Code:** \`${referralData.referralCode}\``,
            `**Total Referrals:** ${referralData.totalReferrals}`,
            `**Points dari Referral:** ${formatNumber(referralData.totalPointsEarned)}`,
            `**Usage:** ${referralData.usageCount}/${referralData.maxUses}`
          ].join('\n'),
          inline: false
        },
        {
          name: '💰 Points Info',
          value: [
            `**Personal Points:** ${formatNumber(pointsData.points)}`,
            `**Referral Points:** ${formatNumber(pointsData.referral_points)}`,
            `**Total Points:** ${formatNumber(totalPoints)}`
          ].join('\n'),
          inline: false
        }
      ],
      footer: {
        text: 'Dawn Internet Monitor'
      },
      timestamp: new Date().toISOString()
    }]
  };

  if (changeText) {
    embed.embeds[0].description += changeText;
  }

  try {
    const webhookUrl = new URL(CONFIG.discordWebhook);
    const payload = JSON.stringify(embed);

    const options = {
      hostname: webhookUrl.hostname,
      path: webhookUrl.pathname + webhookUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Berhasil kirim ke Discord');
      } else {
        console.error(`❌ Discord error: HTTP ${res.statusCode}`);
      }
    });

    req.on('error', (error) => {
      console.error('❌ Gagal kirim ke Discord:', error.message);
    });

    req.write(payload);
    req.end();
  } catch (error) {
    console.error('❌ Gagal kirim ke Discord:', error.message);
  }
}

// Fungsi untuk format angka dengan pemisah ribuan
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Fungsi untuk format tanggal
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Fungsi untuk menampilkan data di console
function displayData(referralData, pointsData) {
  console.clear();
  console.log('='.repeat(60));
  console.log('           DAWN INTERNET MONITOR');
  console.log('='.repeat(60));
  console.log(`\nWaktu Check: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
  
  console.log('\n📊 REFERRAL STATS:');
  console.log('-'.repeat(60));
  console.log(`Referral Code      : ${referralData.referralCode}`);
  console.log(`Total Referrals    : ${referralData.totalReferrals}`);
  console.log(`Points dari Referral: ${formatNumber(referralData.totalPointsEarned)}`);
  console.log(`Usage Count        : ${referralData.usageCount}/${referralData.maxUses}`);
  console.log(`Code Created       : ${formatDate(referralData.codeCreatedAt)}`);
  
  console.log('\n💰 POINTS INFO:');
  console.log('-'.repeat(60));
  console.log(`Personal Points    : ${formatNumber(pointsData.points)}`);
  console.log(`Referral Points    : ${formatNumber(pointsData.referral_points)}`);
  console.log(`Total Points       : ${formatNumber(pointsData.points + pointsData.referral_points)}`);
  console.log(`Last Updated       : ${formatDate(pointsData.updated_at)}`);
  
  // Tampilkan perubahan jika ada
  if (previousData) {
    const prevTotal = previousData.points.points + previousData.points.referral_points;
    const currentTotal = pointsData.points + pointsData.referral_points;
    const pointsDiff = currentTotal - prevTotal;
    const referralDiff = referralData.totalReferrals - previousData.referral.totalReferrals;
    
    if (pointsDiff !== 0 || referralDiff !== 0) {
      console.log('\n📈 PERUBAHAN:');
      console.log('-'.repeat(60));
      if (pointsDiff > 0) console.log(`Points             : +${formatNumber(pointsDiff)}`);
      if (referralDiff > 0) console.log(`Referrals          : +${referralDiff}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Next check dalam ${CONFIG.interval / 1000} detik`);
  console.log(`Next Discord log dalam ${Math.round((CONFIG.sendInterval - (Date.now() - lastDiscordSend)) / 1000)} detik`);
  console.log('Tekan Ctrl+C untuk berhenti');
  console.log('='.repeat(60));
}

// Fungsi utama untuk monitoring
async function monitor() {
  try {
    console.log('\n⏳ Mengambil data...');
    
    const [referralData, pointsData] = await Promise.all([
      getReferralStats(),
      getPoints()
    ]);
    
    displayData(referralData, pointsData);
    
    // Kirim ke Discord jika sudah waktunya atau ada perubahan signifikan
    const now = Date.now();
    const shouldSendScheduled = (now - lastDiscordSend) >= CONFIG.sendInterval;
    
    let shouldSendUpdate = false;
    if (previousData) {
      const prevTotal = previousData.points.points + previousData.points.referral_points;
      const currentTotal = pointsData.points + pointsData.referral_points;
      const pointsDiff = currentTotal - prevTotal;
      const referralDiff = referralData.totalReferrals - previousData.referral.totalReferrals;
      
      shouldSendUpdate = pointsDiff > 0 || referralDiff > 0;
    }
    
    if (shouldSendScheduled || shouldSendUpdate) {
      await sendToDiscord(referralData, pointsData, shouldSendUpdate);
      lastDiscordSend = now;
    }
    
    // Simpan data untuk perbandingan
    previousData = {
      referral: referralData,
      points: pointsData
    };
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('Mencoba lagi dalam 30 detik...\n');
    
    // Kirim notifikasi error ke Discord
    if (CONFIG.discordWebhook) {
      try {
        const https = require('https');
        const webhookUrl = new URL(CONFIG.discordWebhook);
        const errorEmbed = {
          embeds: [{
            title: '⚠️ Error Dawn Monitor',
            description: `**Error:** ${error.message}`,
            color: 15158332, // Merah
            timestamp: new Date().toISOString()
          }]
        };
        
        const payload = JSON.stringify(errorEmbed);
        const options = {
          hostname: webhookUrl.hostname,
          path: webhookUrl.pathname + webhookUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(options, (res) => {
          // Silent
        });

        req.on('error', (e) => {
          console.error('❌ Gagal kirim error ke Discord:', e.message);
        });

        req.write(payload);
        req.end();
      } catch (e) {
        console.error('❌ Gagal kirim error ke Discord:', e.message);
      }
    }
  }
}

// Validasi konfigurasi
function validateConfig() {
  const required = ['USER_ID', 'AUTH_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Error: Konfigurasi berikut tidak ditemukan di .env:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  if (!CONFIG.discordWebhook) {
    console.log('⚠️  Warning: DISCORD_WEBHOOK_URL tidak diset, logs hanya di console');
  }
}

// Jalankan validasi
validateConfig();

// Jalankan monitoring pertama kali
console.log('🚀 Dawn Internet Monitor dimulai...');
console.log(`📊 Check interval: ${CONFIG.interval / 1000} detik`);
console.log(`📤 Discord interval: ${CONFIG.sendInterval / 1000} detik\n`);

monitor();

// Set interval untuk monitoring berkelanjutan
setInterval(monitor, CONFIG.interval);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor dihentikan. Terima kasih!');
  process.exit(0);
});
