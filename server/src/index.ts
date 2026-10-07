import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';
import { seedDemoTrip } from './db/seed-demo';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'YATRA360' });
});

// Auto-seed demo trip on boot if no trips exist
if (db.getAllTrips().length === 0) {
  console.log('Seeding initial demo trip data for Yatra360...');
  seedDemoTrip();
}

app.listen(PORT, () => {
  console.log(`🚀 Yatra360 Reactive Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready for Hackathon Demonstration`);
});
