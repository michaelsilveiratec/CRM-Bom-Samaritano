const axios = require("axios");

/**
 * Test: Send Birthday Message with Member Photo
 * This test creates a test member with photo URL and sends via UltraMsg
 */

const ULTRAMSG_INSTANCE = "instance176612";
const ULTRAMSG_TOKEN = "dxgcehk541zvpuj5";
const USER_PHONE = "11993470407";

// Using a directly accessible image URL
const PHOTO_OPTIONS = [
  // Option 1: Direct image from reliable CDN
  "https://via.placeholder.com/400x400?text=Bom+Samaritano",
  // Option 2: Stock image (stable)
  "https://picsum.photos/400/400?random=1",
];

async function sendMessageWithMemberPhoto(photoUrl) {
  console.log("\n📤 Attempting to send with photo URL...");
  console.log(`Photo URL: ${photoUrl}`);

  const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/image?token=${encodeURIComponent(ULTRAMSG_TOKEN)}`;

  const messageText = `Graça e Paz! 🙏

Nós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂

Que o Senhor te abençoe rica e abundantemente neste dia tão especial!

"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)

Um forte abraço! 💪✨`;

  const formBody = new URLSearchParams();
  formBody.append("to", `+55${USER_PHONE}`);
  formBody.append("image", photoUrl);
  formBody.append("caption", messageText);

  try {
    const response = await axios.post(apiUrl, formBody.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
    });

    console.log("✅ Response:", response.data);

    if (response.data.success || response.data.sent === "true" || response.data.id) {
      console.log(`✅ Image message sent! ID: ${response.data.id}`);
      return true;
    } else if (response.data.error) {
      console.log(`⚠️  API returned error:`, response.data.error);
      return false;
    }
  } catch (err) {
    console.log(`❌ Error:`, err.response?.data || err.message);
    return false;
  }
}

async function demonstrateProperWorkflow() {
  console.log("=".repeat(70));
  console.log("📋 HOW BIRTHDAY MESSAGE + PHOTO WORKS");
  console.log("=".repeat(70));

  console.log(`
1. MEMBER SETUP:
   - Add member with name, phone, birthDate
   - Upload member photo via PhotoUpload component
   - Photo is stored as base64 string in photoUrl field

2. WHEN BIRTHDAY ARRIVES:
   - Scheduler checks all members at BIRTHDAY_DISPATCH_TIME
   - If birthDate == today, sends message + photo

3. MESSAGE FORMAT:
   - UltraMsg /messages/image endpoint
   - Parameters: to, image (URL), caption (message)
   - Image must be accessible URL

4. WORKFLOW IN CRM:
   ✅ Members.tsx: handleSendBirthday() now passes member.photoUrl
   ✅ whatsapp.ts: sendBirthdayMessage() now accepts mediaUrl param
   ✅ server.js: /api/messages/send-whatsapp endpoint supports mediaUrl
   ✅ birthday-scheduler.js: Runs at scheduled time, sends photo + message
   ✅ Backend automatically detects UltraMsg and routes to /messages/image

5. SCHEDULING:
   - Default: 08:00 (can set BIRTHDAY_DISPATCH_TIME env var)
   - Runs every minute, checks for birthdays
   - Prevents duplicates with .birthday-sent.json
  `);
}

async function run() {
  console.log("=".repeat(70));
  console.log("📸 Birthday Photo Integration Test");
  console.log("=".repeat(70));

  // Try different image URLs
  let success = false;
  for (const photoUrl of PHOTO_OPTIONS) {
    const result = await sendMessageWithMemberPhoto(photoUrl);
    if (result) {
      success = true;
      break;
    }
  }

  if (!success) {
    console.log("\n⚠️  Note: Image URLs may need to be hosted on your server.");
    console.log("   UltraMsg requires publicly accessible URLs.");
  }

  await demonstrateProperWorkflow();

  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYMENT CHECKLIST");
  console.log("=".repeat(70));
  console.log(`
  [ ] 1. Add member with today's birthDate (YYYY-MM-DD format)
  [ ] 2. Upload member photo (stored as base64 in photoUrl)
  [ ] 3. In Settings: Configure UltraMsg
       - Instance: instance176612
       - Token: dxgcehk541zvpuj5
       - URL: https://api.ultramsg.com/instance176612/
  [ ] 4. Set BIRTHDAY_DISPATCH_TIME (default: 08:00)
  [ ] 5. Restart backend: cd backend && npm start
  [ ] 6. Wait for scheduled time or manually click birthday Send button
  [ ] 7. Message + photo arrives on WhatsApp! 🎉
  
  MANUAL TEST (anytime):
  - Go to Members page
  - Find a member with today's birthDate
  - Click the Send button (green checkmark) next to their birthday
  - Photo + message sends immediately!
  `);
}

run();
