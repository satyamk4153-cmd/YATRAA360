"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = require("./routes/api");
const seed_demo_1 = require("./db/seed-demo");
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount API routes
app.use('/api', api_1.apiRouter);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'YATRA360' });
});
// Auto-seed demo trip on boot if no trips exist
if (db_1.db.getAllTrips().length === 0) {
    console.log('Seeding initial demo trip data for Yatra360...');
    (0, seed_demo_1.seedDemoTrip)();
}
app.listen(PORT, () => {
    console.log(`🚀 Yatra360 Reactive Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready for Hackathon Demonstration`);
});
