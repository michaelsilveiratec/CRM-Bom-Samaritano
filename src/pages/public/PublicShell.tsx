import { Link, NavLink } from "react-router-dom";
import { ArrowRight, Heart, Lock, Mail, Phone, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export const whatsappHref =
  "https://wa.me/5511993470407?text=Ol%C3%A1%2C%20quero%20conhecer%20o%20CRM%20Bom%20Samaritano.";
export const emailHref = "mailto:crmbomsamaritano@gmail.com";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Planos", to: "/planos" },
  { label: "Depoimentos", to: "/depoimentos" },
  { label: "Sobre", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <main className="space-landing min-h-screen overflow-hidden bg-[#050816] text-white">
      <style>{publicStyles}</style>
      <SpaceBackground />
      <PublicHeader />
      <div className="relative z-10">{children}</div>
      <PublicFooter />
    </main>
  );
}

export function SpaceBackground() {
  return (
    <div className="public-bg" aria-hidden="true">
      <div className="space-field" />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />
      <span className="soft-sphere sphere-a" />
      <span className="soft-sphere sphere-b" />
      <span className="soft-sphere sphere-c" />
    </div>
  );
}

export function PublicHeader() {
  return (
    <header className="landing-header">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <Link to="/" className="brand-lockup" aria-label="CRM Bom Samaritano">
          <span className="brand-mark">
            <Heart size={26} />
          </span>
          <span>
            <strong>CRM</strong>
            <small>Bom Samaritano</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Menu principal">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/app/dashboard" className="header-login">
            <Lock size={15} />
            Entrar
          </Link>
          <Link to="/agendar-demonstracao" className="header-action">
            Agendar Demonstração
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand-lockup" aria-label="CRM Bom Samaritano">
            <span className="brand-mark">
              <Heart size={24} />
            </span>
            <span>
              <strong>CRM</strong>
              <small>Bom Samaritano</small>
            </span>
          </Link>
          <p>Tecnologia a serviço do cuidado pastoral.</p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Navegação</h3>
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Legal</h3>
            <Link to="/privacidade">Política de Privacidade</Link>
            <Link to="/termos-de-uso">Termos de Uso</Link>
          </div>
          <div>
            <h3>Contato</h3>
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={emailHref}>E-mail</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© 2026 CRM Bom Samaritano. Todos os direitos reservados.</div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="section-inner center-section fade-in">
        <div className="online-badge">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{text}</p>
        {children ? <div className="page-hero-actions">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="section-heading">
      <p className="section-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="primary-action">
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}

export function SecondaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="secondary-action">
      {children}
      <Sparkles size={18} />
    </Link>
  );
}

export function ContactActions() {
  return (
    <div className="contact-actions">
      <a href={whatsappHref} target="_blank" rel="noreferrer" className="primary-action">
        Falar pelo WhatsApp
        <Phone size={18} />
      </a>
      <a href={emailHref} className="secondary-action">
        Enviar E-mail
        <Mail size={18} />
      </a>
    </div>
  );
}

export const publicStyles = `
.space-landing {
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at 84% 18%, rgba(218, 123, 147, 0.18), transparent 28rem),
    radial-gradient(circle at 57% 56%, rgba(124, 58, 237, 0.22), transparent 32rem),
    radial-gradient(circle at 31% 94%, rgba(37, 99, 235, 0.18), transparent 30rem),
    linear-gradient(135deg, #050816 0%, #0B1120 48%, #050816 100%);
}

.space-landing * { box-sizing: border-box; }
.space-landing a { text-decoration: none; }

.public-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.space-field {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.8) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(218,123,147,0.75) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(37,99,235,0.65) 0 1px, transparent 1.5px);
  background-position: 0 0, 50px 90px, 120px 40px;
  background-size: 180px 180px, 240px 240px, 310px 310px;
  opacity: 0.34;
}

.aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(72px);
  opacity: 0.48;
}

.aurora-one { right: -12rem; top: 4rem; width: 34rem; height: 34rem; background: rgba(218,123,147,0.28); }
.aurora-two { left: 28%; bottom: -14rem; width: 45rem; height: 25rem; background: rgba(124,58,237,0.34); }
.aurora-three { left: -12rem; top: 20rem; width: 30rem; height: 30rem; background: rgba(37,99,235,0.2); }

.soft-sphere {
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fff, #DA7B93 32%, #7C3AED 72%);
  box-shadow: 0 0 32px rgba(218,123,147,0.68);
  animation: nodeFloat 4.8s ease-in-out infinite;
}

.sphere-a { right: 7%; top: 33%; width: 3rem; height: 3rem; }
.sphere-b { left: 9%; top: 58%; width: 2.3rem; height: 2.3rem; animation-delay: -1.4s; }
.sphere-c { right: 16%; bottom: 12%; width: 1.5rem; height: 1.5rem; animation-delay: -2.2s; }

.landing-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(5,8,22,0.52);
  backdrop-filter: blur(22px);
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  color: #fff;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 3.15rem;
  height: 3.15rem;
  border: 1px solid rgba(218,123,147,0.55);
  border-radius: 1rem;
  color: #fff;
  background: linear-gradient(135deg, rgba(218,123,147,0.95), rgba(124,58,237,0.95) 52%, rgba(37,99,235,0.9));
  box-shadow: 0 0 28px rgba(218,123,147,0.34);
}

.brand-lockup strong,
.brand-lockup small {
  display: block;
  line-height: 1;
}

.brand-lockup strong {
  font-size: 1.25rem;
  font-weight: 900;
}

.brand-lockup small {
  margin-top: 0.22rem;
  color: rgba(255,255,255,0.82);
  font-size: 0.92rem;
  font-weight: 700;
}

.landing-header nav a {
  color: rgba(255,255,255,0.72);
  font-size: 0.94rem;
  font-weight: 850;
  transition: color 180ms ease, text-shadow 180ms ease;
}

.landing-header nav a:hover,
.landing-header nav a.active {
  color: #fff;
  text-shadow: 0 0 18px rgba(218,123,147,0.7);
}

.header-actions,
.contact-actions,
.page-hero-actions,
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
}

.header-login,
.header-action,
.primary-action,
.secondary-action,
.system-action {
  display: inline-flex;
  min-height: 3.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.62rem;
  border-radius: 1rem;
  padding: 0.9rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 900;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.header-login,
.secondary-action,
.system-action {
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.9);
  background: rgba(17,24,39,0.5);
  backdrop-filter: blur(16px);
}

.header-action,
.primary-action {
  color: #fff;
  background: linear-gradient(135deg, #DA7B93 0%, #C76580 36%, #7C3AED 100%);
  box-shadow: 0 18px 42px rgba(218,123,147,0.24), 0 0 32px rgba(124,58,237,0.34);
}

.primary-action,
.secondary-action,
.system-action {
  min-height: 3.85rem;
  padding: 1rem 1.55rem;
}

.system-action {
  border-color: rgba(218,123,147,0.26);
  background: linear-gradient(135deg, rgba(218,123,147,0.16), rgba(37,99,235,0.14));
}

.header-login:hover,
.header-action:hover,
.primary-action:hover,
.secondary-action:hover,
.system-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 46px rgba(124,58,237,0.32);
}

.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  padding: 0.58rem 0.95rem;
  color: rgba(255,255,255,0.88);
  font-size: 0.84rem;
  font-weight: 850;
  background: rgba(17,24,39,0.62);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 0 32px rgba(124,58,237,0.16);
  backdrop-filter: blur(16px);
}

.online-badge span {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: #4ADE80;
  box-shadow: 0 0 16px #4ADE80;
  animation: pulseGlow 1.9s ease-in-out infinite;
}

.page-hero {
  padding: 10rem 1.25rem 4.5rem;
}

.section-inner {
  max-width: 1320px;
  margin: 0 auto;
}

.center-section {
  text-align: center;
}

.page-hero h1,
.hero-copy h1 {
  margin: 1.4rem auto 0;
  max-width: 62rem;
  color: #fff;
  font-size: clamp(3rem, 7vw, 6.5rem);
  font-weight: 950;
  line-height: 0.99;
}

.hero-copy h1 {
  margin-left: 0;
  max-width: 42rem;
}

.page-hero h1 span,
.hero-copy h1 span,
.gradient-text {
  background: linear-gradient(90deg, #DA7B93 0%, #C76580 28%, #A855F7 66%, #7C3AED 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-hero p,
.hero-subtitle,
.section-heading p,
.glass-card p,
.section-copy {
  color: rgba(255,255,255,0.68);
  line-height: 1.8;
}

.page-hero p {
  max-width: 48rem;
  margin: 1.45rem auto 0;
  font-size: 1.08rem;
}

.page-hero-actions {
  justify-content: center;
  margin-top: 2rem;
}

.landing-section {
  position: relative;
  padding: 4.5rem 1.25rem;
}

.section-heading {
  max-width: 56rem;
  margin-bottom: 2rem;
}

.section-heading.center {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.section-kicker {
  margin: 0 0 0.85rem;
  color: #DA7B93;
  font-size: 0.78rem;
  font-weight: 950;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-heading h2,
.landing-section h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 950;
  line-height: 1.06;
}

.section-heading p {
  margin: 1rem 0 0;
  font-size: 1rem;
}

.glass-card,
.resource-card,
.testimonial-card,
.plan-card,
.contact-card,
.form-card {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.15rem;
  background: linear-gradient(145deg, rgba(17,24,39,0.72), rgba(17,24,39,0.38));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 22px 60px rgba(0,0,0,0.22);
  backdrop-filter: blur(16px);
}

.glass-card {
  padding: 1.45rem;
}

.two-columns {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 2rem;
  align-items: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.plan-card {
  position: relative;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 1.65rem;
}

.plan-card.featured {
  border-color: rgba(218,123,147,0.32);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 0 46px rgba(124,58,237,0.22);
}

.plan-badge {
  position: absolute;
  right: 1rem;
  top: 1rem;
  border: 1px solid rgba(218,123,147,0.32);
  border-radius: 999px;
  padding: 0.38rem 0.72rem;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 950;
  background: rgba(218,123,147,0.16);
}

.plan-card h2,
.testimonial-card h2,
.glass-card h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 950;
}

.plan-card p {
  margin: 0.9rem 0 1.2rem;
  color: rgba(255,255,255,0.66);
  line-height: 1.7;
}

.feature-list {
  display: grid;
  gap: 0.8rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
}

.feature-list li {
  display: flex;
  gap: 0.65rem;
  color: rgba(255,255,255,0.82);
  font-size: 0.92rem;
  font-weight: 750;
}

.feature-list svg {
  flex: 0 0 auto;
  color: #DA7B93;
}

.plan-card .primary-action,
.plan-card .secondary-action {
  margin-top: auto;
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.testimonial-card {
  padding: 1.45rem;
}

.avatar {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 950;
  background: linear-gradient(135deg, #DA7B93, #7C3AED 54%, #2563EB);
  box-shadow: 0 0 28px rgba(124,58,237,0.28);
}

.stars {
  display: flex;
  gap: 0.18rem;
  margin: 1rem 0;
  color: #DA7B93;
}

.testimonial-card blockquote {
  margin: 0;
  color: rgba(255,255,255,0.72);
  line-height: 1.72;
}

.testimonial-person {
  margin-top: 1.15rem;
}

.testimonial-person strong,
.testimonial-person span {
  display: block;
}

.testimonial-person strong {
  font-weight: 950;
}

.testimonial-person span {
  margin-top: 0.2rem;
  color: rgba(255,255,255,0.55);
  font-size: 0.82rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 1.25rem;
  align-items: start;
}

.contact-card,
.form-card {
  padding: 1.5rem;
}

.contact-info-grid {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field.full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: 0.45rem;
  color: rgba(255,255,255,0.76);
  font-size: 0.84rem;
  font-weight: 850;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  min-height: 3.2rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.85rem;
  padding: 0.85rem 0.95rem;
  color: #fff;
  outline: none;
  background: rgba(5,8,22,0.58);
}

.field textarea {
  min-height: 7rem;
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: rgba(218,123,147,0.5);
  box-shadow: 0 0 0 3px rgba(218,123,147,0.12);
}

.success-message {
  margin-top: 1rem;
  border: 1px solid rgba(74,222,128,0.28);
  border-radius: 1rem;
  padding: 1rem;
  color: #dcfce7;
  background: rgba(34,197,94,0.12);
}

.public-footer {
  position: relative;
  z-index: 10;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 3rem 1.25rem 1.4rem;
  background: rgba(5,8,22,0.78);
  backdrop-filter: blur(18px);
}

.footer-inner {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 2rem;
  max-width: 1320px;
  margin: 0 auto;
}

.footer-brand p {
  max-width: 23rem;
  margin: 1rem 0 0;
  color: rgba(255,255,255,0.62);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.footer-links h3 {
  margin: 0 0 0.8rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 950;
}

.footer-links a {
  display: block;
  margin-top: 0.55rem;
  color: rgba(255,255,255,0.62);
  font-size: 0.88rem;
  font-weight: 750;
}

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  max-width: 1320px;
  margin: 2rem auto 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 1.2rem;
  color: rgba(255,255,255,0.52);
  font-size: 0.85rem;
  text-align: center;
}

.fade-in {
  animation: fadeInUp 760ms ease both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes nodeFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-16px) scale(1.06); }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.65; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.28); }
}

@media (max-width: 1023px) {
  .header-actions { gap: 0.5rem; }
  .header-login,
  .header-action {
    min-height: 2.8rem;
    padding: 0.72rem 1rem;
    font-size: 0.82rem;
  }
  .two-columns,
  .contact-grid,
  .footer-inner {
    grid-template-columns: 1fr;
  }
  .plan-grid,
  .testimonial-grid,
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .brand-mark {
    width: 2.65rem;
    height: 2.65rem;
    border-radius: 0.85rem;
  }
  .brand-lockup strong { font-size: 1.03rem; }
  .brand-lockup small { font-size: 0.74rem; }
  .header-login { display: none; }
  .header-action {
    max-width: 8.5rem;
    min-height: 2.7rem;
    padding: 0.65rem 0.8rem;
    font-size: 0.72rem;
    line-height: 1.15;
    text-align: center;
  }
  .page-hero {
    padding-top: 7.6rem;
    padding-bottom: 3rem;
  }
  .page-hero h1,
  .hero-copy h1 {
    font-size: clamp(2.65rem, 12vw, 4.15rem);
  }
  .page-hero-actions,
  .hero-actions,
  .primary-action,
  .secondary-action,
  .system-action,
  .contact-actions {
    width: 100%;
  }
  .form-grid,
  .footer-links {
    grid-template-columns: 1fr;
  }
}
`;
