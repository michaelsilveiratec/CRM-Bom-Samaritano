require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Simulando um banco de dados em memória para os códigos OTP
// Na vida real, isso seria salvo no PostgreSQL do Supabase!
const otpDatabase = new Map();

/* ========================================================
   CONFIGURAÇÃO DO GMAIL (NODEMAILER)
   ======================================================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // ex: igreja@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Senha de App de 16 letras
  },
});

/* ========================================================
   ROTA 1: SOLICITAR CÓDIGO (ENVIO DE E-MAIL E WHATSAPP)
   ======================================================== */
app.post("/api/auth/request-otp", async (req, res) => {
  const { email, phone } = req.body;

  if (!email || !phone) {
    return res.status(400).json({ error: "E-mail e WhatsApp são obrigatórios." });
  }

  // 1. Gerar OTP de 6 dígitos aleatório
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // Validade: 5 minutos

  // 2. Salvar no "Banco de Dados" temporário
  otpDatabase.set(email, { code: otpCode, expiresAt });

  try {
    // 3. Disparo Simultâneo! (Promise.all executa os dois ao mesmo tempo)
    await Promise.all([
      sendEmail(email, otpCode),
      sendWhatsApp(phone, otpCode).catch(err => console.log("⚠️ Envio do WhatsApp ignorado por falta de Token oficial da Meta."))
    ]);

    console.log(`✅ OTP ${otpCode} enviado para ${email} e ${phone}`);
    return res.status(200).json({ message: "Código enviado com sucesso!" });

  } catch (error) {
    console.error("Erro ao enviar mensagens:", error);
    return res.status(500).json({ error: "Falha ao enviar o código de segurança." });
  }
});

/* ========================================================
   ROTA 2: VERIFICAR CÓDIGO OTP
   ======================================================== */
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, code } = req.body;
  const record = otpDatabase.get(email);

  if (!record) {
    return res.status(400).json({ error: "Nenhum código solicitado para este e-mail." });
  }

  if (Date.now() > record.expiresAt) {
    otpDatabase.delete(email); // Limpa o código vencido
    return res.status(400).json({ error: "Código expirado. Solicite um novo." });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: "Código incorreto." });
  }

  // Sucesso!
  otpDatabase.delete(email); // O código só pode ser usado uma vez
  return res.status(200).json({ message: "Identidade verificada com sucesso!" });
});


/* ========================================================
   ROTA 3: DISPARO DE MENSAGEM DE ANIVERSÁRIO
   ======================================================== */
app.post("/api/messages/birthday", async (req, res) => {
  const { phone, memberName, pastorName } = req.body;

  if (!phone || !memberName) {
    return res.status(400).json({ error: "Telefone e Nome são obrigatórios." });
  }

  const messageText = `Graça e Paz, ${memberName}! Nós da Igreja Bom Samaritano te desejamos um feliz aniversário! 🎉 Que o Senhor te abençoe rica e abundantemente neste dia tão especial. Um forte abraço do seu ${pastorName || "Pastor"}! 🙏✨`;
  
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  
  // Ex: 5511999998888
  const formattedPhone = "55" + phone.replace(/\D/g, "");

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: messageText
    }
  };

  try {
    await axios.post(`https://graph.facebook.com/v19.0/${PHONE_ID}/messages`, payload, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" }
    });
    console.log(`✅ WhatsApp de aniversário enviado para ${memberName} (${formattedPhone})`);
    return res.status(200).json({ message: "Enviado com sucesso!" });
  } catch (err) {
    console.error("⚠️ Erro WhatsApp (Aniversário):", err.response?.data || err.message);
    // Mesmo se falhar (por ex: janela de 24h fechada), retornamos 200 pro front não travar
    return res.status(200).json({ message: "Tentativa de envio processada." });
  }
});

/* ========================================================
   FUNÇÕES DE DISPARO (HELPER FUNCTIONS)
   ======================================================== */

// Função que envia o E-mail usando o Gmail
async function sendEmail(toEmail, otpCode) {
  const mailOptions = {
    from: '"CRM Bom Samaritano" <seu-email@gmail.com>',
    to: toEmail,
    subject: "Seu Código de Segurança - Eclesia CRM",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6d28d9;">Redefinição de Senha</h2>
        <p>Recebemos uma solicitação para acessar sua conta.</p>
        <p>Seu código de segurança é:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 8px;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          Este código é válido por 5 minutos. Não o compartilhe com ninguém.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// Função que envia o WhatsApp usando a API Oficial da Meta (Facebook)
async function sendWhatsApp(toPhone, otpCode) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID; // ID do seu número no Facebook
  
  // Formatando o número para o padrão internacional do WhatsApp (sem o +)
  // Ex: 5521999998888
  const formattedPhone = "55" + toPhone.replace(/\D/g, "");

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: "auth_otp_template", // Nome do template aprovado lá no Facebook
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: otpCode } // Injeta o código na mensagem
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: otpCode } // Botão de auto-preenchimento no celular
          ]
        }
      ]
    }
  };

  return axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// Inicializando o servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Autenticação rodando na porta ${PORT}`);
});
