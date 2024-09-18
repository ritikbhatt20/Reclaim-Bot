import TelegramBot from 'node-telegram-bot-api';

export async function processCodechefData(githubId: any, proof: any, providerName: string, chatId: number, bot: TelegramBot): Promise<boolean> {
  const username: string = JSON.parse(proof[0].claimData.context).extractedParameters.URL_PARAMS_GRD;
  console.log(`Verified Codechef username for ${githubId}: ${username}`);

  bot.sendMessage(chatId, `Codechef verification successful! Your username is: ${username}`);
  console.log('Proof:', proof[0]);
  return true;
}