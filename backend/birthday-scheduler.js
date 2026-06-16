const fs = require("fs");
const path = require("path");
const axios = require("axios");

/**
 * Birthday Message Scheduler
 * Automatically sends birthday messages + images at specified time
 * Runs every minute to check for birthdays
 */

const MEMBERS_FILE = path.join(__dirname, "members.json");
const LAST_SENT_FILE = path.join(__dirname, ".birthday-sent.json");
const ULTRAMSG_INSTANCE = process.env.ULTRAMSG_INSTANCE || "";
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN || "";

function devLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.info(...args);
  }
}

function isSchedulerEnabled() {
  return String(process.env.BIRTHDAY_SCHEDULER_ENABLED || "true").toLowerCase() !== "false";
}

function getScheduledTime() {
  return process.env.BIRTHDAY_DISPATCH_TIME || "08:00";
}

// Track which birthdays were sent today to avoid duplicates
function getLastSentData() {
  try {
    if (fs.existsSync(LAST_SENT_FILE)) {
      const data = fs.readFileSync(LAST_SENT_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    devLog("Note: .birthday-sent.json not found or invalid, will create new one");
  }
  return { date: null, sentMembers: [] };
}

function saveLastSentData(data) {
  try {
    fs.writeFileSync(LAST_SENT_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Erro ao salvar .birthday-sent.json:", err.message);
  }
}

function getTodayString() {
  const today = new Date();
  return `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function getCurrentTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isBirthdayToday(birthDateStr) {
  if (birthDateStr === undefined || birthDateStr === null || birthDateStr === "") {
    return false;
  }

  let dateString = birthDateStr;
  if (birthDateStr instanceof Date) {
    dateString = birthDateStr.toISOString();
  } else if (typeof birthDateStr !== "string") {
    dateString = String(birthDateStr);
  }

  const parts = dateString.split("-");
  if (parts.length < 3) return false;

  const month = parts[1].padStart(2, "0");
  const day = parts[2].slice(0, 2).padStart(2, "0");
  return `${month}-${day}` === getTodayString();
}

async function sendBirthdayMessage(member) {
  const phone = member.phone;
  const name = member.name;
  const photoUrl = member.photoUrl || null;
  const pastorName = "Pastor"; // Can be customized later from settings

  const messageText = `Graça e Paz, querida ${name}! 🙏\n\nNós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂\n\nQue o Senhor te abençoe rica e abundantemente neste dia tão especial. Que Seus planos se realizem em sua vida!\n\n"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)\n\nUm forte abraço do seu ${pastorName}! 💪✨`;

  try {
    if (!ULTRAMSG_INSTANCE || !ULTRAMSG_TOKEN) {
      throw new Error("Configure ULTRAMSG_INSTANCE e ULTRAMSG_TOKEN no backend/.env antes do envio automático.");
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const finalPhoneWithPlus = finalPhone.startsWith("+") ? finalPhone : `+${finalPhone}`;

    const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/`;
    let endpoint = `${apiUrl}messages/chat?token=${encodeURIComponent(ULTRAMSG_TOKEN)}`;

    // If photo exists, send as image with caption
    if (photoUrl) {
      endpoint = `${apiUrl}messages/image?token=${encodeURIComponent(ULTRAMSG_TOKEN)}`;
      const formBody = new URLSearchParams();
      formBody.append("to", finalPhoneWithPlus);
      formBody.append("image", photoUrl);
      formBody.append("caption", messageText);

      const response = await axios.post(endpoint, formBody.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      devLog(`✅ Parabéns COM FOTO enviado para ${name} (${finalPhoneWithPlus}) - ID: ${response.data.id}`);
      return { success: true, id: response.data.id };
    } else {
      // Send as text only
      const formBody = new URLSearchParams();
      formBody.append("to", finalPhoneWithPlus);
      formBody.append("body", messageText);

      const response = await axios.post(endpoint, formBody.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      devLog(`✅ Parabéns ENVIADO para ${name} (${finalPhoneWithPlus}) - ID: ${response.data.id}`);
      return { success: true, id: response.data.id };
    }
  } catch (err) {
    console.error(`❌ Erro ao enviar parabéns para ${name}:`, err.response?.data || err.message);
    return { success: false, error: err.message };
  }
}

async function checkAndSendBirthdays() {
  try {
    if (!isSchedulerEnabled()) {
      return;
    }

    // Check if current time matches scheduled time
    const currentTime = getCurrentTimeString();
    if (currentTime !== getScheduledTime()) {
      return; // Not yet time to send
    }

    // Load members
    if (!fs.existsSync(MEMBERS_FILE)) {
      return;
    }

    const membersData = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
    const lastSent = getLastSentData();
    const today = getTodayString();

    // If we already sent today, skip
    if (lastSent.date === today) {
      return;
    }

    // Check for birthdays today
    const birthdayMembers = membersData.filter(isBirthdayToday);

    if (birthdayMembers.length === 0) {
      // Reset if no birthdays (prepare for next day)
      saveLastSentData({ date: today, sentMembers: [] });
      return;
    }

    devLog(`\n🎂 BIRTHDAY DISPATCH - ${new Date().toLocaleString("pt-BR")}`);
    devLog(`Found ${birthdayMembers.length} birthday(ies) today`);

    const sentMembers = [];
    for (const member of birthdayMembers) {
      const result = await sendBirthdayMessage(member);
      if (result.success) {
        sentMembers.push({ id: member.id, name: member.name, messageId: result.id });
      }
      // Small delay between sends to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Save that we sent today
    saveLastSentData({ date: today, sentMembers });
    devLog(`✅ All birthday messages sent and logged!\n`);
  } catch (err) {
    console.error("❌ Error in birthday scheduler:", err.message);
  }
}

// Start scheduler
function startScheduler() {
  devLog(`🎂 Birthday Scheduler started`);
  devLog(`⏰ Scheduled time: ${getScheduledTime()}`);
  devLog(`📱 UltraMsg Instance: ${ULTRAMSG_INSTANCE || "not configured"}`);
  devLog(`🔄 Checking every minute...\n`);

  // Check immediately on startup
  checkAndSendBirthdays();

  // Check every minute
  setInterval(checkAndSendBirthdays, 60 * 1000);
}

module.exports = { startScheduler, checkAndSendBirthdays };
