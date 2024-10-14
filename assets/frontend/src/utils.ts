// utils.ts
export const fetchIpAddress = async (): Promise<{
  ip?: string;
  error?: string;
}> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return { ip: data.ip };
  } catch (err) {
    console.error("Failed to fetch IP address:", err);
    return { error: "Failed to retrieve IP address" };
  }
};
