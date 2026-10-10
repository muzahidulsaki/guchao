import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const DEFAULT_GROUP_ID = process.env.WHATSAPP_GROUP_ID || '';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

let sock = null;
let currentQR = null;
let isConnected = false;
let userProfile = null;
let cachedGroups = [];

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`\n========================================`);
  console.log(`🚀 Starting HeiSeenBug Guchao WhatsApp Bot`);
  console.log(`📡 Baileys version: v${version.join('.')}, latest: ${isLatest}`);
  console.log(`========================================\n`);

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['HeiSeenBug Guchao', 'Chrome', '124.0.0'],
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      isConnected = false;
      console.log('\n📱 WhatsApp QR Code generated! Scan with your phone:');
      qrcodeTerminal.generate(qr, { small: true });
      console.log(`\n💡 Tip: You can also view the QR code in browser at: http://localhost:${PORT}/qr\n`);
    }

    if (connection === 'close') {
      isConnected = false;
      userProfile = null;
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log(
        `⚠️ Connection closed. Reason: ${lastDisconnect?.error?.message || 'Unknown'}. Reconnecting: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('❌ Device logged out. Please delete auth_info_baileys folder and restart.');
      }
    } else if (connection === 'open') {
      isConnected = true;
      currentQR = null;
      userProfile = sock.user;
      console.log('\n✅ WhatsApp Connected Successfully! 🎉');
      console.log(`👤 Connected as: ${sock.user?.name || sock.user?.id || 'Bot'}`);

      // Fetch all participating groups
      try {
        const groups = await sock.groupFetchAllParticipating();
        cachedGroups = Object.values(groups).map((g) => ({
          id: g.id,
          subject: g.subject,
          participantsCount: g.participants?.length || 0,
        }));

        console.log(`\n📋 Available WhatsApp Groups (${cachedGroups.length}):`);
        cachedGroups.forEach((g) => {
          console.log(`   🏷️  "${g.subject}"  --->  ID: ${g.id}`);
        });

        if (DEFAULT_GROUP_ID) {
          console.log(`\n🎯 Target Group ID in .env: ${DEFAULT_GROUP_ID}`);
        } else {
          console.log(`\n💡 Copy your desired group ID above and put it in .env (WHATSAPP_GROUP_ID=...)`);
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err.message);
      }
    }
  });
}

// Start connection
connectToWhatsApp();

// ----------------- HTTP API Endpoints -----------------
const router = express.Router();

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    user: userProfile,
    targetGroupId: DEFAULT_GROUP_ID,
    cachedGroupsCount: cachedGroups.length,
    qrAvailable: !!currentQR,
  });
});

// QR Code HTML page
router.get('/qr', async (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot - Connected</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); max-width: 400px; }
          h2 { color: #10b981; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.9rem; }
          .badge { background: #064e3b; color: #34d399; padding: 0.35rem 0.8rem; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Connected</span>
          <h2>WhatsApp is Linked! 🎉</h2>
          <p>Bot is actively running and ready to send notifications from HeiSeenBug Guchao.</p>
          <p><a href="./groups" style="color: #38bdf8;">View Groups List &rarr;</a></p>
        </div>
      </body>
      </html>
    `);
  }

  if (!currentQR) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot - Initializing</title>
        <meta http-equiv="refresh" content="3">
        <style>
          body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Initializing WhatsApp...</h2>
          <p style="color: #94a3b8;">Generating QR code. This page will refresh automatically...</p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const qrImage = await QRCode.toDataURL(currentQR, { width: 300, margin: 2 });
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot - Scan QR</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="refresh" content="25">
        <style>
          body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
          .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.7); max-width: 420px; border: 1px solid #334155; }
          h2 { margin: 0 0 0.5rem 0; color: #38bdf8; }
          p { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }
          .qr-box { background: white; padding: 1rem; border-radius: 1rem; display: inline-block; margin: 1.2rem 0; }
          .steps { text-align: left; background: #0f172a; padding: 1rem; border-radius: 0.75rem; font-size: 0.8rem; color: #cbd5e1; margin-top: 1rem; }
          .steps ol { margin: 0; padding-left: 1.2rem; }
          .steps li { margin-bottom: 0.35rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Scan with WhatsApp 📲</h2>
          <p>Link HeiSeenBug Guchao bot to your WhatsApp account</p>
          
          <div class="qr-box">
            <img src="${qrImage}" alt="WhatsApp QR Code" style="display: block; width: 260px; height: 260px;" />
          </div>

          <div class="steps">
            <strong>How to scan:</strong>
            <ol>
              <li>Open <strong>WhatsApp</strong> on your phone</li>
              <li>Tap <strong>Settings / ⋮ Menu</strong> &rarr; <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a device</strong> and scan this QR code</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error generating QR image');
  }
});

// List groups
router.get('/groups', async (req, res) => {
  if (!isConnected) {
    return res.status(503).json({ error: 'WhatsApp is not connected yet.' });
  }

  try {
    const groups = await sock.groupFetchAllParticipating();
    const list = Object.values(groups).map((g) => ({
      id: g.id,
      subject: g.subject,
      participantsCount: g.participants?.length || 0,
    }));
    cachedGroups = list;
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message, cached: cachedGroups });
  }
});

// Send message to WhatsApp
router.post('/send-message', async (req, res) => {
  const { message, groupId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Field "message" is required' });
  }

  const targetJid = groupId || DEFAULT_GROUP_ID;

  if (!targetJid) {
    return res.status(400).json({
      error: 'No target WhatsApp groupId specified in request body or WHATSAPP_GROUP_ID environment variable.',
    });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      error: 'WhatsApp bot is not connected. Please scan QR code first.',
    });
  }

  try {
    const result = await sock.sendMessage(targetJid, { text: message });
    console.log(`📨 Sent message to ${targetJid}: "${message.slice(0, 40)}..."`);
    return res.json({
      success: true,
      messageId: result.key.id,
      timestamp: result.messageTimestamp,
    });
  } catch (err) {
    console.error('❌ Failed to send WhatsApp message:', err);
    return res.status(500).json({
      error: err.message || 'Failed to send WhatsApp message',
    });
  }
});

// Test message endpoint
router.post('/test', async (req, res) => {
  const testMessage = `🤖 *[HeiSeenBug Guchao]* WhatsApp Bot is active!\n\nThis is a test notification from Guchao Kanban board. Connected successfully! ✅`;
  const targetJid = req.body.groupId || DEFAULT_GROUP_ID;

  if (!targetJid) {
    return res.status(400).json({
      error: 'Please provide a groupId or set WHATSAPP_GROUP_ID in .env',
    });
  }

  try {
    const result = await sock.sendMessage(targetJid, { text: testMessage });
    return res.json({ success: true, messageId: result.key.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Mount router on root and cPanel subpaths
app.use('/', router);
app.use('/wa-bot', router);
app.use('/bot', router);

app.listen(PORT, () => {
  console.log(`🌐 HTTP API Server running at http://localhost:${PORT}`);
  console.log(`🔗 Web QR Scanner: http://localhost:${PORT}/qr`);
  console.log(`👥 Group List: http://localhost:${PORT}/groups\n`);
});
