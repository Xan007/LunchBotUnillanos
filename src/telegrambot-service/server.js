require("dotenv").config({ path: __dirname + "/.env" });
require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3001;

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.error(
    "❌ ERROR: No se encontró TELEGRAM_TOKEN en las variables de entorno."
  );
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

app.use(express.json());

const commands = [
  { command: "start", description: "Iniciar el bot" },
  { command: "help", description: "Mostrar ayuda" },
  { command: "options", description: "Mostrar opciones" },
];

bot
  .setMyCommands(commands)
  .then(() => {
    console.log("✅ Comandos registrados correctamente");
  })
  .catch((error) => {
    console.error("❌ Error registrando comandos:", error);
  });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Opción 1", callback_data: "option1" }],
        [{ text: "Opción 2", callback_data: "option2" }],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "¡Hola! Soy tu bot de Telegram 🤖. Elige una opción:",
    inlineKeyboard
  );
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "option1") {
    bot.sendMessage(chatId, "Elegiste la Opción 1");
  } else if (data === "option2") {
    bot.sendMessage(chatId, "Elegiste la Opción 2");
  }

  bot.answerCallbackQuery(query.id);
});

app.post("/sendMessage", async (req, res) => {
  const { chatId, text } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({ error: "Faltan chatId o text en el body" });
  }

  try {
    await bot.sendMessage(chatId, text);
    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
    res
      .status(500)
      .json({ success: false, error: "No se pudo enviar el mensaje" });
  }
});

app.post("/sendPhoto", async (req, res) => {
  const { chatId, photoUrl, caption } = req.body;

  if (!chatId || !photoUrl) {
    return res
      .status(400)
      .json({ error: "Faltan chatId o photoUrl en el body" });
  }

  try {
    await bot.sendPhoto(chatId, photoUrl, { caption });
    res.json({ success: true, message: "Imagen enviada correctamente" });
  } catch (error) {
    console.error("❌ Error enviando imagen:", error);
    res
      .status(500)
      .json({ success: false, error: "No se pudo enviar la imagen" });
  }
});

app.listen(PORT, () => {
  console.log(
    `🚀 Servidor corriendo en http://localhost:${PORT} (o en Render)`
  );
});
