type GenerateMessage = () => {
  message: string;
  nonce: number;
};

export const generateMessage: GenerateMessage = () => {
  // Generate a random nonce (a unique number for this session)
  const nonce = Math.floor(Math.random() * 1e6); // Random number up to 6 digits

  // Add contextual information (customize as needed)
  const appName = "My DApp";
  const timestamp = new Date().toISOString(); // Current timestamp

  // Construct the message
  const message = `
    Welcome to ${appName}!
    Please sign this message to authenticate.
    Nonce: ${nonce}
    Timestamp: ${timestamp}
  `.trim(); // Remove extra spaces

  return { message, nonce };
};
