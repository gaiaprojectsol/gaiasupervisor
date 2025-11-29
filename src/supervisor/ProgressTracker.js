// -----------------------------------------------------------
// ProgressTracker.js — Gaia Project Supervisor v1.6
// -----------------------------------------------------------

import fs from "fs";

export default class ProgressTracker {
    constructor() {
        this.statePath = "./src/data/supervisor_state.json";
        this.roadmapPath = "./src/data/roadmap.json";

        this.state = this._safeLoadJSON(this.statePath, { modules: {} });
        this.roadmap = this._safeLoadJSON(this.roadmapPath, { modules: {} });
    }

    _safeLoadJSON(path, fallback) {
        try {
            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, JSON.stringify(fallback, null, 2));
                return fallback;
            }
            return JSON.parse(fs.readFileSync(path, "utf-8"));
        } catch {
            fs.writeFileSync(path, JSON.stringify(fallback, null, 2));
            return fallback;
        }
    }

    _saveState() {
        fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    }

    _parseProgressUpdate(aiOutput) {
        const regex = /progress_update:\s*({[\s\S]*?})/i;
        const match = aiOutput.match(regex);
        if (!match) return null;

        try {
            return JSON.parse(match[1]);
        } catch {
            return null;
        }
    }

    maybeUpdateProgress(aiOutput) {
        const update = this._parseProgressUpdate(aiOutput);
        if (!update) return;

        const module = update.module;
        if (!module || !(module in this.state.modules)) return;

        const entry = this.state.modules[module];

        if (typeof update.progress === "number") {
            entry.progress = Math.max(0, Math.min(100, update.progress));
        }

        if (update.notes) {
            entry.notes = update.notes;
        }

        this._saveState();
    }
}
