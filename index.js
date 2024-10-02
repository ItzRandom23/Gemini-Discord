const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API = ""; 
const BOT_TOKEN = "";
const CHANNELID = "";

if (!API || !BOT_TOKEN || !CHANNELID) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const ai = new GoogleGenerativeAI(API); 
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(BOT_TOKEN); 

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channel.id !== CHANNELID) return;

  const userMessage = message.content.trim();
  if (!userMessage) return;

  try {
    await message.channel.sendTyping();

    const { response } = await model.generateContent(userMessage);
    const generatedText = response.text().trim();
    if (!generatedText) {
      message.reply("I have nothing to say.");
      return;
    }

    if (generatedText.includes("Response was blocked due to SAFETY")) {
      return message.reply(
        "I'm sorry, but I can't provide that response to keep the content safe and clean."
      );
    }

    if (generatedText.length > 2000) {
      return message.reply(
        "I have too much to say for Discord to fit in one message."
      );
    }

    message.reply(generatedText);
  } catch (error) {
    console.error("Error generating response:", error);
    message.reply(
      "An error occurred while processing your request. Please try again later."
    );
  }
});