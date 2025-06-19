// index.js (VERSI FINAL - Basis Kode Awal + Telegram Notifikasi + 1x Run)

require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const { SiweMessage } = require('siwe');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs'); // fs dan path tetap dibutuhkan karena membaca file lokal
const path = require('path');

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
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  // countdown dan banner dihilangkan karena mode 1x run
  // countdown: (msg) => process.stdout.write(`\r${colors.blue}[⏰] ${msg}${colors.reset}`),
  // banner: () => {
  //   console.log(`${colors.cyan}${colors.bold}`);
  //   console.log(`---------------------------------------------`);
  //   console.log(`  Voyager CW Auto Bot - Airdrop Insiders   `);
  //   console.log(`---------------------------------------------${colors.reset}`);
  //   console.log();
  // }
};

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0"
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// --- FUNGSI BARU UNTUK TELEGRAM NOTIFICATION ---
async function sendTelegramNotification(message) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    logger.warn("TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID tidak ditemukan. Notifikasi Telegram dilewati.");
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
// --- AKHIR FUNGSI BARU ---

// Fungsi helper untuk membaca file (kembali menggunakan FS & PATH seperti kode awalmu)
function readLinesFromFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).filter(line => line.trim() !== '');
  } catch (error) {
    logger.error(`Error reading file ${filePath}: ${error.message}`);
    return [];
  }
}


// FUNGSI PROXY BAWAAN DARI SKRIP ASLI KAMU (DIKEMBALIKAN SEPERTI SEMULA)
function loadProxies() {
  try {
    const proxiesPath = path.join(__dirname, 'proxies.txt');
    if (!fs.existsSync(proxiesPath)) {
      logger.warn("proxies.txt not found. Running without proxy support.");
      return [];
    }
    
    const proxiesData = fs.readFileSync(proxiesPath, 'utf8');
    const proxies = proxiesData
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(proxy => parseProxy(proxy))
      .filter(proxy => proxy !== null);
    
    logger.info(`Loaded ${proxies.length} proxies from proxies.txt`);
    return proxies;
  } catch (error) {
    logger.error(`Error loading proxies: ${error.message}`);
    return [];
  }
}

function parseProxy(proxyString) {
  try {
    
    let cleanProxy = proxyString.replace(/^(https?|socks[45]?):\/\//, '');

    let auth = null;
    let hostPort = cleanProxy;
    
    if (cleanProxy.includes('@')) {
      const [authPart, hostPortPart] = cleanProxy.split('@');
      auth = authPart;
      hostPort = hostPortPart;
    }
    
    const [host, port] = hostPort.split(':');
    
    if (!host || !port) {
      logger.warn(`Invalid proxy format: ${proxyString}`);
      return null;
    }

    let type = 'http'; 
    if (proxyString.toLowerCase().includes('socks5')) {
      type = 'socks5';
    } else if (proxyString.toLowerCase().includes('socks4')) {
      type = 'socks4';
    } else if (proxyString.toLowerCase().includes('https')) {
      type = 'https';
    }
    
    return {
      type,
      host,
      port: parseInt(port),
      auth,
      original: proxyString
    };
  } catch (error) {
    logger.warn(`Failed to parse proxy: ${proxyString} - ${error.message}`);
    return null;
  }
}

function createProxyAgent(proxy) {
  try {
    const { type, host, port, auth } = proxy;

    // Default protocol if not specified
    let protocol = type.includes('socks') ? `${type}:` : 'http:';

    if (type === 'socks4' || type === 'socks5') {
      return new SocksProxyAgent(`${protocol}//${auth ? auth + '@' : ''}${host}:${port}`);
    }

    // HTTP(S) proxies need this format object for proper auth handling
    const proxyOptions = {
      host,
      port,
      protocol: protocol,
    };

    if (auth) {
      const [username, password] = auth.split(':');
      proxyOptions.auth = `${username}:${password}`;
    }

    if (type === 'https') {
      return new HttpsProxyAgent(proxyOptions);
    } else {
      return new HttpProxyAgent(proxyOptions);
    }
  } catch (error) {
    logger.error(`Failed to create proxy agent for ${proxy.original}: ${error.message}`);
    return null;
  }
}

async function testProxy(proxy, timeout = 10000) {
  try {
    const agent = createProxyAgent(proxy);
    if (!agent) return false;
    
    const response = await axios.get('https://httpbin.org/ip', {
      httpsAgent: agent,
      httpAgent: agent,
      timeout,
      headers: {
        'User-Agent': getRandomUserAgent()
      }
    });
    
    logger.success(`Proxy ${proxy.host}:${proxy.port} is working - IP: ${response.data.origin}`);
    return true;
  } catch (error) {
    logger.error(`Proxy ${proxy.host}:${proxy.port} failed: ${error.message}`);
    return false;
  }
}

function createAxiosConfig(proxy = null, additionalHeaders = {}) {
  const userAgent = getRandomUserAgent();
  const config = {
    headers: {
      'User-Agent': userAgent,
      ...additionalHeaders
    },
    timeout: 30000
  };
  
  if (proxy) {
    const agent = createProxyAgent(proxy);
    if (agent) {
      config.httpsAgent = agent;
      config.httpAgent = agent;
    }
  }
  
  return config;
}

// appCheckToken tetap seperti di kode awal kamu
const appCheckToken = "eyJraWQiOiJrTFRMakEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjU0MzEyMzE3NDQyOndlYjo1ODVmNjIzNTRkYjUzYzE0MmJlZDFiIiwiYXVkIjpbInByb2plY3RzXC81NDMxMjMxNzQ0MiIsInByb2plY3RzXC9nYW1lLXByZXZpZXctNTFjMmEiXSwicHJvdmlkZXIiOiJyZWNhcHRjaGFfdjMiLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNTQzMTIzMTc0NDIiLCJleHAiOjE3NTAwNTIyNDQsImlhdCI6MTc0OTk2NTg0NCwianRpIjoiUmFETTZUdUNqR2tLSEhFU05pa0xzLVJrdUxnRGJTbU1XeHF4N2xYZ0dNayJ9.AOfqTMnxe4v6Ze_yzB4MbZ1vatoRSMY0N3QoHDc4NV6fJVom9Re-XLbR7KA7njZicRtZu9sWUTTnAXIePnkgP3SQXtx-28c9ze2O2waJMvUPqAeH4PSSck7KhD3YyggwfLzZgTlj2d7NdImGLdOhVZdVmWq-HSAUV95nLFvgSzEbi-SBO0PJqUWrTsq1_CSMnJtNQfKQ1g4_2jrhHvvupNpQFIgG20z1-vm9u_Kal8LaZHrJdqkONRvk4SVPjkIdPzxng4vZ14PooF82SVsVq4WRJDPawzdPpDlSiMadJYKqwlNu-2JZL4jNPWJUtZEbQ8OD4-mgYsdAPUxysKSXck81RlIPuvUkaqHX5MbhSRtatjRRoJBedS-8oUfbcX-rYTesQdQ94gkz9--QuJD7U1-uR_GZxwlnfrVQT-DtbQTgBBq2Wh6TPSu8Hn7-XDefUsXFineIwSbBVSGlJbNm_TrjOJinbqNqYyOTiTtl6tfswpF3Zxrm0QzyVaL7TCAD";

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

// Fungsi getQuestProgress dan getShopChestLimits tetap menggunakan `proxy` parameter
async function getQuestProgress(sessionCookie, proxy = null) {
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
  
  const config = createAxiosConfig(proxy, baseHeaders);
  config.headers.cookie = sessionCookie;
  
  const response = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
    query: questProgressQuery,
    variables: {}
  }, config);
  
  return response.data.data.account;
}

async function getShopChestLimits(sessionCookie, proxy = null) {
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
  
  const config = createAxiosConfig(proxy, {
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

async function spinChestIfAvailable(chestId, chestName, sessionCookie, chests, proxy = null) {
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
      
      const config = createAxiosConfig(proxy, {
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
        break;
      }

      if (i < remainingSpins - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error(`Error opening ${chestName} #${i + 1}: ${error.message}`);
      if (error.response?.status === 429) {
        logger.warn("Rate limit reached, stopping chest spins");
        break;
      }
    }
  }
  
  return successfulSpins;
}

async function claimAllReadyQuests(sessionCookie, proxy = null) {
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
    
    const account = await getQuestProgress(sessionCookie, proxy);
    const readyQuests = account.questProgresses.filter(progress => progress.status === "READY_TO_CLAIM");
    
    if (readyQuests.length === 0) {
      logger.info("No more quests ready to claim");
      break;
    }
    
    logger.step(`Found ${readyQuests.length} quest(s) ready to claim`);
    
    for (const progress of readyQuests) {
      try {
        logger.loading(`Claiming quest: ${progress.quest.name}`);
        
        const config = createAxiosConfig(proxy, {
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

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Error claiming quest "${progress.quest.name}": ${error.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return totalClaimed;
}

// Fungsi processWallet yang disesuaikan untuk 1x run
async function processWallet(privateKey, accountIndex, proxy = null) { // Ubah index menjadi accountIndex
  let walletAddress = "N/A";
  let questsClaimed = 0;
  let chestsOpened = 0;
  let errorMessage = null;

  try {
    const proxyInfo = proxy ? `${proxy.host}:${proxy.port}` : 'No proxy';
    logger.step(`Processing wallet ${accountIndex} | Proxy: ${proxyInfo}`);

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Membaca RPC_URL dari ENV
    const wallet = new ethers.Wallet(privateKey, provider);
    walletAddress = await wallet.getAddress(); // Dapatkan address di awal
    logger.info(`Wallet address: ${walletAddress}`);

    logger.loading("Fetching authentication payload...");
    const config1 = createAxiosConfig(proxy, baseHeaders);
    const payloadResponse = await axios.post("https://voyager.preview.craft-world.gg/auth/payload", {
      address: walletAddress, // Gunakan walletAddress
      chainId: (await provider.getNetwork()).chainId.toString() // Ambil chainId dari provider
    }, config1);
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
    const config2 = createAxiosConfig(proxy, { ...baseHeaders, "x-firebase-appcheck": appCheckToken });
    const loginResponse = await axios.post("https://voyager.preview.craft-world.gg/auth/login", {
      payload: { signature, payload }
    }, config2);
    const customToken = loginResponse.data.customToken;
    logger.success("Authenticated with signature, got custom token");

    logger.loading("Signing in with custom token...");
    // Kunci API Firebase yang hardcoded di skrip awal kamu
    const firebaseApiKey = "AIzaSyDgDDykbRrhbdfWUpm1BUgj4ga7d_-wy_g"; // Ini adalah nilai hardcoded dari skrip awalmu
    const config3 = createAxiosConfig(proxy, {
      ...baseHeaders,
      "x-client-version": "Chrome/JsCore/11.8.0/FirebaseCore-web",
      "x-firebase-appcheck": appCheckToken,
      "x-firebase-gmpid": "1:54312317442:web:585f62354db53c142bed1b",
      "Referrer-Policy": "no-referrer"
    });
    
    const signInResponse = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseApiKey}`, {
      token: customToken,
      returnSecureToken: true
    }, config3);
    const idToken = signInResponse.data.idToken;
    logger.success("Signed in successfully");

    logger.loading("Fetching user information...");
    const config4 = createAxiosConfig(proxy, {
      ...baseHeaders,
      "x-client-version": "Chrome/JsCore/11.8.0/FirebaseCore-web",
      "x-firebase-appcheck": appCheckToken,
      "x-firebase-gmpid": "1:54312317442:web:585f62354db53c142bed1b",
      "Referrer-Policy": "no-referrer"
    });
    
    const userInfoResponse = await axios.post("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDgDDykbRrhbdfWUpm1BUgj4ga7d_-wy_g", {
      idToken
    }, config4);
    const userInfo = userInfoResponse.data.users[0];
    logger.info(`User ID: ${userInfo.localId}`);
    logger.info(`Last Login: ${new Date(parseInt(userInfo.lastLoginAt)).toISOString()}`);
    logger.info(`Created At: ${new Date(parseInt(userInfo.createdAt)).toISOString()}`);

    logger.loading("Creating session...");
    const config5 = createAxiosConfig(proxy, baseHeaders);
    const sessionResponse = await axios.post("https://voyager.preview.craft-world.gg/api/1/session/login", {
      token: idToken
    }, config5);
    
    const sessionCookie = extractSessionCookie(sessionResponse);
    if (!sessionCookie) {
      throw new Error("Failed to extract session cookie");
    }
    logger.success("Session created and cookie extracted");

    logger.loading("Fetching account information...");
    const account = await getQuestProgress(sessionCookie, proxy);
    logger.info(`User Profile: ${account.profile.displayName || "N/A"}`);
    logger.info(`Quest Points: ${account.questPoints}`);
    logger.info(`Loyalty Multiplier: ${account.loyaltyMultiplier}`);
    logger.info(`Rank: ${account.rank.name} (SubRank: ${account.rank.subRank})`);
    logger.info(`Next Rank: ${account.rank.nextRank} (${account.rank.nextRankRequiredPoints} points needed)`);

    logger.step("Performing daily login...");
    const dailyLoginMutation = `
      mutation CompleteQuest($questId: String!) {
        completeQuest(questId: $questId) {
          success
        }
      }
    `;
    try {
      const config6 = createAxiosConfig(proxy, {
        ...baseHeaders,
        cookie: sessionCookie,
        Referer: "https://voyager.preview.craft-world.gg/missions/daily"
      });
      
      const dailyLoginResponse = await axios.post("https://voyager.preview.craft-world.gg/graphql", {
        query: dailyLoginMutation,
        variables: { questId: "daily_login" }
      }, config6);
      
      if (dailyLoginResponse.data.data.completeQuest.success) {
        logger.success("Daily login completed");
      } else {
        logger.warn("Daily login already completed or failed");
      }
    } catch (error) {
      logger.warn(`Daily login error: ${error.message}`);
    }

    logger.step("Starting quest claiming process...");
    questsClaimed = await claimAllReadyQuests(sessionCookie, proxy);
    logger.success(`Total quests claimed: ${questsClaimed}`);

    logger.step("Starting chest spinning process...");
    const shopChests = await getShopChestLimits(sessionCookie, proxy);

    const freeChestSpins = await spinChestIfAvailable("free_uncommon_chest_1", "Daily Chest (Free)", sessionCookie, shopChests, proxy);
    if (freeChestSpins > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const coinChestSpins = await spinChestIfAvailable("coin_common_chest_1", "Sturdy Chest (Coin)", sessionCookie, shopChests, proxy);
    chestsOpened = freeChestSpins + coinChestSpins;
    
    logger.success(`Chest spinning completed: ${freeChestSpins} free chests, ${coinChestSpins} coin chests`);

    return {
      address: walletAddress,
      questsClaimed,
      chestsOpened,
      proxy: proxyInfo,
      success: true
    };

  } catch (error) {
    errorMessage = `Error processing wallet ${accountIndex} (${walletAddress}): ${error.message}`;
    if (error.response) {
      errorMessage += ` | API Error: ${JSON.stringify(error.response.data)}`;
    }
    logger.error(errorMessage);
    return {
      address: walletAddress,
      questsClaimed: 0,
      chestsOpened: 0,
      proxy: proxyInfo,
      success: false,
      error: errorMessage
    };
  }
}


async function main() {
  // logger.banner(); // Nonaktifkan banner untuk mode 1x run di GitHub Actions

  logger.info("Memulai Voyager CraftWorld Bot (1x Run)...");

  // Private keys diambil dari environment variable PRIVATE_KEYS
  const rawPrivateKeys = process.env.PRIVATE_KEYS;
  const privateKeys = rawPrivateKeys ? rawPrivateKeys.split(',').map(key => key.trim()).filter(key => key !== '') : [];

  if (privateKeys.length === 0) {
    logger.error("PRIVATE_KEYS tidak ditemukan atau kosong di environment variables. Bot berhenti.");
    await sendTelegramNotification("❌ *Voyager Bot Gagal!* ❌\n\n`PRIVATE_KEYS` tidak ditemukan atau kosong di GitHub Secrets. Bot tidak dapat berjalan.").catch(() => {});
    process.exit(1); // Keluar dengan kode error
  }

  // Proxies dibaca dari file lokal 'proxies.txt' seperti skrip awal kamu
  const proxies = loadProxies();

  let workingProxies = [];
  if (proxies.length > 0) {
    logger.step("Menguji konektivitas proxy...");
    for (const proxy of proxies) {
      if (await testProxy(proxy, 3000)) { // Timeout 3 detik untuk uji proxy
        workingProxies.push(proxy);
      }
    }
    if (workingProxies.length === 0) {
      logger.warn("Tidak ada proxy yang berfungsi. Melanjutkan tanpa proxy.");
    } else {
      logger.info(`${workingProxies.length} dari ${proxies.length} proxy berfungsi.`);
    }
  } else {
    logger.info("Tidak ada proxy yang disediakan. Melanjutkan tanpa proxy.");
  }

  const results = [];
  // Loop melalui setiap private key untuk memproses wallet
  for (let i = 0; i < privateKeys.length; i++) {
    const privateKey = privateKeys[i];
    const proxy = workingProxies.length > 0 ? workingProxies[i % workingProxies.length] : null; // Rotasi proxy
    logger.info(`Memproses wallet ${i + 1} dari ${privateKeys.length}...`);
    const result = await processWallet(privateKey, i + 1, proxy); // Panggil processWallet
    results.push(result);

    // Tambahkan delay antar wallet jika ada lebih dari satu
    if (i < privateKeys.length - 1) {
      logger.step("Menunggu 5 detik sebelum memproses wallet berikutnya...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // --- RINGKASAN DAN NOTIFIKASI TELEGRAM ---
  console.log(`\n${colors.magenta}${colors.bold}--- RINGKASAN EKSEKUSI BOT ---${colors.reset}`);
  const successful = results.filter(r => r.success);
  const totalQuests = successful.reduce((sum, r) => sum + r.questsClaimed, 0);
  const totalChests = successful.reduce((sum, r) => sum + r.chestsOpened, 0);

  logger.success(`Processed ${successful.length}/${results.length} wallets successfully`);
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
  telegramSummary += `Wallet berhasil diproses: ${successful.length}/${results.length}\n`;
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

  // Menghapus logika looping dan countdown karena bot adalah 1x run
  // await startCountdown();
}

// Menghapus fungsi startCountdown karena tidak lagi looping
// function getNextDailyReset() { /* ... */ }
// function formatTimeRemaining(ms) { /* ... */ }
// function startCountdown() { /* ... */ }


main().catch(error => {
  logger.error(`Terjadi kesalahan fatal pada bot: ${error.message}`);
  // Kirim notifikasi error fatal ke Telegram
  sendTelegramNotification(`⚠️ *Voyager Bot Gagal Total!* ⚠️\n\nError Fatal: \`${error.message}\``).catch(() => {});
  process.exit(1); // Keluar dengan kode error
});
