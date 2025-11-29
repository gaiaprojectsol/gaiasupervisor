// -----------------------------------------------------------
// XAnalytics.js — Gaia Project Supervisor v1.6
// Pulls daily account stats from X (Twitter)
// -----------------------------------------------------------

import needle from "needle";

export default class XAnalytics {
    constructor(bearerToken, username) {
        this.token = bearerToken;
        this.username = username;
        this.baseUrl = "https://api.twitter.com/2";

        console.log("XAnalytics v1.6 ready for:", username);
    }

    async fetchUserStats() {
        if (!this.token || !this.username) {
            console.warn("XAnalytics: missing token or username");
            return null;
        }

        try {
            const url = `${this.baseUrl}/users/by/username/${this.username}?user.fields=public_metrics`;

            const response = await needle(
                "get",
                url,
                {},
                { headers: { Authorization: `Bearer ${this.token}` } }
            );

            if (response.statusCode !== 200) {
                console.warn("XAnalytics: lookup failed", response.body);
                return null;
            }

            const user = response.body.data;
            const metrics = user.public_metrics || {};

            return {
                id: user.id,
                followers: metrics.followers_count,
                following: metrics.following_count,
                tweet_count: metrics.tweet_count,
                listed_count: metrics.listed_count
            };
        } catch (err) {
            console.error("XAnalytics: error fetching stats:", err);
            return null;
        }
    }
}
