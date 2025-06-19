// index.js (Versi Final Revisi Lengkap: 1x Run & Notifikasi Telegram, TANPA PROXY)

require('dotenv').config(); // Berguna untuk environment variables lokal (tidak di-commit ke Git)
const axios = require('axios');
const { ethers } = require('ethers');
const { SiweMessage } = require('siwe');
// Hapus import proxy agents karena tidak akan digunakan
// const { HttpsProxyAgent } = require('https-proxy-agent');
// const { HttpProxyAgent } = require('http-proxy-agent');
// const { SocksProxyAgent } = require('socks-proxy-agent');
// fs dan path tidak lagi dibutuhkan karena tidak membaca file lokal
// const fs = require('fs');
// const path = require('path');

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.blue}[➤] ${msg}${colors.reset}`),
};

// Fungsi untuk mengirim notifikasi Telegram
async function sendTelegramNotification(message) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    logger.warn("TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID tidak ditemukan di environment variables. Notifikasi Telegram dilewati.");
    return;
  }

  const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(telegramApiUrl, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    logger.success("Notifikasi Telegram berhasil dikirim.");
  } catch (error) {
    logger.error(`Gagal mengirim notifikasi Telegram: ${error.message}`);
    if (error.response) {
      logger.error(`Telegram API response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Hapus atau abaikan fungsi createProxyAgent dan testProxy karena tidak pakai proxy
// function createProxyAgent(proxyString) { /* ... */ }
// async function testProxy(proxyString, timeout = 10000) { /* ... */ }


// Fungsi untuk membuat konfigurasi Axios (tanpa proxy agent)
function createAxiosConfig(proxyString = null, additionalHeaders = {}) { // Parameter proxyString tetap ada tapi akan diabaikan
  const config = {
    headers: {
      'User-Agent': getRandomUserAgent(),
      ...additionalHeaders
    },
    timeout: 30000 // Timeout default 30 detik
  };

  // Logika proxy dihilangkan di sini
  // if (proxyString) {
  //   const agent = createProxyAgent(proxyString);
  //   if (agent) {
  //     config.httpsAgent = agent;
  //     config.httpAgent = agent;
  //   }
  // }
  return config;
}

// Catatan: appCheckToken ini terdeteksi hardcoded di skrip awal kamu.
// Jika ini harus dynamic atau disembunyikan, sebaiknya dijadikan GitHub Secret juga.
// Jika tidak diset sebagai ENV, dia akan menggunakan nilai hardcoded ini.
const appCheckToken = process.env.FIREBASE_APP_CHECK_TOKEN || "eyJraWQiOiJrTFRMakEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjU0MzEyMzE3NDQyOndlYjo1ODVmNjIzNTRkYjUzYzE0MmJlZDFiIiwiYXVkIjpbInByb2plY3RzXC81NDMxMjMxNzQ0MiIsInByb2plY3RzXC9nYW1lLXprYWdlaW1lLXByZXZpZXctNTFjMmEiXSwicHJvdmlkZXIiOiJyZWNhcHRjaGFfdjMiLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNTQzMTIzMTc0NDIiLCJleHAiOjE3NTAwNTIyNDQsImlhdCI6MTc0OTk2NTg0NCwianRpIjoiUmFETTZUdUNqR2tLSEhFU05pa0xzLVJrdUxnRGJTbU1XeHF4N2xYZ0dNayJ9.AOfqTMnxe4v6Ze_yzB4MbZ1vatoRSMY0N3QoHDc4NV6fJVom9Re-XLbR7KA7njZicRtZu9sWUTTnAXIePnkgP3SQXtx-28c9ze2O2waJMvUPqAeH4PSSck7KhD3YyggwfLzZgTlj2d7NdImGLdOhVZdVmWq-HSAUV95nLFvgSzEbi-SBO0PJqUWrTsq1_CSMnJtNQfKQ1g4_2jrhHvvupNpQFIg20z1-vm9u_Kal8LaZHrJdqkONRvk4SVPjkIdPzxng4vZ14PooF82SVsVq4WRJDPawzdPpDlSiMadJYKqwlNu-2JZL4jNPWJUtZEbQ8OD4-mgYsdAPUxysKSXck81RlIPuvUkaqHX5MbhSRtatjRRoJBedS-8oUfbcX-rYTesQdQ94gkz9--QuJD7U1-uR_GZxwlnfrVQT-DtbQTgBBq2Wh6TPSu8Hn7-XDefUsXFineIwSbBVSGlJbNm_TrjOJinbqNqYyOTiTtl6tfswpF3Zxrm0QzyVaL7TCAD";

const baseHeaders = {
  accept: "*/*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "priority": "u=1, i",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "Referer": "https://voyager.preview.craft-world.gg/missions/social",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

async function getQuestProgress(sessionCookie, proxyString = null) {
  const questProgressQuery = `
    query QuestProgress {
      account {
        questProgresses {
          quest {
            id
            name
            description
            reward
            type
            target
            starsInProgress
            starsComplete
            actionLink
            externalId
            groupId
            period
            tab
            data
            liveOpConfig {
              startAt
              duration
            }
          }
          status
          progress
          multiplierBonus
          isForeshadowed
        }
        questPoints
        loyaltyMultiplier
        rank {
          rankId
          name
          subRank
          nextRankId
          nextRank
          nextSubRank
          nextRankRequiredPoints
          divisionId
          nextDivisionId
        }
        profile {
          displayName
          avatarUrl
        }
      }
    }
  `;

  const config = createAxiosConfig(proxyString, baseHeaders);
  config.headers.cookie = sessionCookie;

  const response = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
    query: questProgressQuery,
    variables: {}
  }, config);

  return response.data.data.account;
}

async function getShopChestLimits(sessionCookie, proxyString = null) {
  const shopChestsQuery = `
    query GetShopChests {
      account {
        getShopChests {
          id
          name
          tier
          icon
          description
          acquisitionMethod
          dailyPurchases
          dailyLimit
          price {
            unit
            amount
          }
          reward {
            chance
            crystals
            equipmentId
          }
          requirement {
            nft {
              collectionIds
              dailyLimit {
                minNFTAmount
                chestCount
              }
            }
          }
        }
      }
    }
  `;

  const config = createAxiosConfig(proxyString, {
    ...baseHeaders,
    cookie: sessionCookie,
    Referer: "https://voyager.preview.craft-world.gg/shop"
  });

  const response = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
    query: shopChestsQuery,
    variables: {}
  }, config);

  return response.data.data.account.getShopChests;
}


async function spinChestIfAvailable(chestId, chestName, sessionCookie, chests, proxyString = null) {
  const chest = chests.find(c => c.id === chestId);
  if (!chest) {
    logger.error(`Chest ${chestId} not found in shop data`);
    return 0;
  }

  const remainingSpins = chest.dailyLimit - chest.dailyPurchases;
  logger.info(`${chestName}: ${chest.dailyPurchases}/${chest.dailyLimit} used (${remainingSpins} remaining)`);

  if (remainingSpins <= 0) {
    logger.warn(`${chestName} daily limit reached, skipping...`);
    return 0;
  }

  const freeChestMutation = `
    mutation BuyAndOpenChestMutation($chestId: String!, $transactionHash: String) {
      buyAndOpenChest(chestId: $chestId, transactionHash: $transactionHash) {
        crystals
        equipment {
          ownedEquipmentId
          slot
          tier
          name
          description
          crystalsOnDestroy
          definitionId
          baseMultiplier
        }
      }
    }
  `;

  let successfulSpins = 0;

  for (let i = 0; i < remainingSpins; i++) {
    try {
      logger.loading(`Spinning ${chestName} (${i + 1}/${remainingSpins})...`);

      const config = createAxiosConfig(proxyString, {
        ...baseHeaders,
        cookie: sessionCookie,
        Referer: "https://voyager.preview.craft-world.gg/shop"
      });

      const response = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
        query: freeChestMutation,
        variables: { chestId }
      }, config);

      const chestData = response.data.data?.buyAndOpenChest;
      if (chestData) {
        if (chestData.equipment) {
          logger.success(`${chestName} #${i + 1}: ${chestData.equipment.name} (${chestData.equipment.tier})`);
        } else if (chestData.crystals) {
          logger.success(`${chestName} #${i + 1}: ${chestData.crystals} crystals`);
        } else {
          logger.success(`${chestName} #${i + 1}: opened successfully`);
        }
        successfulSpins++;
      } else {
        logger.error(`Failed to open ${chestName} #${i + 1}: Invalid response`);
        break; // Berhenti jika respons tidak valid
      }

      if (i < remainingSpins - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay antar spin
      }
    } catch (error) {
      logger.error(`Error opening ${chestName} #${i + 1}: ${error.message}`);
      if (error.response?.status === 429) {
        logger.warn("Rate limit reached, stopping chest spins");
        break; // Berhenti jika ada rate limit
      }
    }
  }

  return successfulSpins;
}

async function claimAllReadyQuests(sessionCookie, proxyString = null) {
  let totalClaimed = 0;
  let attempts = 0;
  const maxAttempts = 10;

  const claimMutation = `
    mutation CompleteQuest($questId: String!) {
      completeQuest(questId: $questId) {
        success
      }
    }
  `;

  while (attempts < maxAttempts) {
    attempts++;
    logger.loading(`Checking for ready quests (attempt ${attempts})...`);

    const account = await getQuestProgress(sessionCookie, proxyString);
    const readyQuests = account.questProgresses.filter(progress => progress.status === "READY_TO_CLAIM");

    if (readyQuests.length === 0) {
      logger.info("No more quests ready to claim");
      break; // Tidak ada quest siap klaim, keluar loop
    }

    logger.step(`Found ${readyQuests.length} quest(s) ready to claim`);

    for (const progress of readyQuests) {
      try {
        logger.loading(`Claiming quest: ${progress.quest.name}`);

        const config = createAxiosConfig(proxyString, {
          ...baseHeaders,
          cookie: sessionCookie,
          Referer: "https://voyager.preview.craft-world.gg/missions/daily"
        });

        const claimResponse = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
          query: claimMutation,
          variables: { questId: progress.quest.id }
        }, config);

        if (claimResponse.data.data.completeQuest.success) {
          logger.success(`Quest "${progress.quest.name}" claimed successfully`);
          totalClaimed++;
        } else {
          logger.error(`Failed to claim quest "${progress.quest.name}"`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay antar klaim
      } catch (error) {
        logger.error(`Error claiming quest "${progress.quest.name}": ${error.message}`);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000)); // Delay antar attempt
  }

  return totalClaimed;
}

function extractSessionCookie(response) {
  const setCookieHeader = response.headers['set-cookie'];
  if (setCookieHeader) {
    const sessionCookie = setCookieHeader.find(cookie => cookie.startsWith('session='));
    if (sessionCookie) {
      return sessionCookie.split(';')[0];
    }
  }
  return null;
}

async function processSingleWallet(privateKey, accountIndex, proxyString = null) {
  logger.info(`Memulai proses untuk Wallet ${accountIndex} (${privateKey.substring(0, 8)}...) menggunakan Proxy: ${proxyString || 'Tidak ada'})`);

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = wallet.connect(provider);

  let questsClaimed = 0;
  let chestsOpened = 0;
  let errorMessage = null;
  let walletAddress = "N/A"; // Default jika terjadi error sebelum mendapatkan address

  try {
    walletAddress = await signer.getAddress();
    const chainId = (await provider.getNetwork()).chainId;

    // Bagian Sign-In with Ethereum (SIWE)
    // Dapatkan nonce dan detail payload lainnya dari API game terlebih dahulu
    logger.loading("Fetching authentication payload...");
    const configAuthPayload = createAxiosConfig(proxyString, baseHeaders);
    const payloadResponse = await axios.post("https://voyager.preview.craft-world.gg/auth/payload", {
      address: walletAddress,
      chainId: chainId.toString()
    }, configAuthPayload);
    const payload = payloadResponse.data.payload;

    logger.loading("Signing SIWE message...");
    const siweMessage = new SiweMessage({
      domain: payload.domain,
      address: walletAddress,
      statement: payload.statement,
      uri: payload.uri,
      version: payload.version,
      chainId: parseInt(payload.chain_id),
      nonce: payload.nonce,
      issuedAt: payload.issued_at,
      expirationTime: payload.expiration_time
    });
    const signature = await wallet.signMessage(siweMessage.toMessage());
    logger.success("SIWE message signed");

    logger.loading("Authenticating with signature...");
    // FIREBASE_API_KEY ini bisa dari process.env atau hardcode jika tidak diset.
    const firebaseKey = process.env.FIREBASE_API_KEY || "AIzaSyDgDDykbRrhbdfWUpm1BUgj4ga7d_-wy_g";
    const configLogin = createAxiosConfig(proxyString, { ...baseHeaders, "x-firebase-appcheck": appCheckToken });
    const loginResponse = await axios.post("https://voyager.preview.craft-world.gg/auth/login", {
      payload: { signature, payload }
    }, configLogin);
    const customToken = loginResponse.data.customToken;
    logger.success("Authenticated with signature, got custom token.");

    logger.loading("Signing in with custom token to Firebase...");
    const configFirebase = createAxiosConfig(proxyString, {
      ...baseHeaders,
      "x-client-version": "Chrome/JsCore/11.8.0/FirebaseCore-web",
      "x-firebase-appcheck": appCheckToken,
      "x-firebase-gmpid": "1:54312317442:web:585f62354db53c142bed1b",
      "Referrer-Policy": "no-referrer" // Mengganti strict-origin-when-cross-origin untuk Firebase
    });

    const signInResponse = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseKey}`, {
      token: customToken,
      returnSecureToken: true
    }, configFirebase);
    const idToken = signInResponse.data.idToken;
    logger.success("Signed in to Firebase successfully");

    logger.loading("Creating session...");
    const configSession = createAxiosConfig(proxyString, baseHeaders);
    // VOYAGER_API_KEY ini bisa dari process.env.
    // Jika tidak diset sebagai ENV, bot akan tetap mencoba jalan tanpa header ini.
    if (process.env.VOYAGER_API_KEY) {
        configSession.headers['X-API-KEY'] = process.env.VOYAGER_API_KEY;
    }
    const sessionResponse = await axios.post("https://voyager.preview.craft-world.gg/api/1/session/login", {
      token: idToken
    }, configSession);
    
    const sessionCookie = extractSessionCookie(sessionResponse);
    if (!sessionCookie) {
      throw new Error("Failed to extract session cookie after Firebase login.");
    }
    logger.success("Session created and cookie extracted");

    logger.loading("Fetching account information...");
    const account = await getQuestProgress(sessionCookie, proxyString);
    logger.info(`User Profile: ${account.profile.displayName || "N/A"}`);
    logger.info(`Quest Points: ${account.questPoints}`);
    logger.info(`Loyalty Multiplier: ${account.loyaltyMultiplier}`);
    logger.info(`Rank: ${account.rank.name} (SubRank: ${account.rank.subRank})`);
    logger.info(`Next Rank: ${account.rank.nextRank} (${account.rank.nextRankRequiredPoints} points needed})`);

    logger.step("Performing daily login...");
    const dailyLoginMutation = `
      mutation CompleteQuest($questId: String!) {
        completeQuest(questId: $questId) {
          success
        }
      }
    `;
    try {
      const configDailyLogin = createAxiosConfig(proxyString, {
        ...baseHeaders,
        cookie: sessionCookie,
        Referer: "https://voyager.preview.craft-world.gg/missions/daily"
      });
      
      const dailyLoginResponse = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
        query: dailyLoginMutation,
        variables: { questId: "daily_login" }
      }, configDailyLogin);
      
      if (dailyLoginResponse.data.data.completeQuest.success) {
        logger.success("Daily login completed");
      } else {
        logger.warn("Daily login already completed or failed (check response data for details).");
      }
    } catch (error) {
      logger.warn(`Daily login error: ${error.message}`);
    }

    logger.step("Starting quest claiming process...");
    const totalClaimedQuests = await claimAllReadyQuests(sessionCookie, proxyString);
    logger.success(`Total quests claimed: ${totalClaimedQuests}`);

    logger.step("Starting chest spinning process...");
    const shopChests = await getShopChestLimits(sessionCookie, proxyString);

    const freeChestSpins = await spinChestIfAvailable("free_uncommon_chest_1", "Daily Chest (Free)", sessionCookie, shopChests, proxyString);
    if (freeChestSpins > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay jika ada spin sukses
    }

    const coinChestSpins = await spinChestIfAvailable("coin_common_chest_1", "Sturdy Chest (Coin)", sessionCookie, shopChests, proxyString);
    
    logger.success(`Chest spinning completed: ${freeChestSpins} free chests, ${coinChestSpins} coin chests`);

    logger.success(`Wallet ${accountIndex} (${walletAddress}): Proses selesai.`);
    return {
      success: true,
      address: walletAddress,
      proxy: proxyString || 'N/A',
      questsClaimed: totalClaimedQuests,
      chestsOpened: freeChestSpins + coinChestSpins
    };

  } catch (error) {
    errorMessage = `Error processing wallet ${accountIndex} (${walletAddress}): ${error.message}`;
    if (error.response) {
      errorMessage += ` | API Response: ${JSON.stringify(error.response.data)}`;
    }
    logger.error(errorMessage);
    return {
      success: false,
      address: walletAddress,
      proxy: proxyString || 'N/A',
      error: errorMessage,
      questsClaimed: 0,
      chestsOpened: 0
    };
  }
}

async function main() {
  logger.info("Memulai Voyager CraftWorld Bot (1x Run, Tanpa Proxy)...");

  // --- Ambil Private Keys dari Environment Variable ---
  // Private keys dipisahkan koma (,) dalam satu string di GitHub Secret: PRIVATE_KEYS
  const rawPrivateKeys = process.env.PRIVATE_KEYS;
  const privateKeys = rawPrivateKeys ? rawPrivateKeys.split(',').map(key => key.trim()).filter(key => key !== '') : [];

  // --- Bagian proxy dihapus / diabaikan sepenuhnya di sini ---
  const proxies = []; // Daftar proxy kosong karena bot berjalan tanpa proxy
  let workingProxies = []; // Daftar proxy yang berfungsi juga kosong

  if (privateKeys.length === 0) {
    logger.error("PRIVATE_KEYS tidak ditemukan atau kosong di environment variables. Bot berhenti.");
    await sendTelegramNotification("❌ *Voyager Bot Gagal!* ❌\n\n`PRIVATE_KEYS` tidak ditemukan atau kosong di GitHub Secrets. Bot tidak dapat berjalan.").catch(() => {});
    process.exit(1); // Keluar dengan kode error
  }

  logger.info("Bot dikonfigurasi untuk berjalan TANPA PROXY.");
  
  const results = [];
  // Loop melalui setiap private key untuk memproses wallet
  for (let i = 0; i < privateKeys.length; i++) {
    const privateKey = privateKeys[i];
    const currentProxyString = null; // Selalu null karena tidak pakai proxy
    logger.step(`Memulai pemrosesan untuk wallet ${i + 1} dari ${privateKeys.length}...`);
    const result = await processSingleWallet(privateKey, i + 1, currentProxyString); // Kirim null untuk proxy
    results.push(result);

    // Tambahkan delay antar wallet jika ada lebih dari satu
    if (i < privateKeys.length - 1) {
      logger.step("Menunggu 5 detik sebelum memproses wallet berikutnya...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // --- RINGKASAN DAN NOTIFIKASI TELEGRAM ---
  console.log(`\n${colors.magenta}${colors.bold}--- RINGKASAN EKSEKUSI BOT ---${colors.reset}`);
  const successfulRuns = results.filter(r => r.success);
  const totalQuests = successfulRuns.reduce((sum, r) => sum + r.questsClaimed, 0);
  const totalChests = successfulRuns.reduce((sum, r) => sum + r.chestsOpened, 0);

  logger.success(`Processed ${successfulRuns.length}/${results.length} wallets successfully`);
  logger.success(`Total quests claimed: ${totalQuests}`);
  logger.success(`Total chests opened: ${totalChests}`);

  results.forEach((result, index) => {
    const status = result.success ? colors.green + "✅" : colors.red + "❌";
    console.log(`${status} Wallet ${index + 1}: ${result.address} | Proxy: ${result.proxy} | Quests: ${result.questsClaimed} | Chests: ${result.chestsOpened}${colors.reset}`);
  });

  if (results.some(r => !r.success)) {
    logger.warn("Wallet yang gagal:");
    results.filter(r => !r.success).forEach((r, idx) => {
      logger.error(`Wallet ${results.indexOf(r) + 1}: ${r.error}`);
    });
  }

  // Notifikasi Telegram
  let telegramSummary = `*Voyager Bot Run Selesai!* ✅\n\n`;
  telegramSummary += `*Ringkasan:*\n`;
  telegramSummary += `Wallet berhasil diproses: ${successfulRuns.length}/${results.length}\n`;
  telegramSummary += `Total quests diklaim: ${totalQuests}\n`;
  telegramSummary += `Total chests dibuka: ${totalChests}\n\n`;

  if (results.some(r => !r.success)) {
    telegramSummary += `*Wallet yang gagal:*\n`;
    results.filter(r => !r.success).forEach((r, idx) => {
      telegramSummary += `• Wallet ${results.indexOf(r) + 1}: \`${r.error}\`\n`;
    });
  } else {
    telegramSummary += `Semua wallet berhasil diproses tanpa kendala! ✨\n`;
  }

  // Batasi panjang pesan Telegram jika terlalu panjang
  if (telegramSummary.length > 4096) {
    telegramSummary = telegramSummary.substring(0, 4000) + "\n\n...(Pesan dipotong karena terlalu panjang)";
  }

  await sendTelegramNotification(telegramSummary);

  console.log(`\n${colors.cyan}[✓] Semua wallet selesai diproses. Skrip akan keluar.${colors.reset}\n`);
}

// Panggil fungsi utama
main().catch(error => {
  logger.error(`Terjadi kesalahan fatal pada bot: ${error.message}`);
  // Kirim notifikasi error fatal ke Telegram
  sendTelegramNotification(`⚠️ *Voyager Bot Gagal Total!* ⚠️\n\nError Fatal: \`${error.message}\``).catch(() => {});
  process.exit(1); // Keluar dengan kode error
});