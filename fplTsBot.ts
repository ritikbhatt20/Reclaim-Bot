import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import axios from "axios";

dotenv.config();

const token: string = process.env.TELEGRAM_BOT_TOKEN ?? "";
const reclaimAppID: string = process.env.RECLAIM_APP_ID ?? "";
const reclaimAppSecret: string = process.env.RECLAIM_APP_SECRET ?? "";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg: TelegramBot.Message) => {
  const chatId: number = msg.chat.id;
  const messageText: string | undefined = msg.text;

  if (messageText === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to MyFirstBot! Type /connect to start the Reclaim verification."
    );
  } else if (messageText === "hi") {
    bot.sendMessage(chatId, "Hello! How can I assist you today?");
  } else {
    bot.sendMessage(chatId, "You said: " + messageText);
  }
});

bot.onText(/\/connect/, async (msg: TelegramBot.Message) => {
  const chatId: number = msg.chat.id;

  try {
    // Call function to sign with Reclaim Protocol and get the verification URL
    const signedUrl: string = await signWithProviderID(
      "ritikbhatt020",
      "Codechef",
      chatId
    );

    // Define the button with the Reclaim verification URL
    const options: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [[{ text: "Verify with Codechef", url: signedUrl }]],
      },
    };

    // Send a message with the verification link
    bot.sendMessage(
      chatId,
      "Click the button below to verify your Codechef profile:",
      options
    );
  } catch (error) {
    bot.sendMessage(
      chatId,
      "Failed to generate verification link. Please try again."
    );
    console.error("Error during Reclaim verification:", error);
  }
});

// Handle /help command
bot.onText(/\/help/, (msg: TelegramBot.Message) => {
  const helpMessage: string = `
  Available Commands:
  /start - Start the bot
  /connect - Connect to a service using Reclaim Protocol
  /help - List of commands
  `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

async function signWithProviderID(
  githubId: any,
  providerName: string,
  chatId: number
): Promise<string> {
  const reclaimClient = new Reclaim.ProofRequest(reclaimAppID);

  const providerId: string = await getProviderIdByName(providerName); // Replace this with actual provider logic
  await reclaimClient.buildProofRequest(providerId, true, "V2Linking");

  await reclaimClient.setRedirectUrl("https://www.reclaimprotocol.org");

  reclaimClient.setSignature(
    await reclaimClient.generateSignature(reclaimAppSecret)
  );

  const { requestUrl: signedUrl } =
    await reclaimClient.createVerificationRequest();

  await handleReclaimSession(githubId, reclaimClient, providerName, chatId);

  return signedUrl;
}

async function handleReclaimSession(
  githubId: any,
  reclaimClient: any,
  providerName: string,
  chatId: number
) {
  reclaimClient.startSession({
    onSuccessCallback: async (proof: any) => {
      try {
        let processedData: boolean;

        switch (providerName) {
          case "Codechef":
            processedData = await processCodechefData(
              githubId,
              proof,
              providerName,
              chatId
            );
            break;

          default:
            throw new Error(`Unsupported provider: ${providerName}`);
        }
      } catch (error) {
        console.error(
          `Failed to process Reclaim proof for githubId: ${githubId}`,
          error
        );
      }
    },
    onFailureCallback: (error: any) => {
      console.error(`Verification failed for githubId: ${githubId}`, error);
    },
  });
}

async function processCodechefData(
  githubId: any,
  proof: any,
  providerName: string,
  chatId: number
): Promise<boolean> {
  const username: string = JSON.parse(proof[0].claimData.context)
    .extractedParameters.URL_PARAMS_GRD;
  console.log(`Verified Codechef username for ${githubId}: ${username}`);

  bot.sendMessage(
    chatId,
    `Codechef verification successful! Your username is: ${username}`
  );

  console.log("Proof:", proof[0]);
  return true;
}

async function getProviderIdByName(providerName: string): Promise<string> {
  const providerMap: { [key: string]: string } = {
    Codechef: "97e682b9-f89d-4517-b7de-0935242a3c83",
  };

  return providerMap[providerName];
}

// Log when the bot starts
console.log("Bot is up and running...");
