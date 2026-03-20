import "dotenv/config";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

client.once(Events.ClientReady, (c) => {
  console.log(`Discord bot ready: ${c.user.tag}`);
});

// Sync party events to Discord channels
supabase
  .channel("parties")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "parties" },
    async (payload) => {
      if (payload.eventType === "INSERT") {
        await handlePartyCreated(payload.new as Record<string, unknown>);
      } else if (payload.eventType === "UPDATE") {
        await handlePartyUpdated(
          payload.new as Record<string, unknown>,
          payload.old as Record<string, unknown>
        );
      }
    }
  )
  .subscribe();

async function handlePartyCreated(party: Record<string, unknown>) {
  console.log("Party created:", party.id);
  // TODO: Post party announcement to Discord channel
}

async function handlePartyUpdated(
  newParty: Record<string, unknown>,
  oldParty: Record<string, unknown>
) {
  if (newParty.status === "closed" && oldParty.status !== "closed") {
    console.log("Party closed:", newParty.id);
    // TODO: Notify members in Discord
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
