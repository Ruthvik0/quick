interface Window {
  CreateRoom: (
    ipAddress: string,
    username: string
  ) => Promise<{ success: boolean; roomID: string; error: string }>;

  JoinRoom: (
    roomID: string,
    username: string
  ) => Promise<{ success: boolean; ownerName: string; error: string }>;

  SendMessage: (sender: string, content: string) => Promise<void>; // Assuming it returns void as it likely doesn't need to return anything

  GetMessages: (
    username: string
  ) => Promise<Array<{ sender: string; content: string }>>; // Returns an array of messages
}
