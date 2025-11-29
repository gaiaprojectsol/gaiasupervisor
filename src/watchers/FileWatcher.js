// ----------------------------------------------------------------------
// FileWatcher.js — Gaia Project Supervisor v1.6
// Watches a folder for .js changes and passes diffs to Supervisor
// ----------------------------------------------------------------------

import fs from "fs";
import path from "path";
import crypto from "crypto";

export default class FileWatcher {
    constructor(targetPath, supervisor) {
        this.targetPath = targetPath;
        this.supervisor = supervisor;
        this.fileHashes = new Map();

        console.log("FileWatcher v1.6 watching:", targetPath);

        this._scanInitialFiles();
        this._startWatcher();
    }

    _scanInitialFiles() {
        const files = this._getAllFiles(this.targetPath);
        for (const f of files) {
            const content = fs.readFileSync(f, "utf-8");
            this.fileHashes.set(f, this._hash(content));
        }
    }

    _getAllFiles(dir) {
        let results = [];
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                results = results.concat(this._getAllFiles(filePath));
            } else if (filePath.endsWith(".js")) {
                results.push(filePath);
            }
        }
        return results;
    }

    _hash(str) {
        return crypto.createHash("sha256").update(str).digest("hex");
    }

    _startWatcher() {
        fs.watch(this.targetPath, { recursive: true }, async (_, filename) => {
            if (!filename.endsWith(".js")) return;

            const fullPath = path.join(this.targetPath, filename);
            if (!fs.existsSync(fullPath)) return;

            const newContent = fs.readFileSync(fullPath, "utf-8");
            const newHash = this._hash(newContent);
            const oldHash = this.fileHashes.get(fullPath);

            if (oldHash && newHash !== oldHash) {
                const diff = await this._getDiff(fullPath);
                await this.supervisor.analyzeFileChange(fullPath, diff);
                this.fileHashes.set(fullPath, newHash);
            }
        });
    }

    async _getDiff(filePath) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");

        return [
            `--- ${filePath}`,
            `+++ ${filePath}`,
            ...lines.map((l, i) => `${i + 1}: ${l}`)
        ].join("\n");
    }
}
