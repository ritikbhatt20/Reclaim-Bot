import TelegramBot from 'node-telegram-bot-api';
import { signWithProviderID } from '../reclaim/reclaimClient';

export async function handleConnect(msg: TelegramBot.Message, bot: TelegramBot) {
  const chatId: number = msg.chat.id;

  try {
    const signedUrl: string = await signWithProviderID('ritikbhatt020', 'Codechef', chatId, bot);

    const options: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [[{ text: 'Verify with Codechef', url: signedUrl }]],
      },
    };

    bot.sendMessage(chatId, 'Click the button below to verify your Codechef profile:', options);
  } catch (error) {
    bot.sendMessage(chatId, 'Failed to generate verification link. Please try again.');
    console.error('Error during Reclaim verification:', error);
  }
}
