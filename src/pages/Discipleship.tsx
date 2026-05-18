import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Heart,
  Search,
  BookOpen,
  Calendar,
  Plus,
  X,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Bookmark,
  Award
} from "lucide-react";
import DiscipleshipQuiz from "../components/DiscipleshipQuiz";

const LESSONS = [
  {
    num: 1, title: "Salvação", subtitle: "A Graça que nos Encontra",
    base: "Efésios 2:8", baseText: "\"Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus.\"",
    objective: "Ensinar que a salvação é um presente da graça de Deus recebido pela fé em Jesus Cristo.",
    color: "from-purple-600/20 to-indigo-600/10", border: "border-purple-500/30", icon: "✝️",
    sections: [
      { title: "O Que é Salvação?", items: ["Libertação do poder do pecado","Reconciliação com Deus","Perdão completo","Nova vida em Cristo","Vida eterna"] },
      { title: "O Problema do Pecado", body: "O pecado não é apenas fazer coisas erradas. É viver longe de Deus e colocar outras coisas no centro da vida.", items: ["Culpa","Medo","Vazio","Separação de Deus"] },
      { title: "O Que Jesus Fez por Nós?", body: "Jesus viveu a vida perfeita que não conseguimos viver e morreu a morte que merecíamos.", items: ["Ele carregou nossos pecados","Recebeu nossa condenação","Nos ofereceu perdão e adoção"] },
      { title: "Como Receber a Salvação?", items: ["1. Arrependa-se — Reconheça seu pecado e volte-se para Deus","2. Creia em Jesus — Confie que somente Cristo pode salvar","3. Confesse Jesus como Senhor — Entregue sua vida ao governo de Cristo"] }
    ],
    memory: "\"Se com tua boca confessares Jesus como Senhor e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.\" — Romanos 10:9",
    application: ["Você já entregou sua vida a Cristo?","Em que você tem colocado sua confiança?","Ore hoje recebendo a graça de Deus."]
  },
  {
    num: 2, title: "Oração", subtitle: "Vivendo em Comunhão com Deus",
    base: "1 Tessalonicenses 5:17", baseText: "\"Orai sem cessar.\"",
    objective: "Ensinar que oração é relacionamento com Deus e não apenas um ritual religioso.",
    color: "from-blue-600/20 to-cyan-600/10", border: "border-blue-500/30", icon: "🙏",
    sections: [
      { title: "O Que é Oração?", items: ["Conversar com Deus","Desfrutar da presença do Pai","Abrir o coração","Depender do Senhor"] },
      { title: "Por Que Orar?", items: ["Porque Deus nos ama","Porque precisamos dEle","Porque crescemos espiritualmente","Porque a oração transforma nosso coração"] },
      { title: "Como Devemos Orar?", items: ["Com sinceridade — Deus vê o coração","Com fé — Confiando na bondade do Pai","Com perseverança — Sem desistir","Com humildade — Reconhecendo nossa dependência"] },
      { title: "Tipos de Oração", items: ["Adoração","Gratidão","Confissão","Intercessão","Clamor"] }
    ],
    memory: "\"Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.\" — 1 Pedro 5:7",
    application: ["Separe diariamente um tempo com Deus.","Comece com poucos minutos, mas seja constante.","Fale com Deus como um filho fala com o Pai."]
  },
  {
    num: 3, title: "A Palavra", subtitle: "Deus Fala Conosco",
    base: "Salmo 119:105", baseText: "\"Lâmpada para os meus pés é a tua palavra.\"",
    objective: "Mostrar que a Bíblia é a Palavra de Deus e o alimento espiritual do cristão.",
    color: "from-amber-600/20 to-yellow-600/10", border: "border-amber-500/30", icon: "📖",
    sections: [
      { title: "O Que é a Bíblia?", items: ["Palavra inspirada por Deus","Revelação do caráter de Deus","Guia para a vida","Fonte de verdade"] },
      { title: "Por Que Ler a Bíblia?", items: ["Fortalece a fé","Renova a mente","Corrige o coração","Produz maturidade espiritual"] },
      { title: "Como Ler a Bíblia?", items: ["1. Ore antes de ler — Peça entendimento","2. Leia diariamente — A constância é mais importante que quantidade","3. Medite — Pergunte: O que ensina sobre Deus? O que revela sobre mim?","4. Pratique — A Palavra transforma quando é obedecida"] }
    ],
    memory: "\"Toda Escritura é inspirada por Deus.\" — 2 Timóteo 3:16",
    application: ["Crie o hábito diário de leitura bíblica.","Comece pelos Evangelhos.","Anote o que Deus falar ao seu coração."]
  },
  {
    num: 4, title: "Fé", subtitle: "Confiando em Deus",
    base: "Hebreus 11:1", baseText: "\"Ora, a fé é a certeza das coisas que se esperam.\"",
    objective: "Ensinar que a fé cristã é confiança em Deus e em Suas promessas.",
    color: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/30", icon: "⚓",
    sections: [
      { title: "O Que é Fé?", items: ["Confiar em Deus","Descansar em Sua graça","Crer mesmo sem ver","Depender de Cristo"] },
      { title: "Como a Fé Cresce?", items: ["Pela Palavra","Pela oração","Pela comunhão","Pela prática da obediência"] },
      { title: "Inimigos da Fé", items: ["Medo","Ansiedade","Autossuficiência","Dúvida alimentada pela incredulidade"] },
      { title: "Exemplos Bíblicos", items: ["Abraão","Davi","Daniel","Maria","Paulo"] }
    ],
    memory: "\"O justo viverá pela fé.\" — Romanos 1:17",
    application: ["Entregue suas preocupações a Deus.","Confie no Senhor mesmo quando não entender tudo.","Caminhe pela fé diariamente."]
  },
  {
    num: 5, title: "Igreja", subtitle: "A Família de Deus",
    base: "Hebreus 10:25", baseText: "\"Não deixemos de congregar-nos.\"",
    objective: "Ensinar a importância da comunhão cristã e da vida em igreja.",
    color: "from-rose-600/20 to-pink-600/10", border: "border-rose-500/30", icon: "⛪",
    sections: [
      { title: "O Que é a Igreja?", items: ["Corpo de Cristo","Família espiritual","Comunidade da graça","Povo de Deus"] },
      { title: "Por Que Precisamos da Igreja?", items: ["Crescemos juntos","Somos encorajados","Aprendemos a amar","Servimos uns aos outros"] },
      { title: "O Que um Cristão Deve Fazer?", items: ["Participar","Servir","Amar","Perdoar","Caminhar em unidade"] },
      { title: "A Igreja Não é Perfeita", body: "A igreja é formada por pecadores alcançados pela graça. Por isso aprendemos humildade, perdão e reconciliação.", items: [] }
    ],
    memory: "\"Vós sois o corpo de Cristo.\" — 1 Coríntios 12:27",
    application: ["Participe fielmente da comunhão.","Desenvolva relacionamentos espirituais.","Descubra maneiras de servir."]
  },
  {
    num: 6, title: "Generosidade", subtitle: "Honrando a Deus com os Recursos",
    base: "2 Coríntios 9:7", baseText: "\"Cada um contribua segundo propôs no coração.\"",
    objective: "Ensinar que generosidade é fruto da graça de Deus no coração.",
    color: "from-orange-600/20 to-amber-600/10", border: "border-orange-500/30", icon: "🌱",
    sections: [
      { title: "O Que é Generosidade?", items: ["Gratidão prática","Confiança em Deus","Amor em ação","Desapego do materialismo"] },
      { title: "Tudo Pertence a Deus", body: "Somos administradores e não donos absolutos. Deus nos dá recursos para suprir necessidades, abençoar pessoas e expandir o Reino.", items: [] },
      { title: "Por Que Contribuímos?", items: ["Porque Deus foi generoso conosco","Porque Cristo se entregou por nós","Porque queremos participar da missão de Deus"] }
    ],
    memory: "\"Mais bem-aventurado é dar do que receber.\" — Atos 20:35",
    application: ["Desenvolva um coração generoso.","Seja fiel e intencional.","Use seus recursos para glorificar a Deus."]
  },
  {
    num: 7, title: "Santidade", subtitle: "Uma Nova Vida em Cristo",
    base: "1 Pedro 1:16", baseText: "\"Sede santos, porque eu sou santo.\"",
    objective: "Ensinar que o cristão é chamado para uma vida transformada pelo Espírito Santo.",
    color: "from-violet-600/20 to-purple-600/10", border: "border-violet-500/30", icon: "🕊️",
    sections: [
      { title: "O Que é Santidade?", body: "Santidade não é perfeccionismo religioso. É viver para Deus, afastar-se do pecado e tornar-se semelhante a Cristo.", items: [] },
      { title: "Como Somos Transformados?", items: ["Pela graça","Pela Palavra","Pelo Espírito Santo","Pelo arrependimento contínuo"] },
      { title: "Fruto do Espírito", items: ["Amor","Alegria","Paz","Paciência","Bondade","Domínio próprio"] }
    ],
    memory: "\"Se alguém está em Cristo, nova criatura é.\" — 2 Coríntios 5:17",
    application: ["Abandone práticas pecaminosas.","Busque uma vida íntegra.","Peça diariamente ajuda ao Espírito Santo."]
  },
  {
    num: 8, title: "Missão", subtitle: "Vivendo para a Glória de Deus",
    base: "Marcos 16:15", baseText: "\"Ide por todo o mundo e pregai o evangelho.\"",
    objective: "Ensinar que todo cristão foi chamado para testemunhar de Jesus.",
    color: "from-sky-600/20 to-blue-600/10", border: "border-sky-500/30", icon: "🌍",
    sections: [
      { title: "O Que é Missão?", body: "Missão é participar da obra de Deus no mundo. Todo cristão é chamado para anunciar o evangelho, amar pessoas, servir e refletir Cristo.", items: [] },
      { title: "Como Testemunhar?", items: ["Com palavras — Compartilhando o evangelho","Com atitudes — Demonstrando amor e graça","Com serviço — Ajudando pessoas em necessidade"] },
      { title: "Jesus é o Centro da Missão", body: "Não anunciamos religião. Anunciamos Cristo crucificado e ressurreto.", items: [] }
    ],
    memory: "\"Vós sois a luz do mundo.\" — Mateus 5:14",
    application: ["Ore por pessoas que não conhecem Jesus.","Compartilhe seu testemunho.","Viva de forma que glorifique a Cristo."]
  }
];

interface DiscipleshipPair {
  id: number;
  mentor: string;
  disciple: string;
  completedLessons: number;
  totalLessons: number;
  lastMeeting: string;
  status: "Em Progresso" | "Concluído" | "Pausado";
}

export default function Discipleship() {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [lessonModal, setLessonModal] = useState<number | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<DiscipleshipPair | null>(null);
  const [pairs, setPairs] = useState<DiscipleshipPair[]>(() => {
    const saved = localStorage.getItem("discipleship_data");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        mentor: "Sandra Regina",
        disciple: "Clarice Lima",
        completedLessons: 4,
        totalLessons: 8,
        lastMeeting: "2026-05-14",
        status: "Em Progresso",
      },
      {
        id: 2,
        mentor: "Lucas Rocha",
        disciple: "Rodrigo Alencar",
        completedLessons: 7,
        totalLessons: 8,
        lastMeeting: "2026-05-12",
        status: "Em Progresso",
      },
      {
        id: 3,
        mentor: "Pr. Anderson Silva",
        disciple: "Mateus Santana",
        completedLessons: 8,
        totalLessons: 8,
        lastMeeting: "2026-05-01",
        status: "Concluído",
      },
      {
        id: 4,
        mentor: "Carlos Eduardo",
        disciple: "Eduardo Santos",
        completedLessons: 2,
        totalLessons: 8,
        lastMeeting: "2026-04-20",
        status: "Pausado",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("discipleship_data", JSON.stringify(pairs));
  }, [pairs]);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Form State
  const [newMentor, setNewMentor] = useState("");
  const [newDisciple, setNewDisciple] = useState("");
  const [newLessons, setNewLessons] = useState(0);
  const [newStatus, setNewStatus] = useState<DiscipleshipPair["status"]>("Em Progresso");

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentor || !newDisciple) return;

    const newPair: DiscipleshipPair = {
      id: Date.now(),
      mentor: newMentor,
      disciple: newDisciple,
      completedLessons: Number(newLessons),
      totalLessons: 8,
      lastMeeting: new Date().toISOString().split("T")[0],
      status: newStatus,
    };

    setPairs([newPair, ...pairs]);
    setIsModalOpen(false);

    // Reset Form
    setNewMentor("");
    setNewDisciple("");
    setNewLessons(0);
    setNewStatus("Em Progresso");
  };

  const handleDeletePair = (id: number) => {
    if (window.confirm("Deseja realmente remover esta dupla de discipulado?")) {
      setPairs(pairs.filter((p) => p.id !== id));
    }
  };

  const handleScheduleMeeting = (id: number) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setPairs(
      pairs.map((p) => {
        if (p.id === id) {
          alert(`Encontro pastoral registrado com sucesso para hoje (${new Date().toLocaleDateString("pt-BR")})!`);
          return { ...p, lastMeeting: todayStr };
        }
        return p;
      })
    );
  };

  const handleIncrementLesson = (id: number) => {
    setPairs(
      pairs.map((p) => {
        if (p.id === id) {
          const nextLessons = Math.min(p.completedLessons + 1, p.totalLessons);
          const nextStatus = nextLessons === p.totalLessons ? "Concluído" : p.status;
          const todayStr = new Date().toISOString().split("T")[0];
          return {
            ...p,
            completedLessons: nextLessons,
            status: nextStatus,
            lastMeeting: todayStr
          };
        }
        return p;
      })
    );
  };

  const filteredPairs = pairs.filter(
    (p) =>
      p.mentor.toLowerCase().includes(search.toLowerCase()) ||
      p.disciple.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Discipulado</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Gerencie o acompanhamento espiritual de pessoa para pessoa (Mentoria / Consolidação)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Vincular Nova Dupla</span>
        </button>
      </div>

      {/* Discipleship Path Banner — clickable tiles */}
      <div className="glass-card p-6 bg-gradient-to-r from-rose-950/20 to-zinc-950 border border-rose-500/10">
        <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
          <BookOpen className="text-rose-400" size={18} />
          <span>Jornada de Integração &amp; Estudo — Clique numa lição para ver o conteúdo</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          {LESSONS.map((lesson) => (
            <button
              key={lesson.num}
              onClick={() => setLessonModal(lesson.num)}
              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-lg p-2.5 space-y-1 transition-all active:scale-95 group"
            >
              <span className="text-lg block">{lesson.icon}</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-purple-400 font-bold block uppercase transition-colors">Lição 0{lesson.num}</span>
              <span className="text-xs font-semibold text-zinc-300 block truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duplas Ativas</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.filter((p) => p.status === "Em Progresso").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Concluídos</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.filter((p) => p.status === "Concluído").length}
            </h4>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Média de Conclusão</p>
            <h4 className="text-2xl font-bold text-white mt-1">
              {pairs.length > 0 
                ? `${Math.round((pairs.filter(p => p.status === "Concluído").length / pairs.length) * 100)}%` 
                : "0%"}
            </h4>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por mentor ou discípulo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* Discipleship Pairs list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPairs.map((pair) => {
          const progressPercent = Math.round((pair.completedLessons / pair.totalLessons) * 100);
          return (
            <div
              key={pair.id}
              className="glass-card p-6 border border-white/5 bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 relative group hover:border-purple-500/20 transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        pair.status === "Em Progresso"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : pair.status === "Concluído"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {pair.status}
                    </span>
                    <span className="text-[10px] text-zinc-500">Último encontro: {new Date(pair.lastMeeting + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  
                  {/* Mentor & Disciple Row */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="text-zinc-200">
                      <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">Mentor</span>
                      <span className="text-sm font-bold">{pair.mentor}</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-600 mt-4" />
                    <div className="text-zinc-200">
                      <span className="text-xs text-zinc-500 block uppercase font-bold tracking-wider">Discípulo</span>
                      <span className="text-sm font-bold text-purple-400">{pair.disciple}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePair(pair.id)}
                  title="Remover Dupla"
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Progresso do Estudo</span>
                  <span className="text-purple-400">
                    {pair.completedLessons} / {pair.totalLessons} Lições ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 justify-end">
                <button
                  onClick={() => handleScheduleMeeting(pair.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-300 transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar size={12} />
                  <span>Agenda Encontro</span>
                </button>
                {pair.completedLessons >= 8 ? (
                  <button
                    onClick={() => setActiveQuiz(pair)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Award size={12} />
                    <span>Avaliação Final</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleIncrementLesson(pair.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/10 hover:border-purple-500/30 text-purple-400 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <BookOpen size={12} />
                    <span>Atualizar Lição</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cadastrar Nova Dupla Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="text-rose-400 animate-pulse" size={20} />
                <span>Vincular Nova Dupla de Discipulado</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPair} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mentor (Consolidador / Discipulador)</label>
                <input
                  type="text"
                  required
                  value={newMentor}
                  onChange={(e) => setNewMentor(e.target.value)}
                  placeholder="Ex: Sandra Regina"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Discípulo (Novo Convertido / Consolidando)</label>
                <input
                  type="text"
                  required
                  value={newDisciple}
                  onChange={(e) => setNewDisciple(e.target.value)}
                  placeholder="Ex: Clarice de Lima"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Lições Concluídas (De 0 a 8)</label>
                  <input
                    type="number"
                    min={0}
                    max={8}
                    required
                    value={newLessons}
                    onChange={(e) => setNewLessons(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Status Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DiscipleshipPair["status"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Em Progresso" className="bg-zinc-900">Em Progresso</option>
                    <option value="Concluído" className="bg-zinc-900">Concluído</option>
                    <option value="Pausado" className="bg-zinc-900">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Confirmar Vínculo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== BIBLIOTECA DE LIÇÕES ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bookmark className="text-purple-400" size={20} />
          <h3 className="text-xl font-extrabold text-white">Biblioteca de Lições Pastorais</h3>
        </div>
        <p className="text-sm text-zinc-400">Conteúdo completo das 8 lições fundamentais do discipulado. Clique em qualquer lição para expandir.</p>

        {LESSONS.map((lesson) => (
          <div key={lesson.num} className={`glass-card border ${lesson.border} overflow-hidden transition-all`}>
            {/* Header */}
            <button
              onClick={() => setExpandedLesson(expandedLesson === lesson.num ? null : lesson.num)}
              className={`w-full flex items-center justify-between gap-4 p-5 text-left bg-gradient-to-r ${lesson.color} hover:brightness-110 transition-all`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lesson.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lição 0{lesson.num}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">{lesson.title} <span className="text-zinc-400 font-medium text-sm">— {lesson.subtitle}</span></h4>
                  <p className="text-xs text-zinc-400 mt-0.5 italic">{lesson.baseText} ({lesson.base})</p>
                </div>
              </div>
              {expandedLesson === lesson.num
                ? <ChevronUp size={20} className="text-zinc-400 shrink-0" />
                : <ChevronDown size={20} className="text-zinc-400 shrink-0" />}
            </button>

            {/* Expanded content */}
            {expandedLesson === lesson.num && (
              <div className="p-6 space-y-6 border-t border-white/10">
                {/* Objetivo */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Objetivo da Lição</p>
                  <p className="text-sm text-zinc-200 font-medium">{lesson.objective}</p>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.sections.map((section, si) => (
                    <div key={si} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                      <h5 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">{section.title}</h5>
                      {section.body && <p className="text-xs text-zinc-300 leading-relaxed">{section.body}</p>}
                      {section.items.length > 0 && (
                        <ul className="space-y-1">
                          {section.items.map((item, ii) => (
                            <li key={ii} className="text-xs text-zinc-300 flex items-start gap-2">
                              <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Verso para memorizar */}
                <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Versículo para Memorizar</span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed italic">{lesson.memory}</p>
                </div>

                {/* Aplicação */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Aplicação Prática</p>
                  <ul className="space-y-1.5">
                    {lesson.application.map((item, ai) => (
                      <li key={ai} className="text-xs text-zinc-300 flex items-start gap-2">
                        <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Modal (from banner tile click) */}
      {lessonModal !== null && (() => {
        const lesson = LESSONS.find(l => l.num === lessonModal)!;
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className={`px-6 py-5 flex items-center justify-between bg-gradient-to-r ${lesson.color} border-b border-white/10 sticky top-0 z-10`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{lesson.icon}</span>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Lição 0{lesson.num} — {lesson.base}</p>
                    <h3 className="text-lg font-extrabold text-white">{lesson.title}: {lesson.subtitle}</h3>
                  </div>
                </div>
                <button onClick={() => setLessonModal(null)} className="text-zinc-400 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Objetivo</p>
                  <p className="text-sm text-zinc-200">{lesson.objective}</p>
                </div>
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Texto Base</p>
                  <p className="text-sm text-zinc-200 italic">{lesson.baseText}</p>
                  <p className="text-xs text-zinc-500 mt-1">{lesson.base}</p>
                </div>
                {lesson.sections.map((section, si) => (
                  <div key={si}>
                    <h5 className="text-sm font-extrabold text-purple-400 mb-2">{section.title}</h5>
                    {section.body && <p className="text-sm text-zinc-300 leading-relaxed mb-2">{section.body}</p>}
                    {section.items.length > 0 && (
                      <ul className="space-y-1.5">
                        {section.items.map((item, ii) => (
                          <li key={ii} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl p-5">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">Versículo para Memorizar</p>
                  <p className="text-sm text-zinc-200 italic leading-relaxed">{lesson.memory}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Aplicação Prática</p>
                  {lesson.application.map((item, ai) => (
                    <div key={ai} className="flex items-start gap-2 mb-1.5">
                      <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-zinc-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quiz / Certificate Modal */}
      {activeQuiz && (
        <DiscipleshipQuiz
          discipleName={activeQuiz.disciple}
          mentorName={activeQuiz.mentor}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
