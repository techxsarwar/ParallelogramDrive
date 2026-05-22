import { Telegraf } from 'telegraf';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Initialize Telegraf bot instance
export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

/**
 * Uploads a file buffer to Telegram and returns the message ID and file ID.
 */
export async function uploadFileToTelegram(buffer: Buffer, fileName: string) {
  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID is not defined in environment variables');
  }

  const result = await bot.telegram.sendDocument(process.env.TELEGRAM_CHAT_ID, {
    source: buffer,
    filename: fileName,
  });

  if (!('document' in result)) {
      throw new Error('Failed to upload document to Telegram. No document returned.');
  }

  return {
    messageId: result.message_id.toString(),
    fileId: result.document.file_id,
  };
}

/**
 * Retrieves the temporary download URL for a file stored in Telegram.
 */
export async function getFileLinkFromTelegram(fileId: string) {
  const fileLink = await bot.telegram.getFileLink(fileId);
  return fileLink.href;
}
