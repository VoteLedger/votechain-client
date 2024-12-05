export const generateMessage = () => {
  // Add contextual information (customize as needed)
  const appName = "VoteChain";
  const timestamp = new Date().toISOString(); // Current timestamp

  // Construct the message
  const message = `
    Welcome to ${appName}!
    Please sign this message to authenticate.
    Timestamp: ${timestamp}
  `.trim(); // Remove extra spaces

  return message;
};
