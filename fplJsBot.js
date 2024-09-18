const TelegramBot = require('node-telegram-bot-api');
const { Reclaim } = require('@reclaimprotocol/js-sdk');
const axios = require('axios');

// Replace with your token from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Reclaim Protocol credentials
const reclaimAppID = process.env.RECLAIM_APP_ID;
const reclaimAppSecret = process.env.RECLAIM_APP_SECRET;

// Create a new bot using polling (long-polling method)
const bot = new TelegramBot(token, { polling: true });

// Listener for receiving messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Respond to specific messages
  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to MyFirstBot! Type /connect to start the Reclaim verification.');
  } else if (messageText === 'hi') {
    bot.sendMessage(chatId, 'Hello! How can I assist you today?');
  } else {
    bot.sendMessage(chatId, 'You said: ' + messageText);
  }
});

// Handle /connect command to trigger Reclaim Protocol
bot.onText(/\/connect/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Call function to sign with Reclaim Protocol and get the verification URL
    const signedUrl = await signWithProviderID('ritikbhatt020', 'Codechef', chatId);

    // Define the button with the Reclaim verification URL
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Verify with Codechef', url: signedUrl }]
        ]
      }
    };

    // Send a message with the verification link
    bot.sendMessage(chatId, 'Click the button below to verify your Codechef profile:', options);

  } catch (error) {
    bot.sendMessage(chatId, 'Failed to generate verification link. Please try again.');
    console.error('Error during Reclaim verification:', error);
  }
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const helpMessage = `
  Available Commands:
  /start - Start the bot
  /connect - Connect to a service using Reclaim Protocol
  /help - List of commands
  `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

// Reclaim Protocol integration
async function signWithProviderID(githubId, providerName, chatId) {
  const reclaimClient = new Reclaim.ProofRequest(reclaimAppID);
  
  const providerId = await getProviderIdByName(providerName); // Replace this with actual provider logic
  await reclaimClient.buildProofRequest(providerId, true, "V2Linking");

  await reclaimClient.setRedirectUrl('https://www.reclaimprotocol.org');

  reclaimClient.setSignature(
    await reclaimClient.generateSignature(reclaimAppSecret)
  );

  const { requestUrl: signedUrl } =
    await reclaimClient.createVerificationRequest();

  // Optionally handle the session and callbacks as in your Next.js app
  await handleReclaimSession(githubId, reclaimClient, providerName, chatId);

  return signedUrl;
}

// Handle Reclaim session and send the username back to the bot
async function handleReclaimSession(githubId, reclaimClient, providerName, chatId) {
  reclaimClient.startSession({
    onSuccessCallback: async (proof) => {
      try {
        let processedData;

        switch (providerName) {
          case 'Codechef':
            processedData = await processCodechefData(githubId, proof, providerName, chatId);
            break;

          // Add more cases for other providers if needed
          
          default:
            throw new Error(`Unsupported provider: ${providerName}`);
        }
      } catch (error) {
        console.error(`Failed to process Reclaim proof for githubId: ${githubId}`, error);
      }
    },
    onFailureCallback: (error) => {
      console.error(`Verification failed for githubId: ${githubId}`, error);
    },
  });
}

// Example data processing for Codechef
async function processCodechefData(githubId, proof, providerName, chatId) {
  const username = JSON.parse(proof[0].claimData.context).extractedParameters.URL_PARAMS_GRD;
  console.log(`Verified Codechef username for ${githubId}: ${username}`);

  // Send the username back to the Telegram chat
  bot.sendMessage(chatId, `Codechef verification successful! Your username is: ${username}`);

  // Process the proof or store it in the database
  console.log("Proof:", proof[0]);
  return true;
}

// Get provider ID by name (mock function, update this based on your provider setup)
async function getProviderIdByName(providerName) {
  const providerMap = {
    'Codechef': '97e682b9-f89d-4517-b7de-0935242a3c83',
    // Add other providers here
  };
  
  return providerMap[providerName];
}

// Log when the bot starts
console.log('Bot is up and running...');
