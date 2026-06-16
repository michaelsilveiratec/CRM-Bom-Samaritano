import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  CheckCircle,
  Heart,
  Lock,
  Shield,
  Smartphone,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PrimaryLink, PublicShell, SecondaryLink, SectionHeading } from "./public/PublicShell";

type LandingIcon = typeof Users;

const heroStats = [
  { value: "+1.200", label: "Membros Cadastrados", icon: Users },
  { value: "98%", label: "Taxa de Retenção", icon: BarChart3 },
  { value: "100%", label: "Sistema Online", icon: Sparkles },
];

const metricCards = [
  { label: "Membros", value: "1.250", icon: Users, accent: "#7C3AED" },
  { label: "Visitantes", value: "320", icon: UserPlus, accent: "#22C55E" },
  { label: "Células", value: "48", icon: Heart, accent: "#DA7B93" },
  { label: "Eventos", value: "12", icon: Bell, accent: "#2563EB" },
];

const modules = [
  { label: "Membros", icon: Users, className: "cube-members" },
  { label: "Visitantes", icon: UserPlus, className: "cube-visitors" },
  { label: "Comunicação WhatsApp", icon: Smartphone, className: "cube-whatsapp" },
  { label: "Relatórios Inteligentes", icon: BarChart3, className: "cube-reports" },
  { label: "Certificados Automáticos", icon: Award, className: "cube-certificates" },
  { label: "Financeiro Integrado", icon: Wallet, className: "cube-financial" },
];

const activities = [
  "Novo visitante cadastrado",
  "Novo membro cadastrado",
  "Aniversariante da semana",
  "Novo pedido de oração",
];

const benefits = [
  { title: "Acesso de qualquer lugar", text: "100% online e seguro", icon: Smartphone },
  { title: "Fácil de usar", text: "Interface intuitiva", icon: CheckCircle },
  { title: "Suporte dedicado", text: "Equipe pronta para ajudar", icon: Heart },
  { title: "Atualizações constantes", text: "Sempre evoluindo", icon: Sparkles },
  { title: "Segurança total", text: "Seus dados protegidos", icon: Shield },
];

const resources = [
  "Gestão completa de membros e visitantes",
  "Comunicação pastoral com histórico organizado",
  "Relatórios inteligentes para decisões rápidas",
  "Certificados automáticos e financeiro integrado",
];

export default function LandingPage() {
  return (
    <PublicShell>
      <style>{homeStyles}</style>

      <section className="home-hero">
        <div className="relative z-10 mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="hero-copy fade-in">
            <div className="online-badge">
              <span />
              Sistema 100% Online
            </div>

            <h1>
              O CRM que <span>transforma</span> dados em <span>cuidado pastoral</span>
            </h1>

            <p className="hero-subtitle">
              Organize sua igreja, acompanhe pessoas, fortaleça relacionamentos e tome decisões com base em dados.
            </p>

            <div className="hero-actions">
              <PrimaryLink to="/agendar-demonstracao">Agendar Demonstração</PrimaryLink>
              <SecondaryLink to="/planos">Ver Planos</SecondaryLink>
            </div>

            <div className="hero-stats" aria-label="Indicadores de apresentação">
              {heroStats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>

        <BenefitsBar />
      </section>

      <section className="landing-section">
        <div className="section-inner two-columns">
          <SectionHeading
            eyebrow="Recursos"
            title="Rotina pastoral organizada em uma plataforma premium."
            text="Tudo que a equipe precisa para acompanhar pessoas, visualizar dados e agir com mais clareza."
          />
          <div className="resource-grid">
            {resources.map((item) => (
              <div key={item} className="resource-card">
                <CheckCircle size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-inner cta-band">
          <div>
            <p className="section-kicker">Demonstração</p>
            <h2>Veja como o CRM Bom Samaritano pode organizar o cuidado da sua igreja.</h2>
            <p>Agende uma apresentação e conheça os recursos para membros, visitantes, relatórios, comunicação e acompanhamento pastoral.</p>
          </div>
          <Link to="/agendar-demonstracao" className="primary-action">
            Solicitar demonstração
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual fade-in" aria-label="Dashboard 3D ilustrativo do CRM Bom Samaritano">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <span className="space-node node-one" />
      <span className="space-node node-two" />
      <span className="space-node node-three" />
      <span className="space-node node-four" />

      {modules.map((module) => (
        <FloatingCube key={module.label} {...module} />
      ))}

      <DashboardPanel />
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <span className="mini-logo">
            <Heart size={13} />
          </span>
          <strong>CRM</strong>
          <small>Bom Samaritano</small>
        </div>
        <div className="search-pill">Buscar...</div>
        <div className="topbar-icons">
          <Bell size={14} />
          <Lock size={14} />
          <span />
        </div>
      </div>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          {["Início", "Membros", "Visitantes", "Células", "Comunicação", "Financeiro", "Relatórios"].map((item, index) => (
            <span key={item} className={index === 0 ? "active" : ""}>
              {item}
            </span>
          ))}
        </aside>

        <div className="dashboard-content">
          <div className="dashboard-title">
            <h2>Dashboard</h2>
            <span>Últimos 6 meses</span>
          </div>

          <div className="metrics-grid">
            {metricCards.map((item) => (
              <MetricCard key={item.label} {...item} />
            ))}
          </div>

          <div className="dashboard-lower">
            <div className="chart-card">
              <div className="card-heading">
                <strong>Gráfico de crescimento</strong>
                <span>+24%</span>
              </div>
              <svg viewBox="0 0 420 190" role="img" aria-label="Gráfico fake de crescimento">
                <defs>
                  <linearGradient id="chartGradientHome" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path
                  d="M18 154 C66 108 86 92 124 103 C154 112 174 72 214 76 C252 80 266 48 302 53 C342 59 356 28 402 18"
                  fill="none"
                  stroke="#DA7B93"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
                <path
                  d="M18 154 C66 108 86 92 124 103 C154 112 174 72 214 76 C252 80 266 48 302 53 C342 59 356 28 402 18 L402 180 L18 180 Z"
                  fill="url(#chartGradientHome)"
                />
                {[44, 88, 132].map((y) => (
                  <line key={y} x1="0" x2="420" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
                ))}
              </svg>
            </div>

            <div className="activity-card">
              <div className="card-heading">
                <strong>Atividades recentes</strong>
                <span>Agora</span>
              </div>
              {activities.map((activity, index) => (
                <div key={activity} className="activity-row">
                  <span>{index + 1}</span>
                  <p>{activity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LandingIcon; accent: string }) {
  return (
    <div className="metric-card" style={{ "--accent": accent } as CSSProperties}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Icon size={18} />
    </div>
  );
}

function FloatingCube({ label, icon: Icon, className }: { label: string; icon: LandingIcon; className: string }) {
  return (
    <div className={`floating-cube ${className}`}>
      <div className="cube-face">
        <Icon size={32} />
        <strong>{label}</strong>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: LandingIcon }) {
  return (
    <div className="stat-card">
      <span>
        <Icon size={21} />
      </span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function BenefitsBar() {
  return (
    <div className="benefits-bar">
      {benefits.map((item) => (
        <article key={item.title} className="benefit-item">
          <span>
            <item.icon size={22} />
          </span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

const homeStyles = `
.home-hero {
  position: relative;
  min-height: 100vh;
  padding: 8.3rem 1.25rem 2rem;
}

.hero-copy {
  max-width: 43rem;
}

.hero-subtitle {
  margin: 1.7rem 0 0;
  max-width: 34rem;
  font-size: clamp(1rem, 1.5vw, 1.28rem);
}

.hero-actions {
  margin-top: 2.25rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
  margin-top: 3.1rem;
  max-width: 39rem;
}

.stat-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 0.8rem;
  align-items: center;
}

.stat-card span {
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 3.35rem;
  height: 3.35rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.9rem;
  color: #DA7B93;
  background: rgba(124,58,237,0.2);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 0 26px rgba(124,58,237,0.18);
}

.stat-card strong {
  font-size: 1.25rem;
  font-weight: 950;
}

.stat-card small {
  color: rgba(255,255,255,0.6);
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1.2;
}

.hero-visual {
  position: relative;
  min-height: 44rem;
  perspective: 1500px;
  transform-style: preserve-3d;
}

.dashboard-shell {
  position: absolute;
  left: 8%;
  top: 19%;
  z-index: 3;
  width: min(45rem, 86vw);
  min-height: 29rem;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 1.75rem;
  padding: 1.15rem;
  background: linear-gradient(145deg, rgba(17,24,39,0.94), rgba(5,8,22,0.94) 48%, rgba(31,18,62,0.94));
  box-shadow: 0 32px 100px rgba(0,0,0,0.52), 0 0 0 1px rgba(218,123,147,0.1), 0 0 70px rgba(124,58,237,0.3);
  transform: rotateX(7deg) rotateY(-13deg) rotateZ(2deg);
  transform-origin: center;
  animation: dashboardFloat 7s ease-in-out infinite;
  backdrop-filter: blur(18px);
}

.dashboard-shell::before {
  content: "";
  position: absolute;
  inset: -1px;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(218,123,147,0.45), rgba(124,58,237,0.05), rgba(37,99,235,0.42));
  filter: blur(18px);
  opacity: 0.52;
}

.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dashboard-topbar > div:first-child {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 8.2rem;
}

.mini-logo {
  display: grid;
  place-items: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 0.42rem;
  color: #fff;
  background: linear-gradient(135deg, #DA7B93, #7C3AED);
}

.dashboard-topbar strong {
  font-size: 0.82rem;
  font-weight: 950;
}

.dashboard-topbar small {
  color: rgba(255,255,255,0.52);
  font-size: 0.62rem;
  font-weight: 800;
}

.search-pill {
  flex: 1;
  max-width: 11rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 0.48rem 0.8rem;
  color: rgba(255,255,255,0.38);
  font-size: 0.72rem;
  background: rgba(255,255,255,0.04);
}

.topbar-icons {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255,255,255,0.55);
}

.topbar-icons span {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #DA7B93, #2563EB);
  box-shadow: 0 0 18px rgba(218,123,147,0.4);
}

.dashboard-body {
  display: grid;
  grid-template-columns: 7.8rem 1fr;
  gap: 1rem;
}

.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 1rem;
  padding: 0.7rem;
  background: rgba(0,0,0,0.18);
}

.dashboard-sidebar span {
  border-radius: 0.65rem;
  padding: 0.58rem 0.7rem;
  color: rgba(255,255,255,0.42);
  font-size: 0.67rem;
  font-weight: 850;
}

.dashboard-sidebar span.active {
  color: #fff;
  background: rgba(124,58,237,0.32);
}

.dashboard-content {
  min-width: 0;
}

.dashboard-title,
.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-title {
  margin-bottom: 0.8rem;
}

.dashboard-title h2 {
  margin: 0;
  font-size: 1.38rem;
  font-weight: 950;
}

.dashboard-title span,
.card-heading span {
  color: rgba(255,255,255,0.52);
  font-size: 0.65rem;
  font-weight: 800;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.72rem;
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 5.3rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.9rem;
  padding: 0.85rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
}

.metric-card span {
  display: block;
  color: rgba(255,255,255,0.66);
  font-size: 0.68rem;
  font-weight: 850;
}

.metric-card strong {
  display: block;
  margin-top: 0.45rem;
  font-size: 1.35rem;
  font-weight: 950;
}

.metric-card svg {
  color: var(--accent);
  filter: drop-shadow(0 0 12px var(--accent));
}

.dashboard-lower {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.chart-card,
.activity-card {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.95rem;
  padding: 0.9rem;
  background: rgba(255,255,255,0.045);
}

.card-heading {
  margin-bottom: 0.65rem;
}

.card-heading strong {
  font-size: 0.82rem;
  font-weight: 950;
}

.chart-card svg {
  width: 100%;
  height: 10.5rem;
  display: block;
}

.activity-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.58rem;
  border-radius: 0.7rem;
  padding: 0.55rem;
  background: rgba(255,255,255,0.04);
}

.activity-row span {
  display: grid;
  place-items: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 950;
  background: linear-gradient(135deg, #7C3AED, #DA7B93);
}

.activity-row p {
  margin: 0;
  color: rgba(255,255,255,0.75);
  font-size: 0.72rem;
  font-weight: 800;
}

.orbit {
  position: absolute;
  left: 4%;
  top: 10%;
  width: 50rem;
  height: 26rem;
  border: 1px solid rgba(218,123,147,0.42);
  border-radius: 999px;
  transform: rotateZ(-9deg) rotateX(58deg);
  box-shadow: 0 0 32px rgba(218,123,147,0.28), inset 0 0 24px rgba(124,58,237,0.2);
  animation: orbitPulse 5s ease-in-out infinite;
}

.orbit-two {
  left: 1%;
  top: 24%;
  width: 56rem;
  height: 29rem;
  border-color: rgba(124,58,237,0.46);
  animation-delay: -1.2s;
}

.orbit-three {
  left: 16%;
  top: 34%;
  width: 36rem;
  height: 18rem;
  border-color: rgba(37,99,235,0.48);
  animation-delay: -2.1s;
}

.space-node {
  position: absolute;
  z-index: 2;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff, #DA7B93 32%, #7C3AED 72%);
  box-shadow: 0 0 28px rgba(218,123,147,0.85);
  animation: nodeFloat 4.4s ease-in-out infinite;
}

.node-one { right: 5%; top: 34%; width: 3.2rem; height: 3.2rem; }
.node-two { left: 8%; top: 52%; width: 2.7rem; height: 2.7rem; animation-delay: -1.4s; }
.node-three { right: 13%; bottom: 18%; width: 2.1rem; height: 2.1rem; animation-delay: -2.6s; }
.node-four { left: 58%; top: 17%; width: 1.4rem; height: 1.4rem; animation-delay: -3.2s; }

.floating-cube {
  position: absolute;
  z-index: 5;
  width: 9rem;
  height: 9rem;
  transform-style: preserve-3d;
  animation: cubeFloat 6s ease-in-out infinite;
}

.cube-face {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 1.35rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.19), rgba(124,58,237,0.2));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 22px 54px rgba(0,0,0,0.28), 0 0 30px rgba(124,58,237,0.38);
  backdrop-filter: blur(18px);
  transform: rotateX(8deg) rotateY(-17deg);
}

.cube-face::after {
  content: "";
  position: absolute;
  inset: auto 0 0 auto;
  width: 48%;
  height: 48%;
  border-bottom-right-radius: inherit;
  border-left: 1px solid rgba(255,255,255,0.14);
  border-top: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
}

.cube-face strong {
  width: min-content;
  min-width: 6rem;
  font-size: 0.88rem;
  font-weight: 950;
  line-height: 1.15;
}

.cube-members { left: 11%; top: 1%; }
.cube-visitors { right: 17%; top: 1%; animation-delay: -1s; }
.cube-whatsapp { right: -1%; top: 43%; animation-delay: -2s; }
.cube-reports { left: 4%; bottom: 10%; animation-delay: -2.8s; }
.cube-certificates { left: 40%; bottom: 7%; animation-delay: -3.6s; }
.cube-financial { right: 14%; bottom: 1%; animation-delay: -4.3s; }

.cube-visitors .cube-face { background: linear-gradient(145deg, rgba(50,213,131,0.3), rgba(17,24,39,0.34)); }
.cube-whatsapp .cube-face { background: linear-gradient(145deg, rgba(218,123,147,0.48), rgba(124,58,237,0.26)); }
.cube-reports .cube-face,
.cube-financial .cube-face { background: linear-gradient(145deg, rgba(37,99,235,0.46), rgba(124,58,237,0.28)); }
.cube-certificates .cube-face { background: linear-gradient(145deg, rgba(218,123,147,0.36), rgba(245,158,11,0.34)); }

.benefits-bar {
  position: relative;
  z-index: 12;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  max-width: 1320px;
  margin: 2.2rem auto 0;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.25rem;
  background: rgba(17,24,39,0.58);
  box-shadow: 0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
  backdrop-filter: blur(22px);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 6rem;
  border-right: 1px solid rgba(255,255,255,0.08);
  padding: 1.2rem 1.45rem;
}

.benefit-item:last-child { border-right: 0; }

.benefit-item > span {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  border: 1px solid rgba(218,123,147,0.28);
  border-radius: 0.85rem;
  color: #DA7B93;
  background: rgba(124,58,237,0.14);
  box-shadow: 0 0 22px rgba(124,58,237,0.2);
}

.benefit-item h3,
.benefit-item p {
  margin: 0;
}

.benefit-item h3 {
  font-size: 0.92rem;
  font-weight: 950;
}

.benefit-item p {
  margin-top: 0.25rem;
  color: rgba(255,255,255,0.58);
  font-size: 0.8rem;
  font-weight: 700;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.resource-card {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  min-height: 5rem;
  padding: 1.2rem;
  color: rgba(255,255,255,0.82);
  font-weight: 850;
}

.resource-card svg {
  color: #DA7B93;
  flex: 0 0 auto;
}

.cta-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.35rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(218,123,147,0.16), rgba(124,58,237,0.12)), rgba(17,24,39,0.56);
  backdrop-filter: blur(18px);
}

.cta-band p:not(.section-kicker) {
  margin: 1rem 0 0;
  color: rgba(255,255,255,0.66);
}

@keyframes dashboardFloat {
  0%, 100% { transform: rotateX(7deg) rotateY(-13deg) rotateZ(2deg) translate3d(0, 0, 0); }
  50% { transform: rotateX(7deg) rotateY(-13deg) rotateZ(2deg) translate3d(0, -14px, 0); }
}

@keyframes cubeFloat {
  0%, 100% { transform: translate3d(0, 0, 58px) rotateZ(0deg); }
  50% { transform: translate3d(0, -18px, 72px) rotateZ(2deg); }
}

@keyframes orbitPulse {
  0%, 100% { opacity: 0.48; filter: brightness(1); }
  50% { opacity: 0.9; filter: brightness(1.35); }
}

@media (max-width: 1279px) {
  .hero-visual { min-height: 39rem; }
  .dashboard-shell { left: 5%; width: min(42rem, 88vw); }
  .floating-cube { width: 7.6rem; height: 7.6rem; }
  .cube-financial { right: 5%; }
  .benefits-bar { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .benefit-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
}

@media (max-width: 1023px) {
  .hero-copy { max-width: 100%; }
  .hero-visual { order: 2; min-height: 43rem; }
  .dashboard-shell {
    left: 50%;
    top: 20%;
    transform: translateX(-50%) rotateX(7deg) rotateY(-8deg) rotateZ(1deg);
    animation: dashboardFloatTablet 7s ease-in-out infinite;
  }
  .orbit {
    left: 50%;
    transform: translateX(-50%) rotateZ(-8deg) rotateX(58deg);
  }
  .cta-band {
    align-items: stretch;
    flex-direction: column;
  }
}

@keyframes dashboardFloatTablet {
  0%, 100% { transform: translateX(-50%) rotateX(7deg) rotateY(-8deg) rotateZ(1deg) translateY(0); }
  50% { transform: translateX(-50%) rotateX(7deg) rotateY(-8deg) rotateZ(1deg) translateY(-14px); }
}

@media (max-width: 767px) {
  .home-hero { padding-top: 7.4rem; }
  .hero-stats { grid-template-columns: 1fr; max-width: 100%; }
  .stat-card {
    grid-template-columns: auto auto 1fr;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 1rem;
    padding: 0.8rem;
    background: rgba(255,255,255,0.04);
  }
  .stat-card span { grid-row: auto; }
  .hero-visual {
    min-height: 43rem;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }
  .dashboard-shell {
    top: 20%;
    width: min(34rem, 96vw);
    min-height: auto;
    padding: 0.8rem;
    border-radius: 1.2rem;
  }
  .dashboard-body { grid-template-columns: 1fr; }
  .dashboard-sidebar,
  .search-pill { display: none; }
  .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-lower { grid-template-columns: 1fr; }
  .chart-card svg { height: 8.5rem; }
  .floating-cube { width: 6.4rem; height: 6.4rem; }
  .cube-face strong { min-width: 4.6rem; font-size: 0.68rem; }
  .cube-members { left: 1%; top: 2%; }
  .cube-visitors { right: 2%; top: 5%; }
  .cube-whatsapp { right: 0%; top: 44%; }
  .cube-reports { left: 0%; bottom: 13%; }
  .cube-certificates { left: 36%; bottom: 5%; }
  .cube-financial { right: 2%; bottom: 13%; }
  .orbit { width: 36rem; height: 20rem; }
  .benefits-bar { grid-template-columns: 1fr; margin-top: 1.4rem; }
  .benefit-item {
    min-height: 5.2rem;
    border-right: 0;
  }
  .resource-grid { grid-template-columns: 1fr; }
}

@media (max-width: 430px) {
  .topbar-icons svg { display: none; }
  .metric-card { min-height: 4.7rem; padding: 0.7rem; }
  .metric-card strong { font-size: 1.08rem; }
  .metric-card span,
  .activity-row p { font-size: 0.64rem; }
  .dashboard-title h2 { font-size: 1.1rem; }
}
`;
