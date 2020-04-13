const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client();

const sortChannels = async (channelArray, isDesc) => {
  const hoge = isDesc ? -1 : 1;
  channelArray.sort((a, b) => (a.name >= b.name ? hoge : -hoge));
  for (let i = 0; i < channelArray.length; i++) {
    const ch = channelArray[i];
    if (ch.position !== i) await ch.setPosition(i).catch(console.error);
  }
};

client.on("ready", () => {
  console.log("client ready...");
});

const COMMAND_PREFIX = "!sort";
client.on("message", async (message) => {
  if (message.channel.type !== "text") return;

  const content = message.content;
  if (!content.startsWith(COMMAND_PREFIX)) return;

  const args = content.split(" ").slice(1);
  const channel = message.channel;
  const sendMessage = (m) => channel.send(m).catch(console.err);

  if (args.length === 0) {
    sendMessage("Please specify category.");
    return;
  }

  const categoryName = args[0];
  const guildId = channel.guild.id;
  const guildChannels = client.channels.cache
    .array()
    .filter((ch) => ch.guild.id === guildId);
  const categoryIds = guildChannels
    .filter(
      (ch) =>
        ch.guild.id === guildId &&
        ch.type === "category" &&
        ch.name === categoryName
    )
    .map((cate) => cate.id);

  if (categoryIds.length === 0) {
    sendMessage("No targets.");
    return;
  }

  const isDesc = args[1] !== undefined && args[1].toLowerCase() === "desc";
  categoryIds.forEach(async (id) => {
    sortChannels(
      guildChannels.filter((ch) => ch.type === "text" && ch.parentID === id),
      isDesc
    );
    sortChannels(
      guildChannels.filter((ch) => ch.type === "voice" && ch.parentID === id),
      isDesc
    );
  });
});

client.login(process.env.TOKEN);
