// -----------------------------------------------------------
// SocialSummary.js — Gaia Project Supervisor v1.6
// Synthesizes social signals into a daily social summary
// -----------------------------------------------------------

export default class SocialSummary {
    constructor(openai) {
        this.openai = openai;
    }

    async generateSummary({ xStats, telegramStats, events }) {
        const telegramMsgs = events
            .filter((e) => e.type === "telegram")
            .map((e) => e.data.text);

        const xMsgs = events
            .filter((e) => e.type === "x")
            .map((e) => e.data.text);

        const prompt = `
You are GAIA-SUPERVISOR v1.6.
Summarize today's social activity.

X_STATS:
${JSON.stringify(xStats, null, 2)}

TELEGRAM_STATS:
${JSON.stringify(telegramStats, null, 2)}

X_MESSAGES:
${JSON.stringify(xMsgs, null, 2)}

TELEGRAM_MESSAGES:
${JSON.stringify(telegramMsgs, null, 2)}

Tasks:
1. Summarize community tone and sentiment.
2. Identify main themes.
3. Note spikes in activity.
4. Provide a Social Alignment Score (-50 to +50).
5. Limit to 200 words.`;

        const result = await this.openai.chat.completions.create({
            model: "gpt-4.1",
            messages: [
                { role: "system", content: "You analyze social activity." },
                { role: "user", content: prompt }
            ]
        });

        return result.choices[0].message.content;
    }
}
