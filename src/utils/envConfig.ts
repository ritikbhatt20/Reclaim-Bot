import dotenv from 'dotenv';

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
export const RECLAIM_APP_ID = process.env.RECLAIM_APP_ID ?? '';
export const RECLAIM_APP_SECRET = process.env.RECLAIM_APP_SECRET ?? '';
