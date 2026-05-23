import { db } from "./db";

/**
 * Authenticates a request using the x-api-key header.
 * Returns the associated userId or null if invalid.
 */
export async function authenticateApiKey(req: Request): Promise<string | null> {
  const apiKeyString = req.headers.get("x-api-key");
  if (!apiKeyString) return null;

  const keyRecord = await db.apiKey.findUnique({
    where: { key: apiKeyString },
  });

  if (!keyRecord) return null;

  // Update lastUsed timestamp in background asynchronously
  db.apiKey
    .update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    })
    .catch((err) => console.error("Failed to update API key lastUsed:", err));

  return keyRecord.userId;
}
