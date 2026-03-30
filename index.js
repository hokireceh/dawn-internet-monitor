require('dotenv').config();
const cloudscraper = require('cloudscraper');

// Konfigurasi dari .env
const CONFIG = {
  // Dawn Internet
  userId: process.env.USER_ID,
  authToken: process.env.AUTH_TOKEN,
  discordWebhook: process.env.DISCORD_WEBHOOK_URL,
  // Grass
  grassAuthToken: process.env.GRASS_AUTH_TOKEN,
  grassDiscordWebhook: process.env.GRASS_DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL,
  // Interval
  interval: parseInt(process.env.CHECK_INTERVAL) || 60000,
  sendInterval: parseInt(process.env.DISCORD_INTERVAL) || 300000
};

let lastDiscordSendDawn = 0;
let lastDiscordSendGrass = 0;
let previousDawnData = null;
let previousGrassData = null;

// Base headers
const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'DNT': '1'
};

// ============================================================
//  DAWN INTERNET FUNCTIONS
// ============================================================

async function getDawnReferralStats() {
  const headers = {
    ...baseHeaders,
    'Accept': 'application/json, text/plain, */*',
    'Authorization': `Bearer ${CONFIG.authToken}`
  };
  try {
    const response = await cloudscraper.get('https://api.dawninternet.com/referral/stats', {
      headers,
      json: true
    });
    return response;
  } catch (error) {
    throw new Error(`Dawn Referral Stats Request Failed: ${error.message}`);
  }
}

async function getDawnPoints() {
  const headers = {
    ...baseHeaders,
    'Accept': '*/*',
    'Authorization': `Bearer ${CONFIG.authToken}`,
    'Content-Type': 'application/json'
  };
  try {
    const response = await cloudscraper.get(`https://api.dawninternet.com/point?user_id=${CONFIG.userId}`, {
      headers,
      json: true
    });
    return response;
  } catch (error) {
    throw new Error(`Dawn Points Request Failed: ${error.message}`);
  }
}

// ============================================================
//  GRASS FUNCTIONS
// ============================================================

async function getGrassUser() {
  const headers = {
    ...baseHeaders,
    'Accept': 'application/json, text/plain, */*',
    'Authorization': CONFIG.grassAuthToken,
    'Sec-Fetch-Site': 'none'
  };
  try {
    const response = await cloudscraper.get('https://api.grass.io/retrieveUser', {
      headers,
      json: true
    });
    return response.result.data;
  } catch (error) {
    throw new Error(`Grass RetrieveUser Failed: ${error.message}`);
  }
}

async function getGrassActiveDevices() {
  const headers = {
    ...baseHeaders,
    'Accept': 'application/json, text/plain, */*',
    'Authorization': CONFIG.grassAuthToken,
    'Sec-Fetch-Site': 'none'
  };
  try {
    const response = await cloudscraper.get('https://api.grass.io/activeDevices', {
      headers,
      json: true
    });
    return response.result.data;
  } catch (error) {
    throw new Error(`Grass ActiveDevices Failed: ${error.message}`);
  }
}

async function getGrassEpochEarnings() {
  const headers = {
    ...baseHeaders,
    'Accept': 'application/json, text/plain, */*',
    'Authorization': CONFIG.grassAuthToken,
    'Sec-Fetch-Site': 'none'
  };
  try {
    const response = await cloudscraper.get('https://api.grass.io/epochEarnings?input=%7B%22limit%22%3A1%7D', {
      headers,
      json: true
    });
    const data = response.result.data.data;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    throw new Error(`Grass EpochEarnings Failed: ${error.message}`);
  }
}

// ============================================================
//  HELPERS
// ============================================================

function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(/\.00$/, '');
}

function formatDate(dateString) {
  if (!dateString) return '-';
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

function formatUptime(seconds) {
  if (!seconds) return '0j 0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}j ${m}m`;
}

// ============================================================
//  DISCORD NOTIFICATIONS
// ============================================================

async function sendDiscordEmbed(webhookUrl, embed) {
  if (!webhookUrl) return;
  const https = require('https');
  try {
    const url = new URL(webhookUrl);
    const payload = JSON.stringify({ embeds: [embed] });
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Berhasil kirim ke Discord');
        } else {
          console.error(`❌ Discord error: HTTP ${res.statusCode}`);
        }
        resolve();
      });
      req.on('error', (e) => {
        console.error('❌ Gagal kirim ke Discord:', e.message);
        resolve();
      });
      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error('❌ Gagal kirim ke Discord:', error.message);
  }
}

async function sendDawnToDiscord(referralData, pointsData, isUpdate = false) {
  if (!CONFIG.discordWebhook) return;

  const totalPoints = pointsData.points + pointsData.referral_points;
  let changeText = '';

  if (isUpdate && previousDawnData) {
    const prevTotal = previousDawnData.points.points + previousDawnData.points.referral_points;
    const pointsDiff = totalPoints - prevTotal;
    const referralDiff = referralData.totalReferrals - previousDawnData.referral.totalReferrals;
    if (pointsDiff !== 0 || referralDiff !== 0) {
      changeText = '\n\n**📈 Perubahan:**\n';
      if (pointsDiff > 0) changeText += `• Points: +${formatNumber(pointsDiff)}\n`;
      if (referralDiff > 0) changeText += `• Referrals: +${referralDiff}\n`;
    }
  }

  const embed = {
    title: '🌅 Dawn Internet Monitor',
    description: `**Status Update** - ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}${changeText}`,
    color: isUpdate ? 3447003 : 5763719,
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
    footer: { text: 'Dawn Internet Monitor' },
    timestamp: new Date().toISOString()
  };

  await sendDiscordEmbed(CONFIG.discordWebhook, embed);
}

async function sendGrassToDiscord(userData, devices, epochData, isUpdate = false) {
  if (!CONFIG.grassDiscordWebhook) return;

  let changeText = '';
  if (isUpdate && previousGrassData) {
    const pointsDiff = userData.totalPoints - previousGrassData.user.totalPoints;
    const referralDiff = userData.referralCount - previousGrassData.user.referralCount;
    if (pointsDiff !== 0 || referralDiff !== 0) {
      changeText = '\n\n**📈 Perubahan:**\n';
      if (pointsDiff > 0) changeText += `• Points: +${formatNumber(pointsDiff)}\n`;
      if (referralDiff > 0) changeText += `• Referrals: +${referralDiff}\n`;
    }
  }

  const deviceLines = devices && devices.length > 0
    ? devices.map(d =>
        `• ${d.type} | IP: ${d.ipAddress} | Score: ${d.ipScore} | x${d.multiplier} | Uptime: ${formatUptime(d.aggUptime)}`
      ).join('\n')
    : 'Tidak ada device aktif';

  const epochField = epochData ? [
    `**Epoch:** ${epochData.epochName}`,
    `**Period:** ${epochData.startDate} → ${epochData.endDate}`,
    `**Points Epoch:** ${formatNumber(epochData.totalPoints)}`,
    `**Uptime Epoch:** ${formatUptime(epochData.totalUptime)}`
  ].join('\n') : 'Tidak ada data epoch';

  const embed = {
    title: '🌿 Grass Monitor',
    description: `**Status Update** - ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}${changeText}`,
    color: isUpdate ? 3447003 : 5763719,
    fields: [
      {
        name: '👤 User Info',
        value: [
          `**Username:** ${userData.username}`,
          `**Email:** ${userData.email}`,
          `**Wallet:** \`${userData.walletAddress || '-'}\``,
          `**Country:** ${userData.country || '-'}`
        ].join('\n'),
        inline: false
      },
      {
        name: '💰 Points',
        value: [
          `**Total Points:** ${formatNumber(userData.totalPoints)}`,
          `**Uptime Points:** ${formatNumber(userData.uptimePoints)}`,
          `**Referral Points:** ${formatNumber(userData.referralPoints)}`,
          `**Desktop Points:** ${formatNumber(userData.desktopPoints)}`,
          `**Android Points:** ${formatNumber(userData.androidPoints)}`,
          `**Extension Points:** ${formatNumber(userData.extensionPoints)}`,
          `**Proxy Points:** ${formatNumber(userData.proxyPoints)}`
        ].join('\n'),
        inline: false
      },
      {
        name: '👥 Referral',
        value: [
          `**Code:** \`${userData.referralCode}\``,
          `**Total Referrals:** ${userData.referralCount}`,
          `**Qualified Referrals:** ${userData.qualifiedReferrals}`
        ].join('\n'),
        inline: false
      },
      {
        name: '📱 Active Devices',
        value: deviceLines,
        inline: false
      },
      {
        name: '🏆 Epoch Earnings',
        value: epochField,
        inline: false
      }
    ],
    footer: { text: 'Grass Monitor' },
    timestamp: new Date().toISOString()
  };

  await sendDiscordEmbed(CONFIG.grassDiscordWebhook, embed);
}

// ============================================================
//  DISPLAY
// ============================================================

function displayDawnData(referralData, pointsData) {
  console.log('\n' + '='.repeat(60));
  console.log('              DAWN INTERNET MONITOR');
  console.log('='.repeat(60));
  console.log(`Waktu Check: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);

  console.log('\n📊 REFERRAL STATS:');
  console.log('-'.repeat(60));
  console.log(`Referral Code       : ${referralData.referralCode}`);
  console.log(`Total Referrals     : ${referralData.totalReferrals}`);
  console.log(`Points dari Referral: ${formatNumber(referralData.totalPointsEarned)}`);
  console.log(`Usage Count         : ${referralData.usageCount}/${referralData.maxUses}`);
  if (referralData.codeCreatedAt) console.log(`Code Created        : ${formatDate(referralData.codeCreatedAt)}`);

  console.log('\n💰 POINTS INFO:');
  console.log('-'.repeat(60));
  console.log(`Personal Points     : ${formatNumber(pointsData.points)}`);
  console.log(`Referral Points     : ${formatNumber(pointsData.referral_points)}`);
  console.log(`Total Points        : ${formatNumber(pointsData.points + pointsData.referral_points)}`);
  if (pointsData.updated_at) console.log(`Last Updated        : ${formatDate(pointsData.updated_at)}`);

  if (previousDawnData) {
    const prevTotal = previousDawnData.points.points + previousDawnData.points.referral_points;
    const currentTotal = pointsData.points + pointsData.referral_points;
    const pointsDiff = currentTotal - prevTotal;
    const referralDiff = referralData.totalReferrals - previousDawnData.referral.totalReferrals;
    if (pointsDiff !== 0 || referralDiff !== 0) {
      console.log('\n📈 PERUBAHAN:');
      console.log('-'.repeat(60));
      if (pointsDiff > 0) console.log(`Points              : +${formatNumber(pointsDiff)}`);
      if (referralDiff > 0) console.log(`Referrals           : +${referralDiff}`);
    }
  }
}

function displayGrassData(userData, devices, epochData) {
  console.log('\n' + '='.repeat(60));
  console.log('                  GRASS MONITOR');
  console.log('='.repeat(60));

  console.log('\n👤 USER INFO:');
  console.log('-'.repeat(60));
  console.log(`Username            : ${userData.username}`);
  console.log(`Email               : ${userData.email}`);
  console.log(`Country             : ${userData.country || '-'}`);
  console.log(`Wallet              : ${userData.walletAddress || '-'}`);
  console.log(`IP Address          : ${userData.currentIpAddress || userData.ipAddress || '-'}`);

  console.log('\n💰 POINTS:');
  console.log('-'.repeat(60));
  console.log(`Total Points        : ${formatNumber(userData.totalPoints)}`);
  console.log(`Uptime Points       : ${formatNumber(userData.uptimePoints)}`);
  console.log(`Referral Points     : ${formatNumber(userData.referralPoints)}`);
  console.log(`Desktop Points      : ${formatNumber(userData.desktopPoints)}`);
  console.log(`Android Points      : ${formatNumber(userData.androidPoints)}`);
  console.log(`Extension Points    : ${formatNumber(userData.extensionPoints)}`);
  console.log(`Proxy Points        : ${formatNumber(userData.proxyPoints)}`);
  console.log(`Total Uptime        : ${formatUptime(userData.totalUptime)}`);

  console.log('\n👥 REFERRAL:');
  console.log('-'.repeat(60));
  console.log(`Referral Code       : ${userData.referralCode}`);
  console.log(`Total Referrals     : ${userData.referralCount}`);
  console.log(`Qualified Referrals : ${userData.qualifiedReferrals}`);

  if (devices && devices.length > 0) {
    console.log('\n📱 ACTIVE DEVICES:');
    console.log('-'.repeat(60));
    devices.forEach((d, i) => {
      console.log(`Device ${i + 1} [${d.type}]`);
      console.log(`  IP Address        : ${d.ipAddress}`);
      console.log(`  IP Score          : ${d.ipScore}`);
      console.log(`  Multiplier        : x${d.multiplier}`);
      console.log(`  Agg Uptime        : ${formatUptime(d.aggUptime)}`);
      console.log(`  Last Connected    : ${formatDate(d.lastConnectedAt)}`);
    });
  }

  if (epochData) {
    console.log('\n🏆 EPOCH EARNINGS:');
    console.log('-'.repeat(60));
    console.log(`Epoch Name          : ${epochData.epochName}`);
    console.log(`Period              : ${epochData.startDate} → ${epochData.endDate}`);
    console.log(`Points this Epoch   : ${formatNumber(epochData.totalPoints)}`);
    console.log(`Uptime this Epoch   : ${formatUptime(epochData.totalUptime)}`);
  }

  if (previousGrassData) {
    const pointsDiff = userData.totalPoints - previousGrassData.user.totalPoints;
    const referralDiff = userData.referralCount - previousGrassData.user.referralCount;
    if (pointsDiff !== 0 || referralDiff !== 0) {
      console.log('\n📈 PERUBAHAN GRASS:');
      console.log('-'.repeat(60));
      if (pointsDiff > 0) console.log(`Points              : +${formatNumber(pointsDiff)}`);
      if (referralDiff > 0) console.log(`Referrals           : +${referralDiff}`);
    }
  }
}

// ============================================================
//  MONITOR FUNCTIONS
// ============================================================

async function monitorDawn() {
  if (!CONFIG.authToken || !CONFIG.userId) {
    console.log('⚠️  Dawn: AUTH_TOKEN atau USER_ID tidak dikonfigurasi, skip.');
    return;
  }
  try {
    console.log('⏳ Dawn: Mengambil data...');
    const [referralData, pointsData] = await Promise.all([
      getDawnReferralStats(),
      getDawnPoints()
    ]);

    displayDawnData(referralData, pointsData);

    const now = Date.now();
    const shouldSendScheduled = (now - lastDiscordSendDawn) >= CONFIG.sendInterval;
    let shouldSendUpdate = false;

    if (previousDawnData) {
      const prevTotal = previousDawnData.points.points + previousDawnData.points.referral_points;
      const currentTotal = pointsData.points + pointsData.referral_points;
      const pointsDiff = currentTotal - prevTotal;
      const referralDiff = referralData.totalReferrals - previousDawnData.referral.totalReferrals;
      shouldSendUpdate = pointsDiff > 0 || referralDiff > 0;
    }

    if (shouldSendScheduled || shouldSendUpdate) {
      await sendDawnToDiscord(referralData, pointsData, shouldSendUpdate);
      lastDiscordSendDawn = now;
    }

    previousDawnData = { referral: referralData, points: pointsData };
  } catch (error) {
    console.error('❌ Dawn Error:', error.message);
    if (CONFIG.discordWebhook) {
      await sendDiscordEmbed(CONFIG.discordWebhook, {
        title: '⚠️ Error Dawn Monitor',
        description: `**Error:** ${error.message}`,
        color: 15158332,
        timestamp: new Date().toISOString()
      });
    }
  }
}

async function monitorGrass() {
  if (!CONFIG.grassAuthToken) {
    console.log('⚠️  Grass: GRASS_AUTH_TOKEN tidak dikonfigurasi, skip.');
    return;
  }
  try {
    console.log('⏳ Grass: Mengambil data...');
    const [userData, devices, epochData] = await Promise.all([
      getGrassUser(),
      getGrassActiveDevices(),
      getGrassEpochEarnings()
    ]);

    displayGrassData(userData, devices, epochData);

    const now = Date.now();
    const shouldSendScheduled = (now - lastDiscordSendGrass) >= CONFIG.sendInterval;
    let shouldSendUpdate = false;

    if (previousGrassData) {
      const pointsDiff = userData.totalPoints - previousGrassData.user.totalPoints;
      const referralDiff = userData.referralCount - previousGrassData.user.referralCount;
      shouldSendUpdate = pointsDiff > 0 || referralDiff > 0;
    }

    if (shouldSendScheduled || shouldSendUpdate) {
      await sendGrassToDiscord(userData, devices, epochData, shouldSendUpdate);
      lastDiscordSendGrass = now;
    }

    previousGrassData = { user: userData, devices, epoch: epochData };
  } catch (error) {
    console.error('❌ Grass Error:', error.message);
    if (CONFIG.grassDiscordWebhook) {
      await sendDiscordEmbed(CONFIG.grassDiscordWebhook, {
        title: '⚠️ Error Grass Monitor',
        description: `**Error:** ${error.message}`,
        color: 15158332,
        timestamp: new Date().toISOString()
      });
    }
  }
}

async function monitor() {
  console.clear();
  console.log('='.repeat(60));
  console.log('         DAWN & GRASS INTERNET MONITOR');
  console.log('='.repeat(60));
  console.log(`Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);

  await monitorDawn();
  await monitorGrass();

  console.log('\n' + '='.repeat(60));
  console.log(`Next check dalam ${CONFIG.interval / 1000} detik`);
  console.log('Tekan Ctrl+C untuk berhenti');
  console.log('='.repeat(60));
}

// ============================================================
//  VALIDASI & START
// ============================================================

function validateConfig() {
  if (!CONFIG.authToken || !CONFIG.userId) {
    console.log('⚠️  Warning: Dawn AUTH_TOKEN atau USER_ID tidak diset — Dawn monitoring dinonaktifkan.');
  }
  if (!CONFIG.grassAuthToken) {
    console.log('⚠️  Warning: GRASS_AUTH_TOKEN tidak diset — Grass monitoring dinonaktifkan.');
  }
  if (!CONFIG.authToken && !CONFIG.grassAuthToken) {
    console.error('❌ Error: Tidak ada konfigurasi valid. Set minimal satu layanan di .env');
    process.exit(1);
  }
  if (!CONFIG.discordWebhook && !CONFIG.grassDiscordWebhook) {
    console.log('⚠️  Warning: Discord webhook tidak diset, logs hanya di console.');
  }
}

validateConfig();

console.log('🚀 Dawn & Grass Monitor dimulai...');
console.log(`📊 Check interval : ${CONFIG.interval / 1000} detik`);
console.log(`📤 Discord interval: ${CONFIG.sendInterval / 1000} detik\n`);

monitor();
setInterval(monitor, CONFIG.interval);

process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor dihentikan. Terima kasih!');
  process.exit(0);
});
