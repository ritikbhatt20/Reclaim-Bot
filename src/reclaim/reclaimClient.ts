import { Reclaim } from "@reclaimprotocol/js-sdk";
import { RECLAIM_APP_ID, RECLAIM_APP_SECRET } from "../utils/envConfig";
import { getProviderIdByName } from "./providerMap";
import { processCodechefData } from "./codechef/service";
import TelegramBot from "node-telegram-bot-api";

export async function signWithProviderID(
  githubId: any,
  providerName: string,
  chatId: number,
  bot: TelegramBot // Include bot instance here
): Promise<string> {
  const reclaimClient = new Reclaim.ProofRequest(RECLAIM_APP_ID);

  const providerId = await getProviderIdByName(providerName);
  await reclaimClient.buildProofRequest(providerId, true, "V2Linking");

  await reclaimClient.setRedirectUrl("https://www.reclaimprotocol.org");
  reclaimClient.setSignature(
    await reclaimClient.generateSignature(RECLAIM_APP_SECRET)
  );

  const { requestUrl: signedUrl } =
    await reclaimClient.createVerificationRequest();
  await handleReclaimSession(githubId, reclaimClient, providerName, chatId, bot); // Pass bot instance here

  return signedUrl;
}

export async function handleReclaimSession(
  githubId: any,
  reclaimClient: any,
  providerName: string,
  chatId: number,
  bot: TelegramBot // Include bot instance here
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
              chatId,
              bot // Pass bot instance here
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
