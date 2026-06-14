import { useState, useRef } from "react";
import { X, CheckCircle, XCircle, Star, Printer, RotateCcw, ChevronRight } from "lucide-react";

const JOURNEY_QUESTIONS: Record<string, { q: string; options: string[]; correct: number; lesson: string }[]> = {
  integracao: [
    {
      q: "Segundo Efésios 2:8, como somos salvos?",
      options: ["Pelas boas obras", "Pela graça mediante a fé", "Pela religião e rituais", "Pelo esforço próprio"],
      correct: 1, lesson: "Lição 1 — Salvação"
    },
    {
      q: "O que o pecado produz no coração humano?",
      options: ["Alegria e paz", "Prosperidade e saúde", "Culpa, medo e separação de Deus", "Força e coragem"],
      correct: 2, lesson: "Lição 1 — Salvação"
    },
    {
      q: "Em qual livro está escrito 'Orai sem cessar'?",
      options: ["Romanos 8:28", "João 3:16", "Salmo 23:1", "1 Tessalonicenses 5:17"],
      correct: 3, lesson: "Lição 2 — Oração"
    },
    {
      q: "Quais são os tipos de oração ensinados na lição?",
      options: ["Adoração, gratidão, confissão e intercessão", "Apenas louvor e adoração", "Jejum, vigília e culto", "Pedido e agradecimento apenas"],
      correct: 0, lesson: "Lição 2 — Oração"
    },
    {
      q: "Como a Bíblia é descrita no Salmo 119:105?",
      options: ["Uma coleção de histórias antigas", "Lâmpada para os meus pés", "Um livro de filosofia religiosa", "Manual de regras religiosas"],
      correct: 1, lesson: "Lição 3 — A Palavra"
    },
    {
      q: "Qual a ordem correta para ler a Bíblia segundo a lição?",
      options: ["Ler rápido, memorizar tudo", "Ler só os Salmos e Provérbios", "Orar, ler diariamente, meditar e praticar", "Assistir sermões e anotar"],
      correct: 2, lesson: "Lição 3 — A Palavra"
    },
    {
      q: "O que é a fé cristã segundo a lição?",
      options: ["Pensamento positivo e otimismo", "Confiança em Deus e em Suas promessas", "Crença sem nenhuma base", "Força de vontade humana"],
      correct: 1, lesson: "Lição 4 — Fé"
    },
    {
      q: "O que é a Igreja segundo a lição?",
      options: ["Apenas um prédio religioso", "Um clube de pessoas boas", "O corpo de Cristo e família espiritual", "Uma organização política"],
      correct: 2, lesson: "Lição 5 — Igreja"
    },
    {
      q: "Segundo Atos 20:35, o que é mais bem-aventurado?",
      options: ["Guardar e economizar", "Dar do que receber", "Receber e agradecer", "Poupar para o futuro"],
      correct: 1, lesson: "Lição 6 — Generosidade"
    },
    {
      q: "Como a lição descreve nossa relação com os recursos de Deus?",
      options: ["Somos donos absolutos", "Somos independentes de Deus", "Somos administradores dos recursos de Deus", "Somos credores de Deus"],
      correct: 2, lesson: "Lição 6 — Generosidade"
    },
    {
      q: "O que inclui o Fruto do Espírito segundo a lição 7?",
      options: ["Riqueza, saúde e prosperidade", "Amor, alegria, paz, paciência e bondade", "Poder, autoridade e milagres", "Sabedoria e conhecimento apenas"],
      correct: 1, lesson: "Lição 7 — Santidade"
    },
    {
      q: "Para que todo cristão é chamado segundo Marcos 16:15?",
      options: ["Ficar apenas dentro da igreja", "Estudar teologia avançada", "Anunciar o evangelho, amar e servir", "Liderar grupos e organizações"],
      correct: 2, lesson: "Lição 8 — Missão"
    }
  ],
  vida_vitoriosa: [
    {
      q: "Qual o melhor significado para o verbo pedir, de acordo com João 14.13?",
      options: ["Pedir", "Determinar", "Rogar"],
      correct: 1, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Há necessidade do cristão orar pedindo a cura?",
      options: ["Não", "Depende", "Sim"],
      correct: 0, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Sempre que aprendemos algo, o que devemos fazer?",
      options: ["Colocar logo em prática", "Esperar um pouco para praticar", "Não nos preocupar muito com o que aprendemos"],
      correct: 0, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Podemos exigir algo de Deus?",
      options: ["Sim", "Não", "Depende"],
      correct: 1, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Quando determinamos algo, a quem ordenamos?",
      options: ["A Deus", "Ao diabo", "A nós mesmos"],
      correct: 1, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Que poder entra em ação quando determinamos?",
      options: ["O de Deus", "O da fé", "O do diabo"],
      correct: 0, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Ao praticarmos o método da determinação, o que acontece?",
      options: ["Estamos obedecendo a Deus", "Estamos agindo por conta própria", "Deus está nos obedecendo"],
      correct: 0, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Quando determinamos, quem nos obedece?",
      options: ["Deus", "Os homens", "O diabo"],
      correct: 2, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Como são as coisas de Deus?",
      options: ["Difíceis de entender", "Fáceis para os teólogos", "Simples e descomplicadas"],
      correct: 2, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Quando determinamos alguma coisa, nós o fazemos:",
      options: ["Em nome de Deus", "Em nome de Jesus", "Em nosso nome"],
      correct: 1, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Como devemos orar a Deus?",
      options: ["Implorando a bênção", "Pedindo segundo a Sua vontade", "Agradecendo"],
      correct: 2, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Se cremos, podemos determinar:",
      options: ["O que quisermos", "O que a Igreja promete", "O que estiver ao nosso alcance"],
      correct: 0, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Se determinarmos uma cura e os sintomas persistirem, o que fazer?",
      options: ["Orar mais vezes determinando até a cura acontecer", "Apelar para os remédios", "Não levar os sintomas em consideração"],
      correct: 2, lesson: "Lição 1 — Determinação"
    },
    {
      q: "Quando Paulo curou um coxo (Atos 14.8-10), como ele agiu?",
      options: ["Suplicou a Deus a sua cura", "Determinou que ele ficasse curado", "Mandou que ele rezasse 20 Pai-Nossos"],
      correct: 1, lesson: "Lição 1 — Determinação"
    },
    {
      q: "O que foi importante no coxo para a sua cura?",
      options: ["A sua fé", "Ser amigo de Paulo", "Ser religioso"],
      correct: 0, lesson: "Lição 1 — Determinação"
    }
  ]
};

interface Props {
  discipleName: string;
  mentorName: string;
  journeyId?: string;
  onClose: () => void;
}

export default function DiscipleshipQuiz({ discipleName, mentorName, journeyId, onClose }: Props) {
  const QUESTIONS = JOURNEY_QUESTIONS[journeyId || "integracao"] || JOURNEY_QUESTIONS.integracao;
  const passThreshold = Math.ceil(QUESTIONS.length * 0.8);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [finished, setFinished] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const score = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const passed = score >= passThreshold;
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected!];
    setAnswers(newAnswers);
    if (current + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setConfirmed(false);
    setFinished(false);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    
    // Get variables
    const churchName = localStorage.getItem("settings_church_name") || "Igreja Bom Samaritano";
    const pastorName = localStorage.getItem("settings_pastor_name") || "Pr. Anderson Silva";
    const certNumber = Math.floor(100000 + Math.random() * 900000); // Random 6 digit number
    
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Certificado - ${discipleName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 landscape; margin: 0; }
          body { 
            margin: 0; 
            padding: 0; 
            background: #e2e8f0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* certificate inside the A4 page: fixed 640x480 landscape for digital export/preview */
          .certificate-container {
            width: 640px;
            height: 480px;
            background: #ffffff;
            position: relative;
            box-sizing: border-box;
            padding: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
            margin: auto; /* center inside the page */
            transform-origin: center center;
          }
          .bg-pattern {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: radial-gradient(#1e3a8a 0.5px, transparent 0.5px), radial-gradient(#1e3a8a 0.5px, transparent 0.5px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            opacity: 0.04;
            z-index: 1;
          }
          .border-outer {
            position: absolute;
            top: 16px; left: 16px; right: 16px; bottom: 16px;
            border: 2px solid #1e3a8a;
            z-index: 2;
            box-sizing: border-box;
          }
          .border-inner {
            position: absolute;
            top: 26px; left: 26px; right: 26px; bottom: 26px;
            border: 1px solid #b45309;
            z-index: 2;
            box-sizing: border-box;
          }
          .content {
            position: relative;
            z-index: 10;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .church-name {
            font-family: 'Cinzel', serif;
            font-size: 16px;
            font-weight: 600;
            color: #1e3a8a;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 25px;
          }
          .title {
            font-family: 'Cinzel', serif;
            font-size: 46px;
            font-weight: 700;
            color: #b45309;
            margin: 0 0 10px 0;
            letter-spacing: 2px;
          }
          .subtitle {
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            letter-spacing: 3px;
            margin-bottom: 30px;
          }
          .student-name {
            font-family: 'Great Vibes', cursive;
            font-size: 72px;
            color: #1e3a8a;
            margin: 15px 0;
            line-height: 1.2;
            border-bottom: 1px solid #cbd5e1;
            padding: 0 40px 10px 40px;
            display: inline-block;
          }
          .description {
            font-family: 'Montserrat', sans-serif;
            font-size: 16px;
            font-weight: 400;
            color: #334155;
            line-height: 1.8;
            max-width: 750px;
            margin: 25px auto;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            width: 85%;
            margin-top: 50px;
            align-items: flex-end;
          }
          .signature-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 250px;
          }
          .signature-line {
            width: 100%;
            border-top: 1px solid #64748b;
            margin-bottom: 8px;
          }
          .signature-name {
            font-family: 'Cinzel', serif;
            font-size: 14px;
            font-weight: 600;
            color: #1e3a8a;
          }
          .signature-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 12px;
            color: #64748b;
          }
          .seal-container {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 10;
          }
          .seal-icon {
            font-size: 42px;
            color: #d97706;
            margin-bottom: 12px;
          }
          .verse {
            font-family: 'Cinzel', serif;
            font-size: 13px;
            color: #64748b;
            font-style: italic;
            max-width: 400px;
            text-align: center;
            line-height: 1.5;
          }
          .cert-number {
            position: absolute;
            bottom: 18px;
            right: 18px;
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            color: #94a3b8;
            z-index: 10;
          }
          .date-box {
            position: absolute;
            bottom: 18px;
            left: 18px;
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            color: #94a3b8;
            z-index: 10;
          }
          @media print {
            body { background: white; }
            .certificate-container { box-shadow: none; }
            /* Keep the 640x480 certificate centered on A4 landscape when printing */
            .certificate-container { margin: 0; position: relative; left: 50%; transform: translateX(-50%); }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div class="bg-pattern"></div>
          <div class="border-outer"></div>
          <div class="border-inner"></div>
          
          <div class="content">
            <div class="church-name">${churchName}</div>
            
            <h1 class="title">Certificado</h1>
            <div class="subtitle">TEMOS A HONRA DE CERTIFICAR</div>
            
            <div class="student-name">${discipleName}</div>
            
            <div class="description">
              pela conclusão da jornada <strong>${journeyId === "vida_vitoriosa" ? "Vida Vitoriosa" : "Fundamentos da Fé"}</strong> do <strong>Programa de Discipulado Cristão</strong>, 
              demonstrando dedicação, crescimento espiritual e 
              compromisso com os ensinamentos de Cristo.
            </div>
            
            <div class="footer-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${mentorName}</div>
                <div class="signature-title">Mentor(a)</div>
              </div>
              
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">${pastorName}</div>
                <div class="signature-title">Pastor(a) Presidente</div>
              </div>
            </div>
          </div>
          
          <div class="seal-container">
            <div class="seal-icon">✝</div>
            <div class="verse">"Portanto, ide, fazei discípulos de todas as nações."<br>Mateus 28:19</div>
          </div>
          
          <div class="date-box">DATA: ${today}</div>
          <div class="cert-number">REGISTRO: Nº ${certNumber}</div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 800);
          }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // Quiz In Progress
  if (!finished) {
    const q = QUESTIONS[current];
    const isCorrect = confirmed && selected === q.correct;

    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-indigo-900/20">
            <div>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{q.lesson}</p>
              <h3 className="text-base font-bold text-white">Avaliação Final de Discipulado</h3>
              <p className="text-xs text-zinc-400">Discípulo: <span className="text-zinc-200 font-semibold">{discipleName}</span></p>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Questão {current + 1} de {QUESTIONS.length}</span>
              <span>{Math.round(((current) / QUESTIONS.length) * 100)}% concluído</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-base font-semibold text-zinc-100 leading-relaxed">{q.q}</p>

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ";
                if (!confirmed) {
                  cls += selected === i
                    ? "bg-purple-600/20 border-purple-500/50 text-white"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-purple-500/30";
                } else {
                  if (i === q.correct) cls += "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                  else if (i === selected) cls += "bg-rose-500/20 border-rose-500/50 text-rose-300";
                  else cls += "bg-white/5 border-white/5 text-zinc-500";
                }
                return (
                  <button key={i} className={cls} onClick={() => !confirmed && setSelected(i)} disabled={confirmed}>
                    <span className="font-bold mr-2 text-zinc-400">{String.fromCharCode(65 + i)})</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {confirmed && (
              <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${isCorrect ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-rose-500/10 border border-rose-500/20 text-rose-300"}`}>
                {isCorrect ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
                <span>{isCorrect ? "Correto! Muito bem! ✨" : `Resposta correta: ${String.fromCharCode(65 + q.correct)}) ${q.options[q.correct]}`}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              {!confirmed ? (
                <button
                  onClick={handleConfirm}
                  disabled={selected === null}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
                >
                  Confirmar Resposta
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-all"
                >
                  {current + 1 < QUESTIONS.length ? "Próxima" : "Ver Resultado"}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        {/* Result Header */}
        <div className={`px-6 py-6 text-center rounded-t-2xl ${passed ? "bg-gradient-to-br from-emerald-900/40 to-purple-900/30" : "bg-gradient-to-br from-rose-900/30 to-zinc-900/40"}`}>
          <div className="text-5xl mb-3">{passed ? "🏆" : "📚"}</div>
          <h3 className="text-2xl font-extrabold text-white">{passed ? "Parabéns! Aprovado!" : "Continue Estudando!"}</h3>
          <p className="text-zinc-400 text-sm mt-1">{discipleName}</p>
          <div className={`text-4xl font-extrabold mt-4 ${passed ? "text-emerald-400" : "text-amber-400"}`}>
            {score} / {QUESTIONS.length}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {passed ? `✅ Mínimo de ${passThreshold} acertos atingido — Certificado disponível!` : `❌ Precisa de ${passThreshold - score} acerto(s) a mais. Tente novamente!`}
          </p>
        </div>

        {/* Answer review */}
        <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Revisão das Respostas</h4>
          {QUESTIONS.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-xs border ${correct ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"}`}>
                {correct ? <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> : <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-zinc-300 font-medium">{q.q}</p>
                  {!correct && <p className="text-zinc-500 mt-0.5">Correta: {q.options[q.correct]}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate (visible when passed) */}
        {passed && (
          <div className="px-6 pb-2">
            <div ref={certRef} className="border-4 border-double border-purple-500/50 rounded-xl p-8 text-center bg-gradient-to-br from-purple-950/40 to-indigo-950/30">
              <div className="text-4xl mb-2">✝️</div>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-1">Igreja Bom Samaritano</p>
              <h1 className="text-2xl font-extrabold text-white mb-1">Certificado de Discipulado</h1>
              <p className="text-sm text-zinc-400 mb-4">{journeyId === "vida_vitoriosa" ? "Vida Vitoriosa" : "Fundamentos da Fé"}</p>
              <p className="text-xs text-zinc-400">Certificamos que</p>
              <h2 className="text-xl font-extrabold text-purple-300 my-2">{discipleName}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                concluiu com êxito as {QUESTIONS.length} lições do Programa de Discipulado,
                obtendo <span className="text-emerald-400 font-bold">{score} de {QUESTIONS.length}</span> pontos na avaliação final.
              </p>
              <div className="flex items-center gap-1 justify-center my-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-[10px] text-zinc-500">{today}</p>
              <div className="flex justify-around mt-6 pt-4 border-t border-purple-500/20">
                <div className="text-center">
                  <div className="w-24 border-t border-purple-500/40 mx-auto mb-1" />
                  <p className="text-[10px] text-zinc-500">{mentorName}</p>
                  <p className="text-[9px] text-zinc-600">Mentor(a)</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl">🕊️</div>
                  <p className="text-[9px] text-zinc-600">Aprovado</p>
                </div>
                <div className="text-center">
                  <div className="w-24 border-t border-purple-500/40 mx-auto mb-1" />
                  <p className="text-[10px] text-zinc-500">{discipleName}</p>
                  <p className="text-[9px] text-zinc-600">Discípulo(a)</p>
                </div>
              </div>
              <p className="text-[9px] text-purple-500 mt-3 italic">
                "Ide, portanto, e fazei discípulos de todas as nações..." — Mateus 28:19
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-6 pt-4 border-t border-white/10 justify-between">
          <button onClick={onClose} className="px-4 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all">
            Fechar
          </button>
          <div className="flex gap-3">
            <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-all active:scale-95">
              <RotateCcw size={15} />
              Refazer
            </button>
            {passed && (
              <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all">
                <Printer size={15} />
                Imprimir Certificado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
