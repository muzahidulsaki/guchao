# HeiSeenBug Guchao — WhatsApp Bot Microservice 🤖

A lightweight Node.js microservice powered by **Baileys** (`@whiskeysockets/baileys`) that connects WhatsApp Web directly via WebSockets (without heavy Chromium or Puppeteer browsers). It sends automated Kanban task notifications to your WhatsApp Team Group.

---

## 🚀 Quick Start (কীভাবে চালু করবেন)

### ১. ডিপেন্ডেন্সি ইনস্টল (যদি আগে না করা থাকে)
```bash
cd whatsapp-bot
npm install
```

### ২. বট চালু করুন
```bash
npm start
```
বট চালু হলে টার্মিনালে একটি **QR Code** দেখতে পাবেন। অথবা আপনার ব্রাউজারে যান:
👉 **`http://localhost:3001/qr`**

### ৩. আপনার ফোন দিয়ে স্ক্যান করুন 📱
১. আপনার ফোনের **WhatsApp** অ্যাপে যান।  
২. **Settings** (আইফোন) অথবা থ্রি-ডট **⋮** (অ্যান্ড্রয়েড) &rarr; **Linked Devices**-এ যান।  
৩. **Link a Device** ট্যাপ করে টার্মিনাল বা ব্রাউজারের QR কোডটি স্ক্যান করে নিন।  
*(একবার স্ক্যান করলেই ডিভাইসটি কানেক্টেড থাকবে, বারবার স্ক্যান করতে হবে না)*

---

## 🎯 গ্রুপের আইডি বের করা

QR কোড স্ক্যান হয়ে গেলে বট আপনার সব গ্রুপের লিস্ট কনসোলে প্রিন্ট করবে।
অথবা ব্রাউজারে এই লিংকে যান:
👉 **`http://localhost:3001/groups`**

সেখান থেকে আপনার কাঙ্ক্ষিত WhatsApp গ্রুপের ID টি কপি করুন (যেমন: `120363041234567890@g.us`)।

এরপর:
১. `whatsapp-bot/.env` ফাইলে সেট করুন:
```env
WHATSAPP_GROUP_ID=120363041234567890@g.us
```
২. প্রধান লারাভেল প্রোজেক্টের `.env` ফাইলে সেট করুন:
```env
WHATSAPP_BOT_ENABLED=true
WHATSAPP_BOT_URL=http://127.0.0.1:3001
WHATSAPP_GROUP_ID=120363041234567890@g.us
```

---

## 🧪 টেস্ট নোটিফিকেশন পাঠানো

লারাভেল টার্মিনালে নিচের কমান্ডটি দিয়ে টেস্ট মেসেজ পাঠাতে পারেন:
```bash
php artisan whatsapp:test
```

---

## 🛡️ সার্ভারে ব্যাকগ্রাউন্ডে চালানোর নিয়ম (PM2)
বটটি যাতে সার্ভার রিস্টার্ট হলেও সবসময় চালু থাকে, সেজন্য **PM2** ব্যবহার করতে পারেন:
```bash
npm install -g pm2
pm2 start server.js --name "guchao-whatsapp-bot"
pm2 save
pm2 startup
```
