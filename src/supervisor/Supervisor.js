// -----------------------------------------------
// Supervisor.js — Gaia Project Supervisor v1.6
// Hybrid style: clean, structured, minimal clutter
// -----------------------------------------------

import OpenAI from "openai";
import Logger from "./Logger.js";
import ProgressTracker from "./ProgressTracker.js";
import CommitBuilder from "./CommitBuilder.js";

import XAnalytics from "../analytics/XAnalytics.js";
import TelegramAnalytics from "../analytics/TelegramAnalytics.js";
import DailyReportEngine from "../reporting/DailyReportEngine.js";

export default class Supervisor {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        this.logger = new Logger();
        this.progress = new ProgressTracker();
        this.commitBuilder = new CommitBuilder();

        this.xAnalytics = new XAnalytics(
            process.env.X_BEARER_TOKEN,
            process.env.X_USERNAME
        );

        this.telegramAnalytics = new TelegramAnalytics(
            process.env.TELEGRAM_BOT_TOKEN,
            process.env.TELEGRAM_CHAT_ID,
            this.logger
        );

        this.dailyReportEngine = new DailyReportEngine(
            this.openai,
            this.logger,
            this.progress
        );

        this.systemPrompt = `
You are GAIA-SUPERVISOR v1.6.
Evaluate daily development progress, social signals,
roadmap alignment, and team momentum.`;

        console.log("Supervisor v1.6 fully initialized.");
    }

    async analyzeFileChange(path, diff) {
        const prompt = `
A code file changed.

FILE: ${path}
DIFF:
${diff}

ROADMAP:
${JSON.stringify(this.progress.roadmap)}

CURRENT_STATE:
${JSON.stringify(this.progress.state)}

Return: analysis + optional progress_update JSON.`;

        const result = await this.openai.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ]
        });

        const output = result.choices[0].message.content;

        this.logger.log("file_change", { path, output });
        this.commitBuilder.maybeAddCommit(path, diff, output);
        this.progress.maybeUpdateProgress(output);

        return output;
    }

    async handleTelegramMessage(msg) {
        const text = msg.text || "";
        const username = msg.from?.username || msg.from?.first_name || "unknown";

        const analysis = await this._classifySocial("telegram", text);

        this.logger.log("telegram", {
            from: username,
            text,
            analysis
        });
    }

    async handleXMessage(payload) {
        const data = payload?.data;
        if (!data?.text) return;

        const analysis = await this._classifySocial("x", data.text);

        this.logger.log("x", {
            tweet_id: data.id,
            text: data.text,
            analysis
        });
    }

    async _classifySocial(source, text) {
        const prompt = `
A message came from ${source}.
MESSAGE: "${text}"

Return category + sentiment score + recommended action.`;

        const result = await this.openai.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ]
        });

        return result.choices[0].message.content;
    }

    async generateDailyReport() {
        const xStats = await this.xAnalytics.fetchUserStats();
        const telegramStats = await this.telegramAnalytics.fetchChatStats();
        const todayEvents = this.logger.getTodayEvents();

        const report = await this.dailyReportEngine.createDailyReport({
            xStats,
            telegramStats,
            todayEvents
        });

        this.logger.saveDailyReport(report);

        return report;
    }

    getState() {
        return {
            roadmap: this.progress.roadmap,
            state: this.progress.state,
            logs: this.logger.logs,
            pendingCommits: this.commitBuilder.pendingCommits,
            latestReport: this.logger.getLatestDailyReport()
        };
    }
}
