import { CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHero, PublicShell, SectionHeading } from "./public/PublicShell";

const plans = [
  {
    name: "Básico",
    price: "29,90",
    description: "Para igrejas que estão começando a centralizar cadastros, contatos e informações essenciais.",
    cta: "Começar com o Básico",
    features: [
      "Cadastro de membros",
      "Cadastro de visitantes",
      "Dashboard inicial",
      "Relatórios simples",
      "Acesso online",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Pastoral",
    price: "79,90",
    description: "Para equipes que precisam acompanhar pessoas, comunicar melhor e enxergar indicadores com clareza.",
    cta: "Conhecer o Pastoral",
    featured: true,
    features: [
      "Recursos essenciais inclusos",
      "Células e grupos",
      "Comunicação WhatsApp",
      "Relatórios inteligentes",
      "Certificados automáticos",
      "Suporte dedicado",
    ],
  },
  {
    name: "Soberano",
    price: "149,90",
    description: "Para igrejas em expansão que buscam controle avançado, visão estratégica e suporte prioritário.",
    cta: "Avançar com o Soberano",
    features: [
      "Recursos pastorais inclusos",
      "Financeiro integrado",
      "Usuários administrativos",
      "Painéis avançados",
      "Prioridade no suporte",
      "Evoluções personalizadas",
    ],
  },
];

export default function PlansPage() {
  return (
    <PublicShell>
      <style>{planStyles}</style>
      <PageHero
        eyebrow="Opções comerciais"
        title="Escolha a estrutura ideal para a fase da sua igreja"
        text="Três caminhos claros para apresentar valor, gerar confiança e conduzir o interessado até a demonstração."
      />

      <section className="landing-section">
        <div className="section-inner">
          <SectionHeading
            eyebrow="Comparativo"
            title="Soluções para diferentes momentos da gestão pastoral"
            text="Comece com o essencial, evolua para uma operação completa ou avance para uma estrutura premium."
          />

          <div className="plan-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`plan-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured ? <span className="plan-badge">Mais indicado</span> : null}
                <Sparkles size={24} className="text-[#DA7B93]" />
                <h2 className="mt-5">{plan.name}</h2>
                <div className="plan-price">
                  <span>R$</span>
                  <strong>{plan.price}</strong>
                  <small>/mês</small>
                </div>
                <p>{plan.description}</p>
                <ul className="feature-list">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle size={17} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/agendar-demonstracao" className={plan.featured ? "primary-action" : "secondary-action"}>
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

const planStyles = `
.page-hero h1 {
  max-width: 56rem;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.06;
}

.plan-price {
  display: flex;
  align-items: flex-end;
  gap: 0.28rem;
  margin-top: 1rem;
}

.plan-price span,
.plan-price small {
  color: rgba(255,255,255,0.58);
  font-weight: 900;
}

.plan-price span {
  padding-bottom: 0.5rem;
  font-size: 0.95rem;
}

.plan-price strong {
  color: #fff;
  font-size: 2.75rem;
  font-weight: 950;
  line-height: 0.9;
}

.plan-price small {
  padding-bottom: 0.45rem;
  font-size: 0.86rem;
}
`;
