/**
 * Discord Bot helper – sends messages/embeds to Discord channels via Bot token.
 * All functions are no-ops when DISCORD_BOT_TOKEN or the target channel ID is missing,
 * so it is safe to call in environments where the bot is not configured.
 */

const DISCORD_API = "https://discord.com/api/v10"

// ---------------------------------------------------------------------------
// Low-level send
// ---------------------------------------------------------------------------

export async function sendDiscordMessage(
  channelId: string,
  content: string,
  embeds?: object[],
): Promise<unknown> {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, embeds }),
  })
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// High-level party events
// ---------------------------------------------------------------------------

export interface PartyCreatedPayload {
  id: string
  title: string
  game_name: string | null
  host_name: string
  max_members: number
  join_mode: string
}

export async function postPartyCreated(
  party: PartyCreatedPayload,
): Promise<void> {
  const channelId = process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID
  if (!channelId || !process.env.DISCORD_BOT_TOKEN) return

  const embed = {
    title: `🎮 Party เปิดใหม่: ${party.title}`,
    color: 0x7c6aff,
    fields: [
      { name: "เกม",          value: party.game_name ?? "ไม่ระบุ", inline: true },
      { name: "หัวหน้าปาร์ตี้", value: party.host_name,            inline: true },
      { name: "ขนาด",          value: `${party.max_members} คน`,   inline: true },
      { name: "การเข้าร่วม",   value: party.join_mode,              inline: true },
    ],
    footer: { text: "PartyForFriendly" },
    timestamp: new Date().toISOString(),
  }

  await sendDiscordMessage(channelId, "", [embed])
}

export async function postPartyFull(partyTitle: string): Promise<void> {
  const channelId = process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID
  if (!channelId || !process.env.DISCORD_BOT_TOKEN) return
  await sendDiscordMessage(channelId, `✅ ปาร์ตี้ **${partyTitle}** เต็มแล้ว`)
}

export async function postPartyClosed(partyTitle: string): Promise<void> {
  const channelId = process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID
  if (!channelId || !process.env.DISCORD_BOT_TOKEN) return
  await sendDiscordMessage(channelId, `🔒 ปาร์ตี้ **${partyTitle}** ปิดแล้ว`)
}
