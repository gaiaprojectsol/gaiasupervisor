// -----------------------------------------------------------
// CommitBuilder.js — Gaia Project Supervisor v1.6
// -----------------------------------------------------------

export default class CommitBuilder {
    constructor() {
        this.pendingCommits = [];
    }

    _extractCommitMessage(aiOutput) {
        const patterns = [
            /commit message:\s*(.+)/i,
            /suggest(ed)? commit:\s*(.+)/i,
            /commit:\s*(.+)/i
        ];

        for (const regex of patterns) {
            const match = aiOutput.match(regex);
            if (match) return match[1].trim();
        }

        return null;
    }

    maybeAddCommit(filePath, diff, aiOutput) {
        const commitMsg = this._extractCommitMessage(aiOutput);
        if (!commitMsg) return;

        this.pendingCommits.push({
            file: filePath,
            diff,
            message: commitMsg
        });
    }

    clear() {
        this.pendingCommits = [];
    }
}
