import { PageHero, PublicShell } from "./public/PublicShell";

export default function TermsPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Termos de Uso"
        title="Condições de uso do CRM Bom Samaritano"
        text="Página institucional provisória para manter os links legais do rodapé completos."
      />
      <section className="landing-section">
        <div className="section-inner glass-card">
          <p className="section-copy">
            Este espaço pode receber os termos oficiais do serviço, condições comerciais, responsabilidades, suporte,
            privacidade operacional e regras de uso da plataforma.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
