// ----------------------------------------------------------------------
// XListener.js — Gaia Project Supervisor v1.6
// Polls X (Twitter) every 60 seconds for new mentions
// ----------------------------------------------------------------------

import needle from "needle";

export default class XListener {
    constructor(bearerToken, supervisor) {
        this.token = bearerToken;
        this.supervisor = supervisor;
        this.baseUrl = "https://api.twitter.com/2";
        this.lastSeenId = null;

        if (!bearerToken) {
            console.warn("XListener: Missing token.");
            return;
        }

        console.log("XListener v1.6 polling every 60 seconds.");
        setInterval(() => this._poll(), 60000);
    }

    async _poll() {
        try {
            const userRes = await needle(
                "get",
                `${this.baseUrl}/users/by/username/${process.env.X_USERNAME}`,
                {},
                { headers: { Authorization: `Bearer ${this.token}` } }
            );

            const userId = userRes.body?.data?.id;
            if (!userId) return;

            const mentionsUrl = `${this.baseUrl}/users/${userId}/mentions?max_results=10`;
            const mentionRes = await needle(
                "get",
                mentionsUrl,
                {},
                { headers: { Authorization: `Bearer ${this.token}` } }
            );

            const tweets = mentionRes.body?.data || [];
            if (!tweets.length) return;

            for (const tweet of tweets) {
                if (this.lastSeenId && tweet.id <= this.lastSeenId) continue;
                await this.supervisor.handleXMessage({ data: tweet });
            }

            this.lastSeenId = tweets[0].id;
        } catch (err) {
            console.error("XListener poll error:", err);
        }
    }
}
