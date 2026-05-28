import { apiFetch } from "./api";

export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const apiKey = localStorage.getItem("settings_wa_api_key") || "";
  const apiUrl = localStorage.getItem("settings_wa_api_url") || "";

  try {
    const bodyPayload: any = { phone, message };
    if (mediaUrl) bodyPayload.mediaUrl = mediaUrl;

    const result = await apiFetch<{ success: boolean; data?: any; error?: string }>("/api/messages/send-whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
        apiurl: apiUrl,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!result.success) {
      return { success: false, error: result.error || "Falha no envio via WhatsApp API." };
    }

    return { success: true, data: result.data };
  } catch (err: any) {
    console.error("Erro na requisição ao backend de WhatsApp:", err);
    return { success: false, error: err.message || "Erro ao enviar WhatsApp." };
  }
}

export async function sendBirthdayMessage(
  phone: string,
  memberName: string,
  pastorName?: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const messageText = `Graça e Paz, querida ${memberName}! 🙏\n\nNós da Igreja Bom Samaritano te desejamos um FELIZ ANIVERSÁRIO! 🎉🎂\n\nQue o Senhor te abençoe rica e abundantemente neste dia tão especial. Que Seus planos se realizem em sua vida!\n\n"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." (Números 6:24-26)\n\nUm forte abraço do seu ${pastorName || "Pastor"}! 💪✨`;

  return sendWhatsAppMessage(phone, messageText, mediaUrl);
}
