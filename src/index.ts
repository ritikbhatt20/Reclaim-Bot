import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from './utils/envConfig';
import { handleMessage } from './handlers/messageHandler';
import { handleConnect } from './handlers/connectHandler';
import { handleHelp } from './handlers/helpHandler';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('message', (msg) => handleMessage(msg, bot));
bot.onText(/\/connect/, (msg) => handleConnect(msg, bot));
bot.onText(/\/help/, (msg) => handleHelp(msg, bot));

console.log('Bot is up and running...');
