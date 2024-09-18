import TelegramBot from 'node-telegram-bot-api';

export function handleMessage(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId: number = msg.chat.id;
  const messageText: string | undefined = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to Reclaim Protocol Bot! Type /connect to start the Reclaim verification.');
  } else if (messageText === 'hi') {
    bot.sendMessage(chatId, 'Hello! How can I assist you today?');
  } else {
    bot.sendMessage(chatId, 'You said: ' + messageText);
  }
}
