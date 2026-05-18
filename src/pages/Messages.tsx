import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  BookOpen,
  Calendar,
  Gift,
  Smile,
  Copy,
  ExternalLink,
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  category: "Boas-vindas" | "Aniversário" | "Ausência" | "Agradecimento";
  text: string;
  icon: typeof Gift;
}

export default function Messages() {
  // Pastor name — reactive to Settings changes
  const [pastorName, setPastorName] = useState(() =>
    localStorage.getItem("settings_pastor_name") || "Pr. Anderson Silva"
  );
  useEffect(() => {
    const handleUpdate = () =>
      setPastorName(localStorage.getItem("settings_pastor_name") || "Pr. Anderson Silva");
    window.addEventListener("crm-settings-updated", handleUpdate);
    return () => window.removeEventListener("crm-settings-updated", handleUpdate);
  }, []);

  const templates: Template[] = [
    {
      id: "welcome",
      title: "Boas-vindas ao Visitante",
      category: "Boas-vindas",
      text: `Graça e paz, [NOME]! Que alegria foi receber você no culto do Bom Samaritano no último domingo. Desejamos que tenha se sentido acolhido por Deus e pela nossa igreja. Estaremos sempre de portas abertas para você e sua família. Caso queira conversar ou pedir oração, estou à disposição! Deus te abençoe ricamente. ${pastorName}.`,
      icon: Smile,
    },
    {
      id: "birthday",
      title: "Parabéns por Aniversário",
      category: "Aniversário",
      text: `Graça e paz, [NOME]! Hoje é dia de celebrar a vida preciosa que Deus te deu. Parabéns pelo seu aniversário! Que o Senhor guie seus passos, conceda paz, saúde e realize os desejos mais profundos do seu coração neste novo ano de vida. 'O Senhor te abençoe e te guarde...' (Números 6:24). Forte abraço ministerial. ${pastorName}.`,
      icon: Gift,
    },
    {
      id: "missing",
      title: "Sentimos sua Falta (Ausente)",
      category: "Ausência",
      text: `Graça e paz, [NOME]! Sentimos a sua falta em nossos últimos cultos e queríamos saber se está tudo bem com você e sua família. Saiba que você é precioso para nós e está em nossas orações. Se precisar de alguma coisa ou de uma visita pastoral, por favor me avise! Esperamos te ver no próximo domingo. Deus abençoe! ${pastorName}.`,
      icon: Calendar,
    },
    {
      id: "thanks",
      title: "Agradecimento Colaborador",
      category: "Agradecimento",
      text: `Graça e paz, [NOME]! Gostaria de agradecer imensamente pela sua dedicação e contribuição em nossa obra ministerial. Seu coração voluntário faz toda a diferença em nossa comunidade de fé. 'Deus é poderoso para fazer abundar em vós toda a graça...' (2 Coríntios 9:8). Continuamos orando por sua vida profissional e familiar. ${pastorName}.`,
      icon: BookOpen,
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [customText, setCustomText] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [sentHistory, setSentHistory] = useState(() => {
    const saved = localStorage.getItem("messages_history");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Clarice Lima", type: "Boas-vindas", date: "2026-05-16", status: "Enviado" },
      { id: 2, name: "Mateus Santana", type: "Aniversário", date: "2026-05-15", status: "Enviado" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("messages_history", JSON.stringify(sentHistory));
  }, [sentHistory]);

  // Update customized text whenever template or recipient name changes
  useEffect(() => {
    let text = selectedTemplate.text;
    if (recipientName) {
      text = text.replace(/\[NOME\]/g, recipientName);
    }
    setCustomText(text);
  }, [selectedTemplate, recipientName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!recipientPhone) return;

    const cleanPhone = recipientPhone.replace(/\D/g, "");
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(customText)}`;
    window.open(waUrl, "_blank");

    // Add to history statefully
    setSentHistory([
      {
        id: Date.now(),
        name: recipientName || "Contato WhatsApp",
        type: selectedTemplate.title,
        date: new Date().toISOString().split("T")[0],
        status: "Enviado",
      },
      ...sentHistory,
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Mensagens</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Envie devocionais, felicitações e saudações integradas diretamente ao WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Templates Selection Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              <span>Modelos Pastorais</span>
            </h3>
            <div className="space-y-3">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex gap-4 ${
                    selectedTemplate.id === tpl.id
                      ? "bg-purple-600/10 border-purple-500/30 text-white"
                      : "bg-white/5 border-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${
                    selectedTemplate.id === tpl.id ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-zinc-500"
                  }`}>
                    <tpl.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{tpl.title}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      {tpl.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-zinc-200 mb-4">Envios Recentes</h3>
            <div className="space-y-4">
              {sentHistory.map((hist: { id: number; name: string; type: string; date: string; status: string }) => (
                <div key={hist.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-200">{hist.name}</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{hist.type} • {new Date(hist.date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold">
                    {hist.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customizer & Live Preview Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/10">
            <h3 className="text-lg font-bold text-zinc-200 mb-6">Personalizar Mensagem</h3>
            
            <div className="space-y-5">
              {/* Select member shortcut */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Importar do Cadastro de Membros</label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [name, phone] = val.split("|");
                    setRecipientName(name);
                    setRecipientPhone(phone);
                    // Automatically switch to birthday template if the option says birthday!
                    if (val.includes("Aniversariante")) {
                      const birthdayTpl = templates.find(t => t.id === "birthday");
                      if (birthdayTpl) setSelectedTemplate(birthdayTpl);
                    } else if (val.includes("Visitante")) {
                      const welcomeTpl = templates.find(t => t.id === "welcome");
                      if (welcomeTpl) setSelectedTemplate(welcomeTpl);
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">-- Selecione um membro para preenchimento automático --</option>
                  <option value="Sandra Regina|(11) 98888-7777" className="bg-zinc-900">Sandra Regina (Obreira - Aniversariante hoje! 🎉)</option>
                  <option value="Lucas Rocha|(11) 97777-6666" className="bg-zinc-900">Lucas Rocha (Líder - Aniversariante hoje! 🎉)</option>
                  <option value="Clarice Lima|(11) 98765-4321" className="bg-zinc-900">Clarice Lima (Visitante)</option>
                  <option value="Anderson Silva|(11) 99999-8888" className="bg-zinc-900">Pr. Anderson Silva (Pastor)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome do Destinatário</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ex: Clarice de Lima"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">WhatsApp (DDD + Número)</label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Editor de Texto</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Preview Bubble */}
              <div className="bg-zinc-950 rounded-xl p-4 border border-white/5 space-y-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Visualização Prévia (WhatsApp Web/App)</span>
                <p className="text-xs text-emerald-400 font-mono bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/10 leading-relaxed whitespace-pre-wrap">
                  {customText}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    copied
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Copy size={16} />
                  <span>{copied ? "Copiado!" : "Copiar Texto"}</span>
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  disabled={!recipientPhone}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  <Send size={16} />
                  <span>Disparar WhatsApp</span>
                  <ExternalLink size={14} className="opacity-75" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
