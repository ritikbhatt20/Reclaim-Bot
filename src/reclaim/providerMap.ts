export async function getProviderIdByName(
  providerName: string
): Promise<string> {
  const providerMap: { [key: string]: string } = {
    Codechef: "97e682b9-f89d-4517-b7de-0935242a3c83",
    // Add other providers here
  };

  return providerMap[providerName];
}
