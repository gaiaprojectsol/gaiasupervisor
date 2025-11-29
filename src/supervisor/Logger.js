// -----------------------------------------------------------
// Logger.js — Gaia Project Supervisor v1.6
// -----------------------------------------------------------

import fs from "fs";
import path from "path";

export default class Logger {
    constructor() {
        this.logPath = "./src/data/logs.json";
        this.dailyDir = "./src/data/daily_reports";

        this._ensureDirectories();

        if (!fs.existsSync(this.logPath)) {
            fs.writeFileSync(this.logPath, "[]");
        }

        this.logs = JSON.parse(fs.readFileSync(this.logPath, "utf-8"));
    }

    _ensureDirectories() {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (!fs.existsSync(this.dailyDir)) fs.mkdirSync(this.dailyDir, { recursive: true });
    }

    _saveLogs() {
        fs.writeFileSync(this.logPath, JSON.stringify(this.logs, null, 2));
    }

    log(type, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            data
        };
        this.logs.push(entry);
        this._saveLogs();
    }

    getTodayEvents() {
        const today = new Date().toISOString().slice(0, 10);
        return this.logs.filter((entry) => entry.timestamp.startsWith(today));
    }

    saveDailyReport(reportObject) {
        const iso = new Date().toISOString().slice(0, 10);
        const filePath = `${this.dailyDir}/${iso}.json`;
        fs.writeFileSync(filePath, JSON.stringify(reportObject, null, 2));
    }

    getLatestDailyReport() {
        if (!fs.existsSync(this.dailyDir)) return null;

        const files = fs.readdirSync(this.dailyDir)
            .filter((f) => f.endsWith(".json"))
            .sort();

        if (files.length === 0) return null;

        const latestFile = files[files.length - 1];
        const content = fs.readFileSync(`${this.dailyDir}/${latestFile}`, "utf-8");
        return JSON.parse(content);
    }
}
