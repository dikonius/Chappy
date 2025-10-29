import type { FormattedMessage } from "../data/types.js";

// Helper functions 
const generateMessageSK = (): string => `MSG#${new Date().toISOString()}`;

const formatMessages = (items: any[] | undefined): FormattedMessage[] =>
  (items || [])
    .filter((item: any) => item.sk.startsWith('MSG#'))
    .sort((a: any, b: any) => a.sk.localeCompare(b.sk))
    .map((item: any) => ({
      id: item.sk,
      content: item.content,
      senderId: item.senderId,
      timestamp: item.sk.split('#')[1],
    }));

export {generateMessageSK, formatMessages}