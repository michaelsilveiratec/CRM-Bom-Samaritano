import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronDown,
  Droplets,
  Heart,
  Lock,
  QrCode,
  Shield,
  Smartphone,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { fetchServerSettings } from "../services/crm.service";

function readPastorPhoto() {
  return localStorage.getItem("settings_pastor_photo") || "";
}

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "Modulos", href: "#modulos" },
  { label: "Contato", href: "#contato" },
];

const featureCards = [
  {
    icon: Users,
    title: "Gestao de Membros",
    text: "Cadastre membros completos com foto, endereco, contatos, aniversario e historico ministerial.",
  },
  {
    icon: UserPlus,
    title: "Visitantes",
    text: "Registre visitantes, acompanhe retorno, origem, contato e integracao com a recepcao.",
  },
  {
    icon: Heart,
    title: "Discipulado",
    text: "Acompanhe crescimento espiritual, licoes, avaliacoes, progresso e envio pelo WhatsApp.",
  },
  {
    icon: Droplets,
    title: "Batismo",
    text: "Gerencie candidatos, agenda, acompanhamento espiritual e certificados de batismo.",
  },
  {
    icon: Wallet,
    title: "Financeiro",
    text: "Controle entradas, ofertas, relatorios e acesso protegido para a tesouraria.",
  },
  {
    icon: Award,
    title: "Certificados",
    text: "Gere certificados ministeriais personalizados, salvos no sistema e prontos para impressao.",
  },
];

const impactItems = [
  { value: "+120", label: "igrejas organizadas", icon: Users },
  { value: "+8.500", label: "pessoas cadastradas", icon: UserPlus },
  { value: "7 dias", label: "para testar gratis", icon: Sparkles },
  { value: "100%", label: "gestao mais clara", icon: Shield },
];

const plans = [
  {
    name: "Basico",
    subtitle: "Ideal para igrejas pequenas",
    price: "29,90",
    accent: "border-white/10 bg-white/[0.04]",
    badge: "",
    features: [
      "Ate 50 membros",
      "Ate 20 visitantes",
      "Cadastro simples",
      "Dashboard basico",
      "Controle de membros",
      "Relatorios basicos",
    ],
    missing: ["Batismo", "Financeiro avancado", "Certificados", "QR Code"],
  },
  {
    name: "Pastoral",
    subtitle: "O plano mais completo para crescer",
    price: "79,90",
    accent: "border-emerald-400/45 bg-emerald-400/10 shadow-2xl shadow-emerald-500/10",
    badge: "Mais popular",
    features: [
      "Ate 300 membros",
      "Visitantes ilimitados",
      "Discipulado completo",
      "Batismo",
      "Certificados",
      "Financeiro",
      "Dashboard avancado",
      "Relatorios completos",
      "QR Code recepcao",
      "Agenda pastoral",
    ],
    missing: [],
  },
  {
    name: "Soberano",
    subtitle: "Premium para igrejas em expansao",
    price: "149,90",
    accent: "border-amber-300/35 bg-amber-300/10",
    badge: "Premium",
    features: [
      "Membros ilimitados",
      "Multi usuarios",
      "Area pastoral completa",
      "Backup automatico",
      "Certificados premium",
      "API WhatsApp",
      "Painel avancado",
      "Personalizacao visual",
      "Suporte dedicado",
    ],
    missing: [],
  },
];

const showcaseCards = [
  { title: "Dashboard", text: "Indicadores, alertas, graficos e atalhos em uma tela.", icon: BarChart3 },
  { title: "Batismo", text: "Jornada espiritual, agenda, status e certificado.", icon: Droplets },
  { title: "Certificados", text: "Modelos digitais salvos, editaveis e prontos para PDF.", icon: Award },
  { title: "QR Code", text: "Recepcao rapida para cadastro mobile de membros e visitantes.", icon: QrCode },
  { title: "Financeiro", text: "Controle protegido para entradas e relatorios.", icon: Wallet },
  { title: "Dark Mode", text: "Interface moderna para uso diario da equipe pastoral.", icon: Lock },
];

const securityItems = [
  { icon: Lock, title: "Acesso protegido", text: "Areas sensiveis podem ter senha e controle de visualizacao." },
  { icon: Shield, title: "Dados organizados", text: "Informacoes ministeriais salvas de forma clara e acessivel." },
  { icon: Smartphone, title: "Responsivo", text: "Cadastros e consultas tambem funcionam bem no celular." },
  { icon: Sparkles, title: "Sistema rapido", text: "Fluxos simples para a rotina da igreja ficar mais leve." },
];

const faqs = [
  "Posso testar sem cartao?",
  "O sistema funciona no celular?",
  "Consigo emitir certificados?",
  "Tem suporte para WhatsApp?",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [pastorPhoto, setPastorPhoto] = useState(readPastorPhoto);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCard((current) => (current + 1) % showcaseCards.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleSettingsUpdate = () => setPastorPhoto(readPastorPhoto());
    window.addEventListener("crm-settings-updated", handleSettingsUpdate);

    fetchServerSettings()
      .then((response) => {
        const photo = response?.settings?.pastorPhoto;
        if (photo) {
          localStorage.setItem("settings_pastor_photo", photo);
          setPastorPhoto(photo);
        }
      })
      .catch((error) => {
        console.warn("Nao foi possivel carregar a foto do pastor na landing:", error);
      });

    return () => window.removeEventListener("crm-settings-updated", handleSettingsUpdate);
  }, []);

  const goToDashboard = () => navigate("/app/dashboard");

  return (
    <div className="landing-whatsapp min-h-screen bg-[#02050a] text-white overflow-x-hidden">
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 bg-[#02050a]/92 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <a href="#inicio" className="flex items-center gap-3 text-left">
            <span className="logo-led">
              <img src="/logo.png" alt="Bom Samaritano" className="theme-logo-dark h-20 w-20 rounded-xl object-contain" />
              <img src="/logo-profissional.svg" alt="Bom Samaritano" className="theme-logo-professional h-20 w-20 rounded-xl object-contain" />
            </span>
            <span>
              <span className="block text-base font-black text-white">Bom Samaritano</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Gestao Pastoral
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-bold text-zinc-300 transition hover:text-emerald-300">
                {item.label}
              </a>
            ))}
          </div>

          <button
            onClick={goToDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-2.5 text-sm font-black text-emerald-100 transition hover:bg-emerald-400/20"
          >
            <Lock size={16} />
            Acessar
          </button>
        </div>
      </nav>

      <main>
        <section id="inicio" className="relative overflow-hidden px-5 pb-12 pt-32">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
          <div className="absolute right-[-12rem] top-20 h-[34rem] w-[34rem] rounded-full bg-emerald-500/12 blur-[120px]" />
          <div className="absolute left-[-10rem] top-40 h-[28rem] w-[28rem] rounded-full bg-purple-500/10 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-200">
                <Sparkles size={14} />
                Tecnologia ministerial para igrejas modernas
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-6xl">
                A plataforma completa para gestao da sua igreja
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
                Organize membros, visitantes, discipulado, batismo, certificados e financas em um unico sistema moderno e intuitivo.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={goToDashboard}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
                >
                  Testar agora
                  <ArrowRight size={18} />
                </button>
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Ver planos
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3">
                  {[pastorPhoto, "", "", ""].map((photo, index) => (
                    <div key={index} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#02050a] bg-zinc-800 text-xs font-black text-white">
                      {photo ? <img src={photo} alt="Pastor" className="h-full w-full rounded-full object-cover" /> : ["P", "L", "M", "I"][index]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-1 text-amber-300">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Sparkles key={item} size={14} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-zinc-400">7 dias gratis, sem cartao</p>
                </div>
              </div>
            </div>

            <DashboardPreview pastorPhoto={pastorPhoto} goToDashboard={goToDashboard} />
          </div>
        </section>

        <section className="px-5 pb-12">
          <div className="mx-auto grid max-w-7xl gap-4 rounded-2xl border border-emerald-400/25 bg-white/[0.03] p-5 md:grid-cols-4">
            {impactItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 border-white/10 p-3 md:border-r last:border-r-0">
                <item.icon size={36} className="text-emerald-300" />
                <div>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-sm font-bold text-zinc-300">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="px-5 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Recursos</p>
              <h2 className="mt-3 text-4xl font-black text-white">Sua igreja organizada como nunca antes</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                O Bom Samaritano une cuidado espiritual e administracao em uma plataforma preparada para a rotina pastoral.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-emerald-400/10">
                  <feature.icon size={26} className="text-emerald-300" />
                  <h3 className="mt-5 text-base font-black text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="px-5 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Planos</p>
              <h2 className="mt-3 text-4xl font-black text-white">Planos claros para cada fase da igreja</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Comece simples, cresca com organizacao e tenha uma gestao pastoral completa quando precisar.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-2xl border p-6 ${plan.accent}`}>
                  {plan.badge ? (
                    <div className="absolute right-5 top-5 rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-100">
                      {plan.badge}
                    </div>
                  ) : null}
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">{plan.subtitle}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="pb-2 text-sm font-black text-zinc-400">R$</span>
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="pb-2 text-sm font-bold text-zinc-400">/mes</span>
                  </div>
                  <button
                    onClick={goToDashboard}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${
                      plan.name === "Pastoral"
                        ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    Comecar agora
                    <ArrowRight size={16} />
                  </button>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                        <CheckCircle size={16} className="shrink-0 text-emerald-300" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  {plan.missing.length > 0 ? (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      {plan.missing.map((item) => (
                        <div key={item} className="mb-2 flex items-center gap-3 text-sm font-semibold text-zinc-500">
                          <span className="text-rose-300">x</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-10">
          <div className="mx-auto grid max-w-7xl gap-5 rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-zinc-950 via-emerald-950/20 to-zinc-950 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Impacto ministerial</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-white">
                Mais organizacao. Mais acompanhamento. Mais crescimento espiritual.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                A plataforma ajuda o pastor a enxergar pessoas, processos e prioridades com clareza.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Organize", "membros, visitantes e ministerios"],
                ["Acompanhe", "discipulado, batismo e certificados"],
                ["Decida", "com relatorios e indicadores claros"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xl font-black text-emerald-300">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="px-5 py-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Modulos</p>
            <h2 className="mt-3 text-3xl font-black text-white">Veja o que a plataforma entrega no dia a dia</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {showcaseCards.map((card, index) => (
                <button
                  key={card.title}
                  type="button"
                  onMouseEnter={() => setActiveCard(index)}
                  className={`rounded-xl border p-5 text-left transition hover:-translate-y-1 ${
                    activeCard === index ? "border-emerald-400/35 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="mb-4 rounded-lg border border-white/10 bg-[#07101a] p-4">
                    <card.icon size={34} className="text-emerald-300" />
                  </div>
                  <h3 className="text-base font-black text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{card.text}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-10">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
            {securityItems.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <item.icon size={24} className="text-emerald-300" />
                <h3 className="mt-4 text-base font-black text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contato" className="px-5 py-10">
          <div className="mx-auto grid max-w-7xl gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Comece hoje</p>
              <h2 className="mt-3 text-3xl font-black text-white">Sua igreja pode ficar organizada ainda esta semana</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Teste o sistema, explore os modulos e veja como a rotina pastoral fica mais simples.
              </p>
            </div>
            <button onClick={goToDashboard} className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 text-sm font-black text-zinc-950 transition hover:bg-emerald-300">
              Testar gratis por 7 dias
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="px-5 pb-12">
          <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-4">
            {faqs.map((item) => (
              <button key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm font-bold text-zinc-200">
                {item}
                <ChevronDown size={16} className="text-zinc-500" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-white">Bom Samaritano</p>
            <p className="mt-1">Plataforma inteligente para crescimento e gestao ministerial.</p>
          </div>
          <div className="flex flex-wrap gap-5 font-bold">
            <a href="#contato" className="hover:text-emerald-300">WhatsApp</a>
            <a href="#contato" className="hover:text-emerald-300">Instagram</a>
            <a href="#contato" className="hover:text-emerald-300">Suporte</a>
            <a href="#planos" className="hover:text-emerald-300">Planos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview({ pastorPhoto, goToDashboard }: { pastorPhoto: string; goToDashboard: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-400/25 bg-zinc-950/80 p-3 shadow-2xl shadow-emerald-950/30">
      <div className="rounded-xl border border-white/10 bg-[#07101a] p-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-3">
            <Bell size={15} className="text-zinc-500" />
            {pastorPhoto ? (
              <img src={pastorPhoto} alt="Foto do pastor" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-black text-emerald-200">P</span>
            )}
            <div className="hidden sm:block">
              <p className="text-xs font-black text-white">Painel do Pastor</p>
              <p className="text-[10px] text-zinc-500">Administrador</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[11rem_1fr]">
          <aside className="hidden rounded-xl border border-white/10 bg-black/20 p-3 lg:block">
            <div className="mb-4 flex items-center gap-2">
              <img src="/logo.png" alt="Bom Samaritano" className="theme-logo-dark h-9 w-9 rounded-lg object-contain" />
              <img src="/logo-profissional.svg" alt="Bom Samaritano" className="theme-logo-professional h-9 w-9 rounded-lg object-contain" />
              <div>
                <p className="text-xs font-black">Bom Samaritano</p>
                <p className="text-[9px] text-zinc-500">CRM</p>
              </div>
            </div>
            {[
              ["Dashboard", BarChart3],
              ["Membros", Users],
              ["Visitantes", UserPlus],
              ["Discipulado", Heart],
              ["Batismo", Droplets],
              ["Certificados", Award],
              ["Financeiro", Wallet],
            ].map(([label, Icon], index) => (
              <div key={String(label)} className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold ${index === 0 ? "bg-emerald-400/15 text-emerald-200" : "text-zinc-500"}`}>
                <Icon size={13} />
                {label as string}
              </div>
            ))}
          </aside>

          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-black text-white">Dashboard</h2>
              <p className="text-xs text-zinc-500">Visao geral da sua igreja</p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ["Membros", "1,250", "+12%"],
                ["Visitantes", "230", "+8%"],
                ["Batismo", "42", "2026"],
                ["Certificados", "118", "emitidos"],
              ].map(([label, value, meta]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] text-emerald-300">{meta}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_0.72fr]">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="mb-4 text-xs font-black text-white">Crescimento ministerial</p>
                <svg viewBox="0 0 420 160" className="h-40 w-full">
                  <path d="M12 130 L62 118 L112 108 L160 82 L208 90 L252 68 L294 68 L338 42 L408 30" fill="none" stroke="#34d399" strokeWidth="4" />
                  <path d="M12 130 L62 118 L112 108 L160 82 L208 90 L252 68 L294 68 L338 42 L408 30 L408 150 L12 150 Z" fill="rgba(52,211,153,0.12)" />
                  {[40, 80, 120].map((y) => (
                    <line key={y} x1="0" x2="420" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                  ))}
                </svg>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-black text-white">Atividades recentes</p>
                  <span className="text-[10px] font-bold text-emerald-300">Ver todas</span>
                </div>
                {["Novo membro cadastrado", "Candidato ao batismo", "Licao concluida", "Certificado emitido"].map((item) => (
                  <div key={item} className="mb-3 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10">
                      <CheckCircle size={13} className="text-emerald-300" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{item}</p>
                      <p className="text-[10px] text-zinc-500">Hoje, 20:15</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-purple-400/25 bg-purple-400/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-purple-200">Discipulado em destaque</p>
                  <p className="mt-1 text-sm font-bold text-white">Curso: Fundamentos da Fe</p>
                  <div className="mt-3 h-2 w-48 rounded-full bg-white/10">
                    <div className="h-2 w-[65%] rounded-full bg-cyan-300" />
                  </div>
                </div>
                <button onClick={goToDashboard} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-black text-white">
                  Abrir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
