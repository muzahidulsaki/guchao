<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('whatsapp:test {groupId?}', function (?string $groupId = null) {
    $this->info('Sending test notification to WhatsApp bot...');
    $divider = "━━━━━━━━━━━━━━━━━━";
    $msg = "*HEISEENBUG GUCHAO*\n"
         . "*System Notification*\n"
         . "*BOT-1 | Bot Connectivity Check*\n"
         . "{$divider}\n"
         . "Status: Active\n"
         . "Priority: High\n"
         . "{$divider}\n"
         . "Open Task:\n"
         . "https://guchao.heiseenbug.com\n"
         . "_Automated notification · HeiSeenBug Guchao_";
    $success = \App\Services\WhatsAppService::sendMessage($msg, $groupId);
    if ($success) {
        $this->info('✅ Test message sent successfully!');
    } else {
        $this->error('❌ Failed to send message. Make sure the bot is running on ' . config('services.whatsapp.bot_url') . ' and QR code is scanned.');
    }
})->purpose('Send a test notification to the WhatsApp group');
