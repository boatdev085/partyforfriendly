/**
 * Discord sync helper – mirrors app chat messages to a party's Discord channel.
 * Fire-and-forget: errors are swallowed so they never break the main request.
 */
import { sendDiscordMessage } from "@/lib/discord-bot"

/**
 * Send an app message to a Discord text channel.
 *
 * @param partyDiscordChannel - Discord channel ID to post into (party's discord_channel_id)
 * @param username            - Display name of the sender
 * @param content             - Message content
 */
export async function syncMessageToDiscord(
  partyDiscordChannel: string,
  username: string,
  content: string,
): Promise<void> {
  if (!process.env.DISCORD_BOT_TOKEN || !partyDiscordChannel) return
  await sendDiscordMessage(partyDiscordChannel, `**${username}**: ${content}`)
}
