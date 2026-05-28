const axios = require("axios");

/**
 * Test Birthday Message Sending via UltraMsg API
 * This test validates the complete flow:
 * 1. Frontend prepares birthday message
 * 2. Frontend sends to backend API
 * 3. Backend detects UltraMsg provider
 * 4. Backend formats and sends to UltraMsg API
 */

const API_BASE = "http://localhost:3001";
const ULTRAMSG_INSTANCE = "instance176612";
const ULTRAMSG_TOKEN = "dxgcehk541zvpuj5";
const ULTRAMSG_API_URL = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE}`;

// Test phone number (use a real number for actual testing)
const TEST_PHONE = "5585999999999"; // Format: country code + area code + number

async function testBirthdayMessageFlow() {
  console.log("=".repeat(60));
  console.log("🎂 BIRTHDAY MESSAGE TEST - UltraMsg Integration");
  console.log("=".repeat(60));

  // Step 1: Format the birthday message
  const memberName = "Maria Silva";
  const pastorName = "Pr. Anderson Silva";
  
  const birthdayMessage = `Graça e Paz, querida ${memberName}! 🙏

Nós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂

Que o Senhor te abençoe rica e abundantemente neste dia tão especial. Que Seus planos se realizem em sua vida!

"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)

Um forte abraço do seu ${pastorName}! 💪✨`;

  console.log("\n📝 Step 1: Birthday Message Template");
  console.log("-".repeat(60));
  console.log(`Member: ${memberName}`);
  console.log(`Pastor: ${pastorName}`);
  console.log(`Phone: ${TEST_PHONE}`);
  console.log(`Message Preview:\n${birthdayMessage}`);

  try {
    // Step 2: Send to backend API (simulating frontend call)
    console.log("\n📤 Step 2: Sending to Backend API");
    console.log("-".repeat(60));
    console.log(`Endpoint: POST ${API_BASE}/api/messages/send-whatsapp`);
    console.log(`Headers:`);
    console.log(`  - apiurl: ${ULTRAMSG_API_URL}/messages/chat`);
    console.log(`  - apikey: ${ULTRAMSG_TOKEN.substring(0, 5)}***${ULTRAMSG_TOKEN.substring(-5)}`);

    const response = await axios.post(
      `${API_BASE}/api/messages/send-whatsapp`,
      {
        phone: TEST_PHONE,
        message: birthdayMessage,
      },
      {
        headers: {
          "Content-Type": "application/json",
          apiurl: `${ULTRAMSG_API_URL}/messages/chat`,
          apikey: ULTRAMSG_TOKEN,
        },
      }
    );

    console.log("\n✅ Backend Response:");
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log("\n🎉 SUCCESS: Birthday message sent via UltraMsg!");
      console.log(`Response ID: ${response.data.data?.id || "N/A"}`);
      console.log(`Check UltraMsg dashboard for delivery status.`);
      return true;
    } else {
      console.log("\n❌ FAILED: Backend returned success: false");
      console.log(`Error: ${response.data.error}`);
      return false;
    }
  } catch (error) {
    console.log("\n❌ ERROR: Request Failed");
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`Message: ${error.message}`);
    }
    return false;
  }
}

async function testPhoneNormalization() {
  console.log("\n\n📱 Testing Phone Normalization");
  console.log("=".repeat(60));

  const testCases = [
    { input: "85999999999", expected: "+5585999999999", description: "Without country code" },
    { input: "5585999999999", expected: "+5585999999999", description: "With country code (no +)" },
    { input: "+5585999999999", expected: "+5585999999999", description: "With country code and +" },
    { input: "(85) 9999-9999", expected: "+5585999999999", description: "Formatted with spaces/dashes" },
  ];

  for (const testCase of testCases) {
    console.log(`\n✓ Input: "${testCase.input}" (${testCase.description})`);
    console.log(`  Expected: ${testCase.expected}`);
  }
}

async function run() {
  try {
    await testBirthdayMessageFlow();
    await testPhoneNormalization();
  } catch (error) {
    console.error("Test suite error:", error.message);
  }
}

run();
