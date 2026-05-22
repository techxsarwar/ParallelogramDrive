import { Telegraf } from 'telegraf';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

// Initialize Telegraf bot instance
export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

/**
 * Uploads a file buffer to Telegram and returns the message ID and file ID.
 * Handles all result types: document, photo, video, audio, animation, voice, etc.
 */
export async function uploadFileToTelegram(buffer: Buffer, fileName: string) {
  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID is not defined in environment variables');
  }

  const result = await bot.telegram.sendDocument(process.env.TELEGRAM_CHAT_ID, {
    source: buffer,
    filename: fileName,
  });

  // Telegram may return different media types depending on the file.
  // Extract file_id from whichever type was returned.
  let fileId: string | undefined;

  if ('document' in result && result.document) {
    fileId = result.document.file_id;
  } else if ('photo' in result && result.photo) {
    // Photos are returned as an array; take the highest resolution
    const photos = result.photo as any[];
    fileId = photos[photos.length - 1]?.file_id;
  } else if ('video' in result && result.video) {
    fileId = result.video.file_id;
  } else if ('audio' in result && result.audio) {
    fileId = result.audio.file_id;
  } else if ('animation' in result && result.animation) {
    fileId = result.animation.file_id;
  } else if ('voice' in result && result.voice) {
    fileId = result.voice.file_id;
  } else if ('video_note' in result && result.video_note) {
    fileId = result.video_note.file_id;
  } else if ('sticker' in result && result.sticker) {
    fileId = result.sticker.file_id;
  }

  if (!fileId) {
    console.error('[UPLOAD] Unexpected result from Telegram:', JSON.stringify(result));
    throw new Error('Failed to extract file_id from Telegram response.');
  }

  return {
    messageId: result.message_id.toString(),
    fileId,
  };
}

/**
 * Retrieves the temporary download URL for a file stored in Telegram.
 */
export async function getFileLinkFromTelegram(fileId: string) {
  const fileLink = await bot.telegram.getFileLink(fileId);
  return fileLink.href;
}

/**
 * Deletes a file from the Telegram channel using its message ID.
 */
export async function deleteMessageFromTelegram(messageId: string) {
  if (!process.env.TELEGRAM_CHAT_ID) {
    throw new Error('TELEGRAM_CHAT_ID is not defined in environment variables');
  }

  try {
    await bot.telegram.deleteMessage(process.env.TELEGRAM_CHAT_ID, parseInt(messageId, 10));
    return true;
  } catch (error) {
    console.error('Failed to delete message from Telegram', error);
    return false;
  }
}
