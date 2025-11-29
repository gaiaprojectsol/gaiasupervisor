import dotenv from "dotenv";
dotenv.config();

import Supervisor from "./supervisor/Supervisor.js";
import DashboardServer from "./server/DashboardServer.js";

import FileWatcher from "./watchers/FileWatcher.js";
import TelegramListener from "./listeners/TelegramListener.js";
import XListener from "./listeners/XListener.js";

// -----------------------------------------------------
// INITIALIZE SUPERVISOR CORE
// -----------------------------------------------------
const supervisor = new Supervisor();

console.log("🔥 Gaia Supervisor v1.6 starting…");


// -----------------------------------------------------
// START DASHBOARD SERVER
// -----------------------------------------------------
DashboardServer(supervisor);


// -----------------------------------------------------
// OPTIONAL: FILE WATCHER (Gaia SDK)
// -----------------------------------------------------
if (process.env.LOCAL_WATCH_PATH) {
    console.log("📁 FileWatcher enabled at:", process.env.LOCAL_WATCH_PATH);

    new FileWatcher(
        process.env.LOCAL_WATCH_PATH,
        supervisor
    );
} else {
    console.log("📁 FileWatcher disabled — set LOCAL_WATCH_PATH in .env to enable.");
}


// -----------------------------------------------------
// OPTIONAL: TELEGRAM LISTENER
// -----------------------------------------------------
if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    console.log("🟦 TelegramListener enabled (polling GAIA group)…");

    new TelegramListener(
        process.env.TELEGRAM_BOT_TOKEN,
        process.env.TELEGRAM_CHAT_ID,
        supervisor
    );
} else {
    console.log("🟦 TelegramListener disabled — missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.");
}


// -----------------------------------------------------
// OPTIONAL: X (TWITTER) LISTENER
// -----------------------------------------------------
if (process.env.X_BEARER_TOKEN && process.env.X_USERNAME) {
    console.log("🐦 XListener enabled (polling @", process.env.X_USERNAME, ")");

    new XListener(
        process.env.X_BEARER_TOKEN,
        supervisor
    );
} else {
    console.log("🐦 XListener disabled — missing X_BEARER_TOKEN or X_USERNAME.");
}


console.log("✅ Supervisor v1.6 is now fully operational.");
console.log("📊 Dashboard: http://localhost:4444");
