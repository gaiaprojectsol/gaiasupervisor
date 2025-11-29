// ---------------------------------------------------------------------
// DashboardServer.js — Gaia Project Supervisor v1.6
// Secure Express server with CSP + REST API for dashboard
// ---------------------------------------------------------------------

import express from "express";
import path from "path";
import helmet from "helmet";

export default function DashboardServer(supervisor) {
    const app = express();

    // ------------------------------------------------------------
    // SECURITY — Content Security Policy
    // ------------------------------------------------------------
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'"],
                connectSrc: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'none'"],
                frameAncestors: ["'none'"]
            }
        })
    );

    app.use(express.json());

    // ------------------------------------------------------------
    // GET STATE
    // ------------------------------------------------------------
    app.get("/state", (req, res) => {
        try {
            const state = supervisor.getState();
            res.json(state);
        } catch (err) {
            console.error("Error getting state:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // ------------------------------------------------------------
    // GENERATE DAILY REPORT
    // ------------------------------------------------------------
    app.post("/generate-report", async (req, res) => {
        try {
            const report = await supervisor.generateDailyReport();
            res.json(report);
        } catch (err) {
            console.error("Error generating report:", err);
            res.status(500).json({ error: "Failed to generate report" });
        }
    });

    // ------------------------------------------------------------
    // STATIC DASHBOARD
    // ------------------------------------------------------------
    const dashboardPath = path.resolve("./src/server");
    app.use("/", express.static(dashboardPath));

    // Fallback — serve dashboard.html
    app.get("*", (req, res) => {
        res.sendFile(path.join(dashboardPath, "dashboard.html"));
    });

    // ------------------------------------------------------------
    // START SERVER
    // ------------------------------------------------------------
    const PORT = 4444;
    app.listen(PORT, () =>
        console.log(`📊 Dashboard v1.6 running at http://localhost:${PORT}`)
    );
}
