// ---------------------------------------------------------------------
// DailyReportEngine.js — Gaia Project Supervisor v1.6
// Generates the comprehensive daily alignment report
// ---------------------------------------------------------------------

import SocialSummary from "../analytics/SocialSummary.js";

export default class DailyReportEngine {
    constructor(openai, logger, progressTracker) {
        this.openai = openai;
        this.logger = logger;
        this.progress = progressTracker;

        this.socialSummary = new SocialSummary(openai);

        console.log("DailyReportEngine v1.6 ready.");
    }

    async createDailyReport({ xStats, telegramStats, todayEvents }) {
        const socialSummary = await this.socialSummary.generateSummary({
            xStats,
            telegramStats,
            events: todayEvents
        });

        const roadmap = this.progress.roadmap;
        const state = this.progress.state;

        const finalReport = await this._generateAIReport({
            xStats,
            telegramStats,
            todayEvents,
            socialSummary,
            roadmap,
            state
        });

        return finalReport;
    }

    async _generateAIReport(payload) {
        const {
            xStats,
            telegramStats,
            todayEvents,
            socialSummary,
            roadmap,
            state
        } = payload;

        const prompt = `
You are GAIA-SUPERVISOR v1.6.
Produce the daily alignment report for the Gaia Project.

DATA:
X_STATS:
${JSON.stringify(xStats, null, 2)}

TELEGRAM_STATS:
${JSON.stringify(telegramStats, null, 2)}

SOCIAL_SUMMARY:
${socialSummary}

ROADMAP:
${JSON.stringify(roadmap, null, 2)}

CURRENT_STATE:
${JSON.stringify(state, null, 2)}

TODAY_EVENTS:
${JSON.stringify(todayEvents, null, 2)}

SCORING RULES:
- roadmap_alignment_score: -50 to +50
- social_alignment_score: -50 to +50
- momentum_score: -20 to +20
- overall_alignment_score = roadmap + social + momentum

FORMAT JSON ONLY:
{
  "summary": "",
  "roadmap_alignment_score": 0,
  "social_alignment_score": 0,
  "momentum_score": 0,
  "overall_alignment_score": 0,
  "key_events": [],
  "warnings": [],
  "next_steps": []
}
`;

        const result = await this.openai.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                { role: "system", content: "You generate daily alignment reports for Gaia Project." },
                { role: "user", content: prompt }
            ]
        });

        const raw = result.choices[0].message.content;

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error("DailyReportEngine: Failed to parse JSON:", err);
            console.error("Raw output:", raw);

            parsed = {
                summary: "AI formatting error. Review raw output.",
                roadmap_alignment_score: 0,
                social_alignment_score: 0,
                momentum_score: 0,
                overall_alignment_score: 0,
                key_events: [],
                warnings: ["JSON parsing error"],
                next_steps: []
            };
        }

        parsed.generated_at = new Date().toISOString();
        return parsed;
    }
}
