// ----------------------------------------------------------------------
// TelegramListener.js — Gaia Project Supervisor v1.6
// Forwards Telegram messages from your GAIA group to Supervisor
// ----------------------------------------------------------------------

import TelegramBot from "node-telegram-bot-api";

export default class TelegramListener {
    constructor(token, chatId, supervisor) {
        this.token = token;
        this.chatId = chatId;
        this.supervisor = supervisor;

        if (!token) {
            console.warn("TelegramListener: No token provided.");
            return;
        }

        this.bot = new TelegramBot(token, { polling: true });
        this._start();
    }

    _start() {
        console.log("TelegramListener v1.6 active.");

        this.bot.on("message", (msg) => {
            if (!msg.chat || msg.chat.id != this.chatId) return;
            this.supervisor.handleTelegramMessage(msg);
        });
    }
}
