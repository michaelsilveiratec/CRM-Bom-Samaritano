require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const { startScheduler } = require("./birthday-scheduler");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

function devLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.info(...args);
  }
}

const USERS_FILE_PATH = path.resolve(__dirname, "users.json");
const MEMBERS_FILE_PATH = path.resolve(__dirname, "members.json");
const VISITORS_FILE_PATH = path.resolve(__dirname, "visitors.json");
const CHILDREN_FILE_PATH = path.resolve(__dirname, "children.json");
const YOUTH_FILE_PATH = path.resolve(__dirname, "youth.json");
const SETTINGS_FILE_PATH = path.resolve(__dirname, "settings.json");
const FINANCIAL_FILE_PATH = path.resolve(__dirname, "financial.json");
const DISCIPLESHIP_FILE_PATH = path.resolve(__dirname, "discipleship.json");
const otpDatabase = new Map();
const passwordResetTokens = new Map();
// FRONTEND_URL may be set to the string "null" in some environments — normalize it.
let FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL || String(FRONTEND_URL).toLowerCase() === "null") {
  FRONTEND_URL = "http://localhost:5173";
}

function normalizePhone(phone = "") {
  return phone.replace(/\D/g, "");
}

function getLocalNetworkAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  Object.values(interfaces).forEach((entries = []) => {
    entries.forEach((entry) => {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    });
  });

  return (
    addresses.find((address) => address.startsWith("192.168.")) ||
    addresses.find((address) => address.startsWith("10.")) ||
    addresses.find((address) => /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) ||
    addresses[0] ||
    null
  );
}

function loadUsers() {
  if (fs.existsSync(USERS_FILE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE_PATH, "utf-8"));
    } catch (err) {
      console.warn("Não foi possível ler users.json. Inicializando com lista vazia.", err);
    }
  }
  return [];
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), "utf-8");
}

const storedUsers = loadUsers();
const userDatabase = new Map(storedUsers.map((user) => [user.email, user]));

function persistUsers() {
  saveUsers([...userDatabase.values()]);
}

app.get("/api/network-info", (req, res) => {
  const host = getLocalNetworkAddress() || req.hostname || "localhost";
  const frontendPort = process.env.FRONTEND_PORT || "5173";
  const frontendUrl = `http://${host}:${frontendPort}`;

  return res.json({
    success: true,
    host,
    backendUrl: `http://${host}:${PORT}`,
    frontendUrl,
    mobileUrl: `${frontendUrl}/mobile`,
  });
});

function loadData(filePath, defaultValue = []) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.warn(`Não foi possível ler ${path.basename(filePath)}. Inicializando com lista vazia.`, err);
    }
  }
  return defaultValue;
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const membersData = loadData(MEMBERS_FILE_PATH, []);
const visitorsData = loadData(VISITORS_FILE_PATH, []);
const childrenData = loadData(CHILDREN_FILE_PATH, []);
const youthData = loadData(YOUTH_FILE_PATH, []);
const financialData = loadData(FINANCIAL_FILE_PATH, []);
const discipleshipData = loadData(DISCIPLESHIP_FILE_PATH, {
  journeys: [],
  pairs: [],
  enrollments: [],
  activeJourneyId: "",
  updatedAt: "",
});
if (!Array.isArray(discipleshipData.enrollments)) {
  discipleshipData.enrollments = [];
}
const settingsData = loadData(SETTINGS_FILE_PATH, {
  churchName: "Bom Samaritano",
  pastorName: "Pastor",
  pastorPhoto: "",
  whatsappCode: "55",
  birthdayNotifications: true,
  waAutoDispatch: false,
  waApiUrl: "",
  financialPassword: "1234",
});

function persistMembers() {
  saveData(MEMBERS_FILE_PATH, membersData);
}

function persistVisitors() {
  saveData(VISITORS_FILE_PATH, visitorsData);
}

function persistChildren() {
  saveData(CHILDREN_FILE_PATH, childrenData);
}

function persistYouth() {
  saveData(YOUTH_FILE_PATH, youthData);
}

function persistFinancial() {
  saveData(FINANCIAL_FILE_PATH, financialData);
}

function persistDiscipleship() {
  saveData(DISCIPLESHIP_FILE_PATH, discipleshipData);
}

function findDiscipleshipJourney(journeyId) {
  return (discipleshipData.journeys || []).find((journey) => journey.id === journeyId);
}

function findDiscipleshipLesson(journeyId, lessonNum = 1) {
  const journey = findDiscipleshipJourney(journeyId);
  const lessons = Array.isArray(journey?.lessons) ? journey.lessons : [];
  return lessons.find((lesson) => Number(lesson.num) === Number(lessonNum)) || lessons[0] || null;
}

function buildLessonEvaluation(lesson = {}) {
  const customQuestions = Array.isArray(lesson.evaluation) ? lesson.evaluation : [];
  const customQuestion = customQuestions.find((item) => {
    return item?.question && Array.isArray(item.options) && item.options.length >= 3;
  });

  if (customQuestion) {
    return [
      {
        id: String(customQuestion.id || "lesson-question"),
        question: String(customQuestion.question),
        options: customQuestion.options.slice(0, 3).map((option) => String(option)),
        correct: Number(customQuestion.correct || 0),
      },
    ];
  }

  const firstApplication = Array.isArray(lesson.application) && lesson.application[0]
    ? lesson.application[0]
    : "Praticar a Palavra aprendida";

  return [
    {
      id: "lesson-theme",
      question: `Qual alternativa representa melhor a licao "${lesson.title || "enviada"}"?`,
      options: [
        String(firstApplication),
        "Apenas um aviso administrativo",
        "Um conteudo que nao precisa ser praticado",
      ],
      correct: 0,
    },
  ];
}

function publicEnrollmentPayload(enrollment) {
  const journey = findDiscipleshipJourney(enrollment.journeyId);
  const lesson = findDiscipleshipLesson(enrollment.journeyId, enrollment.lessonNum);

  return {
    enrollment,
    journey: journey
      ? { id: journey.id, name: journey.name, description: journey.description, totalLessons: Array.isArray(journey.lessons) ? journey.lessons.length : 0 }
      : null,
    lesson,
    evaluation: buildLessonEvaluation(lesson),
  };
}

function persistSettings() {
  saveData(SETTINGS_FILE_PATH, settingsData);
}

function buildSafeUser(user) {
  return {
    email: user.email,
    name: user.name,
    avatar: user.name.substring(0, 2).toUpperCase(),
    role: user.role,
    provider: user.provider || "email",
    phone: user.phone,
  };
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendPasswordResetEmail(email, resetToken, name) {
  const resetUrl = `${FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`;
  // Log reset URL for local development troubleshooting
  devLog(`🔗 Password reset URL for ${email}: ${resetUrl}`);
  const mailOptions = {
    from: `"CRM Bom Samaritano" <${process.env.GMAIL_USER || "no-reply@bomsamaritano.org"}>`,
    to: email,
    subject: "Redefinição de senha - Bom Samaritano",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #111; background: #f7f7fb;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 1px 10px rgba(0,0,0,.08);">
          <h2 style="color: #5b21b6; margin-bottom: 16px;">Redefinição de senha</h2>
          <p>Olá ${name || "usuário"},</p>
          <p>Recebemos uma solicitação para redefinir sua senha do Bom Samaritano.</p>
          <p style="margin: 24px 0;"><a href="${resetUrl}" style="display: inline-block; padding: 14px 26px; background: #7c3aed; color: white; border-radius: 10px; text-decoration: none;">Redefinir minha senha</a></p>
          <p>Se você não solicitou essa alteração, pode ignorar este e-mail.</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">O link expira em 1 hora.</p>
        </div>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

async function handleForgotPassword(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "O e-mail é obrigatório para recuperação de senha." });
  }

  const user = userDatabase.get(email);
  const resetToken = generateResetToken();
  const expiresAt = Date.now() + 60 * 60 * 1000;
  passwordResetTokens.set(resetToken, { email, expiresAt });

  try {
    if (user && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await sendPasswordResetEmail(email, resetToken, user.name);
    }
    devLog(`🔐 Password reset requested for ${email}. Token stored until ${new Date(expiresAt).toISOString()}`);
    return res.json({ success: true, message: "E-mail de redefinição enviado. Verifique sua caixa de entrada." });
  } catch (err) {
    console.error("Erro ao enviar e-mail de recuperação:", err);
    return res.status(500).json({ error: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde." });
  }
}

// Ensure admin always has Premium plan (never Trial)
const adminUser = userDatabase.get("admin@bomsamaritano.org") || {};
if (adminUser.email === "admin@bomsamaritano.org" && adminUser.plan !== "Premium") {
  adminUser.plan = "Premium";
  adminUser.role = "Pastor Presidente (Premium)";
  userDatabase.set(adminUser.email, adminUser);
  persistUsers();
}

if (!userDatabase.has("admin@bomsamaritano.org")) {
  const passwordHash = bcrypt.hashSync("pastor123", 10);
  const newAdminUser = {
    email: "admin@bomsamaritano.org",
    name: "Pr. Anderson Silva",
    role: "Pastor Presidente (Premium)",
    provider: "email",
    phone: normalizePhone("+55 21 99999-9999"),
    passwordHash,
    plan: "Premium",
  };
  userDatabase.set(newAdminUser.email, newAdminUser);
  persistUsers();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  const user = userDatabase.get(email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash || "")) {
    return res.status(401).json({ error: "Credenciais inválidas ou usuário não encontrado." });
  }

  return res.json({ success: true, data: { user: buildSafeUser(user) } });
});

app.post("/api/auth/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();
  // Accept optional plan/phone for simplified frontend flows
  const plan = String(req.body.plan || "Teste Grátis 24 Horas").trim();
  const phone = String(req.body.phone || "").trim();

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  const emailKey = email;
  if (userDatabase.has(emailKey)) {
    return res.status(409).json({ error: "Este e-mail já está cadastrado." });
  }

  const phoneNumber = phone ? normalizePhone(phone) : "";
  const passwordHash = bcrypt.hashSync(password, 10);
  const isAdminEmail = emailKey === "admin@bomsamaritano.org";
  const finalPlan = isAdminEmail ? "Premium" : plan;
  
  const newUser = {
    email: emailKey,
    name,
    role: `Pastor / Cliente (${finalPlan})`,
    provider: "email",
    phone: phoneNumber,
    passwordHash,
    plan: finalPlan,
  };

  userDatabase.set(emailKey, newUser);
  persistUsers();

  return res.json({ success: true, data: { user: buildSafeUser(newUser) } });
});

app.post("/api/auth/request-otp", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();

  if (!phone) {
    return res.status(400).json({ error: "O número de WhatsApp é obrigatório." });
  }

  const key = email || normalizePhone(phone);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpDatabase.set(key, { code: otpCode, expiresAt });

  const tasks = [];
  if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    tasks.push(sendEmail(email, otpCode));
  }
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    tasks.push(sendWhatsApp(phone, otpCode).catch((err) => console.warn("Falha no envio de WhatsApp OTP:", err.message)));
  }

  try {
    await Promise.all(tasks);
    devLog(`✅ OTP gerado para ${key}`);
    return res.json({ success: true, message: "Código enviado com sucesso.", debug: process.env.NODE_ENV === "development" ? { code: otpCode } : undefined });
  } catch (err) {
    console.error("Erro ao enviar OTP:", err);
    return res.status(500).json({ error: "Não foi possível enviar o código OTP." });
  }
});

app.post("/api/auth/verify-otp", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();
  const code = String(req.body.code || "").trim();
  const key = email || normalizePhone(phone || "");

  const record = otpDatabase.get(key);
  if (!record) {
    return res.status(400).json({ error: "Nenhum código encontrado para este usuário." });
  }

  if (Date.now() > record.expiresAt) {
    otpDatabase.delete(key);
    return res.status(400).json({ error: "Código expirado. Solicite um novo." });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: "Código incorreto." });
  }

  otpDatabase.delete(key);

  let user = null;
  if (email) {
    user = userDatabase.get(email.toLowerCase());
  }

  if (!user && phone) {
    const normalizedPhone = normalizePhone(phone);
    user = [...userDatabase.values()].find((stored) => normalizePhone(stored.phone || "") === normalizedPhone);
  }

  if (!user) {
    user = {
      email: `whatsapp+${normalizePhone(phone || "")}@bomsamaritano.org`,
      name: "Acesso via WhatsApp",
      role: "Pastor Presidente",
      provider: "whatsapp",
      phone: normalizePhone(phone || ""),
      passwordHash: "",
      plan: "WhatsApp OTP",
    };
  }

  return res.json({ success: true, data: { user: buildSafeUser(user) } });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  return handleForgotPassword(req, res);
});

app.post("/api/auth/reset-password", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const token = String(req.body.token || "").trim();
  const password = String(req.body.password || "").trim();

  if (!email || !token || !password) {
    return res.status(400).json({ error: "E-mail, token e nova senha são obrigatórios." });
  }

  const tokenRecord = passwordResetTokens.get(token);
  if (!tokenRecord || tokenRecord.email !== email) {
    return res.status(400).json({ error: "Token inválido ou e-mail não corresponde." });
  }

  if (Date.now() > tokenRecord.expiresAt) {
    passwordResetTokens.delete(token);
    return res.status(400).json({ error: "Token expirado. Solicite um novo e-mail de recuperação." });
  }

  const user = userDatabase.get(email);
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  user.passwordHash = bcrypt.hashSync(password, 10);
  persistUsers();
  passwordResetTokens.delete(token);

  return res.json({ success: true, message: "Senha redefinida com sucesso." });
});

app.post("/api/auth/recover-password", async (req, res) => {
  return handleForgotPassword(req, res);
});

app.get("/api/members", (req, res) => {
  return res.json({ success: true, members: membersData });
});

app.get("/api/settings", (req, res) => {
  return res.json({ success: true, settings: settingsData });
});

app.post("/api/settings", (req, res) => {
  const {
    churchName,
    pastorName,
    pastorPhoto,
    whatsappCode,
    birthdayNotifications,
    waAutoDispatch,
    waApiUrl,
    financialPassword,
  } = req.body;

  settingsData.churchName = String(churchName || settingsData.churchName || "Bom Samaritano").trim();
  settingsData.pastorName = String(pastorName || settingsData.pastorName || "Pastor").trim();
  if (typeof pastorPhoto === "string") {
    settingsData.pastorPhoto = pastorPhoto.trim();
  }
  settingsData.whatsappCode = String(whatsappCode || settingsData.whatsappCode || "55").trim();
  settingsData.birthdayNotifications = birthdayNotifications !== false;
  settingsData.waAutoDispatch = waAutoDispatch === true;
  settingsData.waApiUrl = String(waApiUrl || "").trim();
  if (typeof financialPassword === "string" && financialPassword.trim()) {
    settingsData.financialPassword = financialPassword.trim();
  }
  settingsData.updatedAt = new Date().toISOString();

  persistSettings();

  return res.json({ success: true, settings: settingsData });
});

app.get("/api/financial", (req, res) => {
  return res.json({ success: true, records: financialData });
});

app.post("/api/financial/sync", (req, res) => {
  const records = Array.isArray(req.body.records) ? req.body.records : [];
  financialData.splice(0, financialData.length, ...records.map((record) => ({
    id: record.id || Date.now(),
    contributor: String(record.contributor || "").trim(),
    category: String(record.category || "Dízimo").trim(),
    value: Number(record.value || 0),
    date: String(record.date || new Date().toISOString().split("T")[0]).trim(),
    paymentMethod: String(record.paymentMethod || "Pix").trim(),
    notes: String(record.notes || "").trim(),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })));
  persistFinancial();

  return res.json({ success: true, records: financialData });
});

app.post("/api/financial", (req, res) => {
  const { contributor, category, value, date, paymentMethod, notes } = req.body;

  if (!contributor || Number(value) < 0) {
    return res.status(400).json({ success: false, error: "Contribuinte e valor são obrigatórios." });
  }

  const newRecord = {
    id: Date.now(),
    contributor: String(contributor).trim(),
    category: String(category || "Dízimo").trim(),
    value: Number(value),
    date: String(date || new Date().toISOString().split("T")[0]).trim(),
    paymentMethod: String(paymentMethod || "Pix").trim(),
    notes: String(notes || "").trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  financialData.push(newRecord);
  persistFinancial();

  return res.json({ success: true, record: newRecord });
});

app.put("/api/financial/:id", (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const recordIndex = financialData.findIndex((record) => record.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({ success: false, error: "Lançamento financeiro não encontrado." });
  }

  const existingRecord = financialData[recordIndex];
  const {
    contributor,
    category,
    value,
    date,
    paymentMethod,
    notes,
  } = req.body;

  const finalContributor = contributor ?? existingRecord.contributor;
  const finalValue = value ?? existingRecord.value;

  if (!finalContributor || Number(finalValue) < 0) {
    return res.status(400).json({ success: false, error: "Contribuinte e valor são obrigatórios." });
  }

  const updatedRecord = {
    ...existingRecord,
    contributor: String(finalContributor).trim(),
    category: String(category ?? existingRecord.category ?? "Dízimo").trim(),
    value: Number(finalValue),
    date: String(date ?? existingRecord.date ?? new Date().toISOString().split("T")[0]).trim(),
    paymentMethod: String(paymentMethod ?? existingRecord.paymentMethod ?? "Pix").trim(),
    notes: String(notes ?? existingRecord.notes ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };

  financialData[recordIndex] = updatedRecord;
  persistFinancial();

  return res.json({ success: true, record: updatedRecord });
});

app.delete("/api/financial/:id", (req, res) => {
  const recordId = parseInt(req.params.id, 10);
  const recordIndex = financialData.findIndex((record) => record.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({ success: false, error: "Lançamento financeiro não encontrado." });
  }

  const deletedRecord = financialData[recordIndex];
  financialData.splice(recordIndex, 1);
  persistFinancial();

  return res.json({ success: true, message: "Lançamento financeiro deletado com sucesso.", record: deletedRecord });
});

app.get("/api/discipleship", (req, res) => {
  return res.json({ success: true, state: discipleshipData });
});

app.post("/api/discipleship", (req, res) => {
  const payload = req.body?.state && typeof req.body.state === "object" ? req.body.state : req.body;
  const journeys = Array.isArray(payload.journeys) ? payload.journeys : [];
  const pairs = Array.isArray(payload.pairs) ? payload.pairs : [];
  const enrollments = Array.isArray(payload.enrollments) ? payload.enrollments : discipleshipData.enrollments;
  const activeJourneyId = String(payload.activeJourneyId || "").trim();

  discipleshipData.journeys = journeys;
  discipleshipData.pairs = pairs;
  discipleshipData.enrollments = enrollments;
  discipleshipData.activeJourneyId = activeJourneyId;
  discipleshipData.updatedAt = new Date().toISOString();

  persistDiscipleship();

  return res.json({ success: true, state: discipleshipData });
});

app.post("/api/discipleship/enrollments", (req, res) => {
  const {
    memberName,
    memberPhone,
    journeyId,
    lessonNum,
    courseImageUrl,
    courseMessage,
    pairId,
  } = req.body;

  const cleanName = String(memberName || "").trim();
  const cleanPhone = normalizePhone(String(memberPhone || ""));
  const selectedJourneyId = String(journeyId || discipleshipData.activeJourneyId || "").trim();
  const selectedLessonNum = Number(lessonNum || 1);
  const journey = findDiscipleshipJourney(selectedJourneyId);
  const lesson = findDiscipleshipLesson(selectedJourneyId, selectedLessonNum);

  if (!cleanName || !cleanPhone || !journey || !lesson) {
    return res.status(400).json({ success: false, error: "Informe membro, WhatsApp, jornada e aula validos." });
  }

  const token = crypto.randomBytes(12).toString("hex");
  const enrollment = {
    id: Date.now(),
    token,
    pairId: pairId ? Number(pairId) : null,
    memberName: cleanName,
    memberPhone: cleanPhone,
    journeyId: selectedJourneyId,
    journeyName: journey.name,
    lessonNum: Number(lesson.num || selectedLessonNum),
    lessonTitle: lesson.title || "Aula",
    courseImageUrl: String(courseImageUrl || "").trim(),
    courseMessage: String(courseMessage || "").trim(),
    status: "Enviado",
    attendance: "Pendente",
    score: 0,
    totalQuestions: buildLessonEvaluation(lesson).length,
    totalLessons: Array.isArray(journey.lessons) ? journey.lessons.length : 0,
    spiritualGrowth: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  discipleshipData.enrollments.unshift(enrollment);
  discipleshipData.updatedAt = new Date().toISOString();
  persistDiscipleship();

  return res.json({ success: true, enrollment });
});

app.get("/api/discipleship/course/:token", (req, res) => {
  const enrollment = discipleshipData.enrollments.find((item) => item.token === req.params.token);
  if (!enrollment) {
    return res.status(404).json({ success: false, error: "Curso nao encontrado." });
  }

  if (["Preparado", "Agendado", "Enviado"].includes(enrollment.status)) {
    enrollment.status = "Aula aberta";
    enrollment.lastAccessAt = new Date().toISOString();
    enrollment.updatedAt = new Date().toISOString();
    persistDiscipleship();
  }

  return res.json({ success: true, ...publicEnrollmentPayload(enrollment) });
});

app.post("/api/discipleship/course/:token/complete", (req, res) => {
  const enrollment = discipleshipData.enrollments.find((item) => item.token === req.params.token);
  if (!enrollment) {
    return res.status(404).json({ success: false, error: "Curso nao encontrado." });
  }

  const lesson = findDiscipleshipLesson(enrollment.journeyId, enrollment.lessonNum);
  const evaluation = buildLessonEvaluation(lesson);
  const answers = Array.isArray(req.body.answers) ? req.body.answers.map(Number) : [];
  const score = evaluation.filter((question, index) => answers[index] === question.correct).length;
  const passed = score === evaluation.length;

  enrollment.answers = answers;
  enrollment.score = score;
  enrollment.totalQuestions = evaluation.length;
  enrollment.status = passed ? "Concluido" : "Avaliacao pendente";
  enrollment.attendance = passed ? "Presente" : "Pendente";
  enrollment.completedAt = passed ? new Date().toISOString() : null;
  enrollment.spiritualGrowth = passed && enrollment.totalLessons
    ? Math.min(100, Math.round((Number(enrollment.lessonNum || 0) / Number(enrollment.totalLessons || 1)) * 100))
    : Number(enrollment.spiritualGrowth || 0);
  enrollment.updatedAt = new Date().toISOString();

  if (passed && enrollment.pairId) {
    discipleshipData.pairs = (discipleshipData.pairs || []).map((pair) => {
      if (Number(pair.id) !== Number(enrollment.pairId)) return pair;
      const nextLessons = Math.max(Number(pair.completedLessons || 0), Number(enrollment.lessonNum || 1));
      return {
        ...pair,
        completedLessons: Math.min(nextLessons, Number(pair.totalLessons || nextLessons)),
        status: nextLessons >= Number(pair.totalLessons || nextLessons) ? "Concluído" : pair.status,
        lastMeeting: new Date().toISOString().slice(0, 10),
      };
    });
  }

  discipleshipData.updatedAt = new Date().toISOString();
  persistDiscipleship();

  return res.json({ success: true, passed, enrollment, score, totalQuestions: evaluation.length });
});

app.post("/api/members", (req, res) => {
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    registrationDate,
    baptismDate,
    birthDate,
    status,
    photoUrl,
    source,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const newMember = {
    id: Date.now(),
    name: String(name).trim(),
    role: String(role || "Membro").trim(),
    phone: String(phone).trim(),
    email: String(email || "").trim(),
    cellName: String(cellName || "").trim(),
    address: String(address || "").trim(),
    neighborhood: String(neighborhood || "").trim(),
    city: String(city || "").trim(),
    maritalStatus: String(maritalStatus || "").trim(),
    registrationDate: String(registrationDate || new Date().toISOString().split("T")[0]).trim(),
    baptismDate: String(baptismDate || "").trim(),
    birthDate: String(birthDate || "").trim(),
    status: String(status || "Ativo").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
    source: source ? String(source).trim() : undefined,
    createdByMobile: source === "mobile",
    createdAt: new Date().toISOString(),
  };

  membersData.push(newMember);
  persistMembers();

  return res.json({ success: true, member: newMember });
});

app.put("/api/members/:id", (req, res) => {
  const memberId = parseInt(req.params.id, 10);
  const memberIndex = membersData.findIndex((m) => m.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ success: false, error: "Membro não encontrado." });
  }

  const existingMember = membersData[memberIndex];
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    baptismDate,
    birthDate,
    status,
    photoUrl,
  } = req.body;

  const finalName = name ?? existingMember.name;
  const finalPhone = phone ?? existingMember.phone;

  if (!finalName || !finalPhone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const hasPhotoUrl = Object.prototype.hasOwnProperty.call(req.body, "photoUrl");
  const updatedMember = {
    ...existingMember,
    name: String(finalName).trim(),
    role: String(role ?? existingMember.role ?? "Membro").trim(),
    phone: String(finalPhone).trim(),
    email: String(email ?? existingMember.email ?? "").trim(),
    cellName: String(cellName ?? existingMember.cellName ?? "").trim(),
    address: String(address ?? existingMember.address ?? "").trim(),
    neighborhood: String(neighborhood ?? existingMember.neighborhood ?? "").trim(),
    city: String(city ?? existingMember.city ?? "").trim(),
    maritalStatus: String(maritalStatus ?? existingMember.maritalStatus ?? "").trim(),
    baptismDate: String(baptismDate ?? existingMember.baptismDate ?? "").trim(),
    birthDate: String(birthDate ?? existingMember.birthDate ?? "").trim(),
    status: String(status ?? existingMember.status ?? "Ativo").trim(),
    photoUrl: hasPhotoUrl ? (photoUrl ? String(photoUrl).trim() : undefined) : existingMember.photoUrl,
  };

  membersData[memberIndex] = updatedMember;
  persistMembers();

  return res.json({ success: true, member: updatedMember });
});

app.delete("/api/members/:id", (req, res) => {
  const memberId = parseInt(req.params.id, 10);
  const memberIndex = membersData.findIndex((m) => m.id === memberId);

  if (memberIndex === -1) {
    return res.status(404).json({ success: false, error: "Membro não encontrado." });
  }

  const deletedMember = membersData[memberIndex];
  membersData.splice(memberIndex, 1);
  persistMembers();

  return res.json({ success: true, message: "Membro deletado com sucesso.", member: deletedMember });
});

app.get("/api/visitors", (req, res) => {
  return res.json({ success: true, visitors: visitorsData });
});

app.post("/api/visitors", (req, res) => {
  const {
    name,
    phone,
    visitDate,
    address,
    neighborhood,
    city,
    maritalStatus,
    birthDate,
    referredBy,
    status,
    notes,
    registrationDate,
    photoUrl,
    source,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const newVisitor = {
    id: Date.now(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    visitDate: String(visitDate || "").trim(),
    address: String(address || "").trim(),
    neighborhood: String(neighborhood || "").trim(),
    city: String(city || "").trim(),
    maritalStatus: String(maritalStatus || "").trim(),
    birthDate: String(birthDate || "").trim(),
    referredBy: String(referredBy || "").trim(),
    status: String(status || "Ativo").trim(),
    notes: String(notes || "").trim(),
    registrationDate: String(registrationDate || new Date().toISOString().split("T")[0]).trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
    source: source ? String(source).trim() : undefined,
    createdByMobile: source === "mobile",
    createdAt: new Date().toISOString(),
  };

  visitorsData.push(newVisitor);
  persistVisitors();

  return res.json({ success: true, visitor: newVisitor });
});

app.put("/api/visitors/:id", (req, res) => {
  const visitorId = parseInt(req.params.id, 10);
  const visitorIndex = visitorsData.findIndex((v) => v.id === visitorId);

  if (visitorIndex === -1) {
    return res.status(404).json({ success: false, error: "Visitante não encontrado." });
  }

  const {
    name,
    phone,
    visitDate,
    address,
    neighborhood,
    city,
    maritalStatus,
    birthDate,
    referredBy,
    status,
    notes,
    photoUrl,
  } = req.body;

  const existingVisitor = visitorsData[visitorIndex];
  const finalName = name ?? existingVisitor.name;
  const finalPhone = phone ?? existingVisitor.phone;

  if (!finalName || !finalPhone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const updatedVisitor = {
    ...existingVisitor,
    name: String(finalName).trim(),
    phone: String(finalPhone).trim(),
    visitDate: String(visitDate ?? existingVisitor.visitDate ?? "").trim(),
    address: String(address ?? existingVisitor.address ?? "").trim(),
    neighborhood: String(neighborhood ?? existingVisitor.neighborhood ?? "").trim(),
    city: String(city ?? existingVisitor.city ?? "").trim(),
    maritalStatus: String(maritalStatus ?? existingVisitor.maritalStatus ?? "").trim(),
    birthDate: String(birthDate ?? existingVisitor.birthDate ?? "").trim(),
    referredBy: String(referredBy ?? existingVisitor.referredBy ?? "").trim(),
    status: String(status || visitorsData[visitorIndex].status || "Ativo").trim(),
    notes: String(notes ?? existingVisitor.notes ?? "").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : existingVisitor.photoUrl,
  };

  visitorsData[visitorIndex] = updatedVisitor;
  persistVisitors();

  return res.json({ success: true, visitor: updatedVisitor });
});

app.delete("/api/visitors/:id", (req, res) => {
  const visitorId = parseInt(req.params.id, 10);
  const visitorIndex = visitorsData.findIndex((v) => v.id === visitorId);

  if (visitorIndex === -1) {
    return res.status(404).json({ success: false, error: "Visitante não encontrado." });
  }

  const deletedVisitor = visitorsData[visitorIndex];
  visitorsData.splice(visitorIndex, 1);
  persistVisitors();

  return res.json({ success: true, message: "Visitante deletado com sucesso.", visitor: deletedVisitor });
});

app.get("/api/children", (req, res) => {
  return res.json({ success: true, children: childrenData });
});

app.post("/api/children", (req, res) => {
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    registrationDate,
    baptismDate,
    birthDate,
    visitDate,
    referredBy,
    status,
    notes,
    photoUrl,
    source,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const newChild = {
    id: Date.now(),
    name: String(name).trim(),
    role: String(role || "Criança").trim(),
    phone: String(phone).trim(),
    email: String(email || "").trim(),
    cellName: String(cellName || "").trim(),
    address: String(address || "").trim(),
    neighborhood: String(neighborhood || "").trim(),
    city: String(city || "").trim(),
    maritalStatus: String(maritalStatus || "").trim(),
    registrationDate: String(registrationDate || new Date().toISOString().split("T")[0]).trim(),
    baptismDate: String(baptismDate || "").trim(),
    birthDate: String(birthDate || "").trim(),
    visitDate: String(visitDate || "").trim(),
    referredBy: String(referredBy || "").trim(),
    status: String(status || "Ativo").trim(),
    notes: String(notes || "").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
    source: source ? String(source).trim() : undefined,
    createdByMobile: source === "mobile",
    createdAt: new Date().toISOString(),
  };

  childrenData.push(newChild);
  persistChildren();

  return res.json({ success: true, child: newChild });
});

app.put("/api/children/:id", (req, res) => {
  const childId = parseInt(req.params.id, 10);
  const childIndex = childrenData.findIndex((c) => c.id === childId);

  if (childIndex === -1) {
    return res.status(404).json({ success: false, error: "Criança não encontrada." });
  }

  const existingChild = childrenData[childIndex];
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    baptismDate,
    birthDate,
    visitDate,
    referredBy,
    status,
    notes,
    photoUrl,
  } = req.body;

  const finalName = name ?? existingChild.name;
  const finalPhone = phone ?? existingChild.phone;

  if (!finalName || !finalPhone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const updatedChild = {
    ...existingChild,
    name: String(finalName).trim(),
    role: String(role ?? existingChild.role ?? "Criança").trim(),
    phone: String(finalPhone).trim(),
    email: String(email ?? existingChild.email ?? "").trim(),
    cellName: String(cellName ?? existingChild.cellName ?? "").trim(),
    address: String(address ?? existingChild.address ?? "").trim(),
    neighborhood: String(neighborhood ?? existingChild.neighborhood ?? "").trim(),
    city: String(city ?? existingChild.city ?? "").trim(),
    maritalStatus: String(maritalStatus ?? existingChild.maritalStatus ?? "").trim(),
    baptismDate: String(baptismDate ?? existingChild.baptismDate ?? "").trim(),
    birthDate: String(birthDate ?? existingChild.birthDate ?? "").trim(),
    visitDate: String(visitDate ?? existingChild.visitDate ?? "").trim(),
    referredBy: String(referredBy ?? existingChild.referredBy ?? "").trim(),
    status: String(status ?? existingChild.status ?? "Ativo").trim(),
    notes: String(notes ?? existingChild.notes ?? "").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : existingChild.photoUrl,
  };

  childrenData[childIndex] = updatedChild;
  persistChildren();

  return res.json({ success: true, child: updatedChild });
});

app.delete("/api/children/:id", (req, res) => {
  const childId = parseInt(req.params.id, 10);
  const childIndex = childrenData.findIndex((c) => c.id === childId);

  if (childIndex === -1) {
    return res.status(404).json({ success: false, error: "Criança não encontrada." });
  }

  const deletedChild = childrenData[childIndex];
  childrenData.splice(childIndex, 1);
  persistChildren();

  return res.json({ success: true, message: "Criança deletada com sucesso.", child: deletedChild });
});

app.get("/api/youth", (req, res) => {
  return res.json({ success: true, youth: youthData });
});

app.post("/api/youth", (req, res) => {
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    registrationDate,
    baptismDate,
    birthDate,
    visitDate,
    referredBy,
    status,
    notes,
    photoUrl,
    source,
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const newYouth = {
    id: Date.now(),
    name: String(name).trim(),
    role: String(role || "Jovem").trim(),
    phone: String(phone).trim(),
    email: String(email || "").trim(),
    cellName: String(cellName || "").trim(),
    address: String(address || "").trim(),
    neighborhood: String(neighborhood || "").trim(),
    city: String(city || "").trim(),
    maritalStatus: String(maritalStatus || "").trim(),
    registrationDate: String(registrationDate || new Date().toISOString().split("T")[0]).trim(),
    baptismDate: String(baptismDate || "").trim(),
    birthDate: String(birthDate || "").trim(),
    visitDate: String(visitDate || "").trim(),
    referredBy: String(referredBy || "").trim(),
    status: String(status || "Ativo").trim(),
    notes: String(notes || "").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
    source: source ? String(source).trim() : undefined,
    createdByMobile: source === "mobile",
    createdAt: new Date().toISOString(),
  };

  youthData.push(newYouth);
  persistYouth();

  return res.json({ success: true, youth: newYouth });
});

app.put("/api/youth/:id", (req, res) => {
  const youthId = parseInt(req.params.id, 10);
  const youthIndex = youthData.findIndex((y) => y.id === youthId);

  if (youthIndex === -1) {
    return res.status(404).json({ success: false, error: "Jovem não encontrado." });
  }

  const existingYouth = youthData[youthIndex];
  const {
    name,
    role,
    phone,
    email,
    cellName,
    address,
    neighborhood,
    city,
    maritalStatus,
    baptismDate,
    birthDate,
    visitDate,
    referredBy,
    status,
    notes,
    photoUrl,
  } = req.body;

  const finalName = name ?? existingYouth.name;
  const finalPhone = phone ?? existingYouth.phone;

  if (!finalName || !finalPhone) {
    return res.status(400).json({ success: false, error: "Nome e telefone são obrigatórios." });
  }

  const updatedYouth = {
    ...existingYouth,
    name: String(finalName).trim(),
    role: String(role ?? existingYouth.role ?? "Jovem").trim(),
    phone: String(finalPhone).trim(),
    email: String(email ?? existingYouth.email ?? "").trim(),
    cellName: String(cellName ?? existingYouth.cellName ?? "").trim(),
    address: String(address ?? existingYouth.address ?? "").trim(),
    neighborhood: String(neighborhood ?? existingYouth.neighborhood ?? "").trim(),
    city: String(city ?? existingYouth.city ?? "").trim(),
    maritalStatus: String(maritalStatus ?? existingYouth.maritalStatus ?? "").trim(),
    baptismDate: String(baptismDate ?? existingYouth.baptismDate ?? "").trim(),
    birthDate: String(birthDate ?? existingYouth.birthDate ?? "").trim(),
    visitDate: String(visitDate ?? existingYouth.visitDate ?? "").trim(),
    referredBy: String(referredBy ?? existingYouth.referredBy ?? "").trim(),
    status: String(status ?? existingYouth.status ?? "Ativo").trim(),
    notes: String(notes ?? existingYouth.notes ?? "").trim(),
    photoUrl: photoUrl ? String(photoUrl).trim() : existingYouth.photoUrl,
  };

  youthData[youthIndex] = updatedYouth;
  persistYouth();

  return res.json({ success: true, youth: updatedYouth });
});

app.delete("/api/youth/:id", (req, res) => {
  const youthId = parseInt(req.params.id, 10);
  const youthIndex = youthData.findIndex((y) => y.id === youthId);

  if (youthIndex === -1) {
    return res.status(404).json({ success: false, error: "Jovem não encontrado." });
  }

  const deletedYouth = youthData[youthIndex];
  youthData.splice(youthIndex, 1);
  persistYouth();

  return res.json({ success: true, message: "Jovem deletado com sucesso.", youth: deletedYouth });
});

app.post("/api/messages/birthday", async (req, res) => {
  const { phone, memberName, pastorName } = req.body;

  if (!phone || !memberName) {
    return res.status(400).json({ error: "Telefone e Nome são obrigatórios." });
  }

  const messageText = `Graça e Paz, ${memberName}! Nós da Igreja Bom Samaritano te desejamos um feliz aniversário! 🎉 Que o Senhor te abençoe rica e abundantemente neste dia tão especial. Um forte abraço do seu ${pastorName || "Pastor"}! 🙏✨`;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  if (!WHATSAPP_TOKEN || !PHONE_ID) {
    return res.status(400).json({ error: "Configuração de WhatsApp não encontrada. Defina WHATSAPP_TOKEN e WHATSAPP_PHONE_ID." });
  }

  const cleanPhone = normalizePhone(phone);
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: messageText,
    },
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, payload, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    });
    devLog(`✅ WhatsApp de aniversário enviado para ${memberName} (${formattedPhone})`, response.data);
    return res.status(200).json({ success: true, message: "Enviado com sucesso!", data: response.data });
  } catch (err) {
    console.error("⚠️ Erro WhatsApp (Aniversário):", err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

app.post("/api/messages/send-whatsapp", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const mediaUrl = req.body.mediaUrl || req.body.media_url || null;
    const clientKey = req.headers["apikey"];
    const clientUrl = req.headers["apiurl"];

    const apiKey = clientKey || process.env.WHATSAPP_TOKEN;
    let apiUrl = clientUrl || `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: "Telefone e mensagem são obrigatórios." });
    }

    const cleanPhone = normalizePhone(phone);
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const finalPhoneWithPlus = finalPhone.startsWith("+") ? finalPhone : `+${finalPhone}`;
    const isUltraMsg = apiUrl?.toLowerCase().includes("ultramsg.com");

    if (isUltraMsg) {
      // If mediaUrl is provided, use the UltraMsg image endpoint
      if (mediaUrl) {
        if (!apiUrl.toLowerCase().endsWith("/messages/image")) {
          apiUrl = apiUrl.replace(/\/+$/, "") + "/messages/image";
        }

        const formBody = new URLSearchParams();
        formBody.append("to", finalPhoneWithPlus);
        formBody.append("image", mediaUrl);
        formBody.append("caption", message);
        if (apiKey) {
          apiUrl += apiUrl.includes("?") ? `&token=${encodeURIComponent(apiKey)}` : `?token=${encodeURIComponent(apiKey)}`;
        }
        devLog(`DEBUG UltraMSG IMAGE request: ${apiUrl}`);
        devLog(`DEBUG UltraMSG IMAGE body: ${formBody.toString()}`);

        const response = await axios.post(apiUrl, formBody.toString(), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        devLog(`🚀 Disparo UltraMSG (IMAGE) realizado para ${finalPhoneWithPlus}`);
        return res.json({ success: true, data: response.data });
      }

      // Fallback to chat/text endpoint
      if (!apiUrl.toLowerCase().endsWith("/messages/chat")) {
        apiUrl = apiUrl.replace(/\/+$/, "") + "/messages/chat";
      }

      const formBody = new URLSearchParams();
      formBody.append("to", finalPhoneWithPlus);
      formBody.append("body", message);
      if (apiKey) {
        apiUrl += apiUrl.includes("?") ? `&token=${encodeURIComponent(apiKey)}` : `?token=${encodeURIComponent(apiKey)}`;
      }
      devLog(`DEBUG UltraMSG request: ${apiUrl}`);
      devLog(`DEBUG UltraMSG body: ${formBody.toString()}`);

      const response = await axios.post(apiUrl, formBody.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      devLog(`🚀 Disparo UltraMSG realizado para ${finalPhoneWithPlus}`);
      return res.json({ success: true, data: response.data });
    }

    if (apiUrl && (apiUrl.toLowerCase().includes("sendtext") || apiUrl.toLowerCase().includes("evolution") || apiUrl.toLowerCase().includes("wppconnect") || (apiKey && apiKey.startsWith("zapsendmax")))) {
      const response = await axios.post(apiUrl, { number: finalPhone, text: message }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          apikey: apiKey,
        },
      });
      devLog(`🚀 Disparo Evolution/WPPConnect realizado para ${finalPhone}`);
      return res.json({ success: true, data: response.data });
    }

    const payload = {
      messaging_product: "whatsapp",
      to: finalPhone.startsWith("55") ? finalPhone : `55${finalPhone}`,
      type: "text",
      text: { body: message },
    };

    const response = await axios.post(apiUrl, payload, {
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    });
    devLog(`🚀 Disparo Meta Cloud API realizado para ${finalPhone}`);
    return res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("❌ Erro no disparo de WhatsApp Backend:", err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.response?.data?.error?.message || err.message });
  }
});

// Birthday Scheduler Status Endpoint
app.post("/api/scheduler/status", (req, res) => {
  try {
    const { enabled, dispatchTime } = req.body;

    devLog(`⚙️  Scheduler Status Updated:`);
    devLog(`   Enabled: ${enabled}`);
    devLog(`   Dispatch Time: ${dispatchTime}`);

    // Store in environment or could persist to file if needed
    process.env.BIRTHDAY_SCHEDULER_ENABLED = String(enabled);
    process.env.BIRTHDAY_DISPATCH_TIME = dispatchTime || "08:00";

    return res.json({ success: true, message: "Scheduler status updated", enabled, dispatchTime });
  } catch (err) {
    console.error("❌ Erro ao atualizar scheduler status:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/messages/generate-weather-message", (req, res) => {
  try {
    const { cidade, temperatura, clima, condicao, chuva } = req.body;
    const finalCidade = cidade || "São Paulo";
    const finalTemp = temperatura || "22";
    const finalClima = clima || condicao || "Nublado";
    const isChuvaSim = chuva === "Sim" || chuva === "true" || chuva === true || String(chuva).toLowerCase() === "sim";
    const prep = finalCidade.toLowerCase() === "rio de janeiro" ? "no" : "em";
    const message = isChuvaSim
      ? `Hoje ${prep} ${finalCidade} está fazendo ${finalTemp}°C com clima ${finalClima.toLowerCase()}. Há possibilidade de chuva durante o dia.`
      : `Hoje ${prep} ${finalCidade} a temperatura está em ${finalTemp}°C com tempo ${finalClima.toLowerCase()} e sem previsão de chuva.`;
    return res.json({ success: true, message });
  } catch (err) {
    console.error("❌ Erro no gerador de clima:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function sendEmail(toEmail, otpCode) {
  const mailOptions = {
    from: `"CRM Bom Samaritano" <${process.env.GMAIL_USER || "no-reply@bomsamaritano.org"}>`,
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

async function sendWhatsApp(toPhone, otpCode) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  const formattedPhone = `55${normalizePhone(toPhone)}`;
  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: "auth_otp_template",
      language: { code: "pt_BR" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otpCode }],
        },
      ],
    },
  };
  return axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, payload, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
}

const PORT = 3001;
app.listen(PORT, () => {
  devLog(`🚀 Servidor de Autenticação rodando na porta ${PORT}`);
  // Start birthday message scheduler
  startScheduler();
});
