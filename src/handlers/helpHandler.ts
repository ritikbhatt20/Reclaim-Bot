import TelegramBot from 'node-telegram-bot-api';

export function handleHelp(msg: TelegramBot.Message, bot: TelegramBot) {
  const helpMessage: string = `
  Available Commands:
  /start - Start the bot
  /connect - Connect to a service using Reclaim Protocol
  /help - List of commands
  `;
  bot.sendMessage(msg.chat.id, helpMessage);
}
