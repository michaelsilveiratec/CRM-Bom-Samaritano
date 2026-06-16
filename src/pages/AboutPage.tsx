import { Heart, Sparkles, Users } from "lucide-react";
import { PageHero, PublicShell } from "./public/PublicShell";

const storyParagraphs = [
  "O CRM Bom Samaritano nasceu após anos observando uma realidade presente em muitas igrejas: pessoas chegando, pessoas saindo, visitantes participando dos cultos e, muitas vezes, não recebendo o acompanhamento necessário.",
  "Ao longo de mais de duas décadas no ministério pastoral, percebi que uma das maiores dificuldades enfrentadas pelas igrejas não está apenas na administração, mas no cuidado contínuo das pessoas.",
  "Foi então que surgiu a visão do CRM Bom Samaritano.",
  "Mais do que um sistema de gestão, ele foi criado para ser um braço do gabinete e do escritório pastoral, auxiliando pastores, líderes e equipes ministeriais no acompanhamento de visitantes, membros, novos convertidos e famílias.",
  "O nome do sistema foi inspirado na parábola do Bom Samaritano, ensinada por Jesus em Lucas 10.",
  "Na história, um homem foi assaltado, ferido e deixado à beira do caminho. Um sacerdote passou por ele. Depois um levita também passou. Ambos viram a necessidade, mas seguiram adiante sem oferecer ajuda.",
  "Entretanto, um samaritano decidiu parar. Ele cuidou das feridas daquele homem, levou-o para um lugar seguro, providenciou recursos para sua recuperação e garantiu que ele continuasse sendo assistido.",
  "Essa atitude revela uma das maiores características do Reino de Deus: o cuidado com as pessoas.",
  "O CRM Bom Samaritano nasceu exatamente com esse propósito.",
  "Acreditamos que nenhuma pessoa deve ser esquecida, nenhum visitante deve passar despercebido e nenhum novo convertido deve caminhar sozinho.",
  "Por isso desenvolvemos uma plataforma que auxilia a igreja a organizar informações, acompanhar pessoas, registrar atendimentos, monitorar visitas, fortalecer relacionamentos e manter um cuidado pastoral mais próximo e eficiente.",
  "Nosso objetivo não é substituir o pastor, os líderes ou o trabalho da igreja.",
  "Nosso objetivo é fornecer uma ferramenta que funcione como uma extensão do gabinete pastoral, ajudando a transformar informações em ações e dados em cuidado.",
  "Porque por trás de cada cadastro existe uma vida.",
  "Por trás de cada relatório existe uma história.",
  "Por trás de cada número existe uma alma que precisa ser cuidada.",
  "Assim como o Bom Samaritano decidiu parar para cuidar de alguém à beira do caminho, acreditamos que a tecnologia também pode ser usada para aproximar pessoas, fortalecer relacionamentos e apoiar a missão que Jesus confiou à Sua Igreja.",
];

export default function AboutPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Sobre"
        title="Uma tecnologia criada para cuidar de pessoas"
        text="Tecnologia a serviço do cuidado pastoral."
      />

      <section className="landing-section">
        <div className="section-inner about-story-layout">
          <article className="glass-card about-story-card">
            <p className="section-kicker">Nossa História</p>
            <h2>Tecnologia a Serviço do Cuidado Pastoral</h2>
            <div className="about-story-text">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="about-signature">
              <strong>CRM Bom Samaritano</strong>
              <span>Cuidando de pessoas através da tecnologia.</span>
            </div>
          </article>

          <div className="about-values-grid">
            {[
              { icon: Heart, title: "Cuidado", text: "Pessoas acompanhadas com mais proximidade e intenção." },
              { icon: Sparkles, title: "Tecnologia", text: "Visual SaaS premium, moderno e preparado para venda." },
              { icon: Users, title: "Organização", text: "Informações pastorais centralizadas para a equipe." },
            ].map((item) => (
              <article key={item.title} className="glass-card">
                <item.icon size={26} className="text-[#DA7B93]" />
                <h2 className="mt-4">{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{aboutStyles}</style>
    </PublicShell>
  );
}

const aboutStyles = `
.page-hero h1 {
  max-width: 56rem;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.06;
}

.about-story-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(19rem, 0.65fr);
  gap: 1.25rem;
  align-items: start;
}

.about-story-card {
  padding: clamp(1.4rem, 3vw, 2.4rem);
}

.about-story-card h2 {
  max-width: 46rem;
}

.about-story-text {
  margin-top: 1.5rem;
  columns: 2 22rem;
  column-gap: 2rem;
}

.about-story-text p {
  break-inside: avoid;
  margin: 0 0 1rem;
  color: rgba(255,255,255,0.72);
  font-size: 0.98rem;
  line-height: 1.82;
}

.about-signature {
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1.2rem;
}

.about-signature strong,
.about-signature span {
  display: block;
}

.about-signature strong {
  font-size: 1.35rem;
  font-weight: 950;
}

.about-signature span {
  margin-top: 0.4rem;
  color: #DA7B93;
  font-weight: 900;
}

.about-values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.about-values-grid .glass-card {
  min-height: auto;
}

.about-values-grid h2 {
  font-size: 1.2rem;
  line-height: 1.2;
}

.about-values-grid p {
  margin-top: 0.7rem;
  font-size: 0.95rem;
  line-height: 1.65;
}

@media (max-width: 1023px) {
  .about-story-layout {
    grid-template-columns: 1fr;
  }

  .about-values-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .about-story-text {
    columns: 1;
  }

  .about-values-grid {
    grid-template-columns: 1fr;
  }
}
`;
