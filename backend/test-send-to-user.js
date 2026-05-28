const axios = require("axios");

/**
 * Test: Send Birthday Message with Image to User
 * Sends to: 11993470407 (user's WhatsApp number)
 */

const ULTRAMSG_INSTANCE = "instance176612";
const ULTRAMSG_TOKEN = "dxgcehk541zvpuj5";
const USER_PHONE = "11993470407"; // User's WhatsApp number

// Sample image URL (can be a party image or church logo)
const IMAGE_URL =
  "https://images.unsplash.com/photo-1514640202266-de2b63dde9fa?w=400"; // Celebration/party image

async function testSendWithImage() {
  console.log("=".repeat(70));
  console.log("🎂 TEST: Sending Birthday Message + Image to User");
  console.log("=".repeat(70));

  const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/image?token=${encodeURIComponent(ULTRAMSG_TOKEN)}`;

  const messageText = `Graça e Paz! 🙏

Nós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂

Que o Senhor te abençoe rica e abundantemente neste dia tão especial!

"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)

Um forte abraço! 💪✨`;

  const formBody = new URLSearchParams();
  formBody.append("to", `+55${USER_PHONE}`);
  formBody.append("image", IMAGE_URL);
  formBody.append("caption", messageText);

  try {
    console.log("\n📤 Sending...");
    console.log(`Phone: +55${USER_PHONE}`);
    console.log(`Image: ${IMAGE_URL}`);
    console.log(`Message Preview:\n${messageText}\n`);

    const response = await axios.post(apiUrl, formBody.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
    });

    console.log("✅ SUCCESS!");
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    console.log(`\n🎉 Message ID: ${response.data.id}`);
    console.log(`📱 Check your WhatsApp on ${USER_PHONE} - message should arrive in seconds!\n`);

    return response.data;
  } catch (err) {
    console.log("❌ FAILED!");
    if (err.response) {
      console.log(`Status: ${err.response.status}`);
      console.log(`Error:`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.log(`Error: ${err.message}`);
    }
    return null;
  }
}

async function testSendAsText() {
  console.log("\n" + "=".repeat(70));
  console.log("💬 TEST: Sending Birthday Message as Text (fallback)");
  console.log("=".repeat(70));

  const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat?token=${encodeURIComponent(ULTRAMSG_TOKEN)}`;

  const messageText = `Graça e Paz! 🙏

Nós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂

Que o Senhor te abençoe rica e abundantemente neste dia tão especial!

"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)

Um forte abraço! 💪✨`;

  const formBody = new URLSearchParams();
  formBody.append("to", `+55${USER_PHONE}`);
  formBody.append("body", messageText);

  try {
    console.log("\n📤 Sending text message...\n");

    const response = await axios.post(apiUrl, formBody.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
    });

    console.log("✅ SUCCESS!");
    console.log(`Message ID: ${response.data.id}`);

    return response.data;
  } catch (err) {
    console.log("❌ FAILED!");
    if (err.response) {
      console.log(`Status: ${err.response.status}`);
      console.log(`Error:`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.log(`Error: ${err.message}`);
    }
    return null;
  }
}

async function run() {
  try {
    await testSendWithImage();
    await testSendAsText();

    console.log("\n" + "=".repeat(70));
    console.log("📋 NEXT STEPS:");
    console.log("=".repeat(70));
    console.log("1. Update Settings.tsx with UltraMsg instance/token if not done");
    console.log("2. Add members with birthDate = today's date (YYYY-MM-DD)");
    console.log("3. Upload a photo for members (photoUrl field)");
    console.log("4. Set BIRTHDAY_DISPATCH_TIME env var (default: 08:00)");
    console.log("5. Restart backend: npm start in /backend folder");
    console.log("6. Birthday messages will auto-dispatch at scheduled time!\n");
  } catch (error) {
    console.error("Test suite error:", error.message);
  }
}

run();
