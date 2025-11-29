// -----------------------------------------------------------
// TelegramAnalytics.js — Gaia Project Supervisor v1.6
// Fetches group member count & today's message count
// -----------------------------------------------------------

import TelegramBot from "node-telegram-bot-api";

export default class TelegramAnalytics {
    constructor(token, chatId, logger) {
        this.token = token;
        this.chatId = chatId;
        this.logger = logger;

        if (token) {
            this.bot = new TelegramBot(token, { polling: false });
        } else {
            this.bot = null;
        }

        console.log("TelegramAnalytics v1.6 ready.");
    }

    async fetchChatStats() {
        if (!this.bot || !this.chatId) {
            console.warn("TelegramAnalytics: bot not configured.");
            return null;
        }

        try {
            const members = await this.bot.getChatMemberCount(this.chatId);

            const todayEvents = this.logger.getTodayEvents();
            const msgCount = todayEvents.filter(
                (e) => e.type === "telegram"
            ).length;

            return {
                members,
                messages_today: msgCount
            };
        } catch (err) {
            console.error("TelegramAnalytics error:", err);
            return null;
        }
    }
}
