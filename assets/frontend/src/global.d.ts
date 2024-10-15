interface Window {
  CreateRoom: (
    ipAddress: string,
    username: string
  ) => Promise<{ success: boolean; roomID: string; error: string }>;
}
