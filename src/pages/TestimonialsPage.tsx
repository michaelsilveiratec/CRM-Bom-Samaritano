import { Star } from "lucide-react";
import { PageHero, PublicShell } from "./public/PublicShell";

const testimonials = [
  {
    initials: "PA",
    photoClass: "portrait-one",
    name: "Pastor André Silva",
    role: "Pastor Presidente",
    church: "Igreja Vida Plena",
    text: "O CRM Bom Samaritano trouxe clareza para acompanhar membros e visitantes. Hoje nossa equipe sabe quem precisa de contato, cuidado e acompanhamento.",
  },
  {
    initials: "LM",
    photoClass: "portrait-two",
    name: "Líder Mariana Costa",
    role: "Líder de Integração",
    church: "Comunidade Nova Aliança",
    text: "A experiência é moderna e simples. A recepção consegue registrar visitantes com mais organização e o acompanhamento ficou muito mais rápido.",
  },
  {
    initials: "JR",
    photoClass: "portrait-three",
    name: "José Roberto",
    role: "Coordenador Administrativo",
    church: "Igreja Esperança",
    text: "Os relatórios ajudam muito nas decisões. A plataforma passa confiança e deixa a gestão da igreja com aparência profissional.",
  },
  {
    initials: "CF",
    photoClass: "portrait-four",
    name: "Camila Fernandes",
    role: "Secretaria Ministerial",
    church: "Ministério Fonte Viva",
    text: "Membros, certificados e comunicação em um só lugar mudaram nossa rotina. O sistema economiza tempo e evita informações perdidas.",
  },
  {
    initials: "PR",
    photoClass: "portrait-five",
    name: "Pr. Rafael Nunes",
    role: "Pastor Auxiliar",
    church: "Igreja Caminho de Paz",
    text: "O visual de SaaS premium ajuda até na apresentação para liderança. É uma solução que transmite tecnologia e cuidado.",
  },
  {
    initials: "TB",
    photoClass: "portrait-six",
    name: "Tatiane Barbosa",
    role: "Líder de Células",
    church: "Igreja Reino e Vida",
    text: "Conseguimos enxergar crescimento, frequência e necessidades com mais facilidade. A equipe se sente mais preparada para servir.",
  },
];

export default function TestimonialsPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Depoimentos"
        title="Igrejas que cuidam melhor quando enxergam melhor"
        text="Testemunhos fictícios para apresentação comercial, com o tom premium e profissional da marca."
      />

      <section className="landing-section">
        <div className="section-inner testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="testimonial-top">
                <div className={`fictional-photo ${item.photoClass}`} aria-label={`Foto fictícia de ${item.name}`}>
                  <span className="photo-face" />
                </div>
                <div className="testimonial-person compact">
                  <strong>{item.name}</strong>
                  <span>
                    {item.role} · {item.church}
                  </span>
                </div>
              </div>
              <div className="stars" aria-label="Avaliação cinco estrelas">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              <blockquote>“{item.text}”</blockquote>
            </article>
          ))}
        </div>
      </section>
      <style>{testimonialStyles}</style>
    </PublicShell>
  );
}

const testimonialStyles = `
.page-hero h1 {
  max-width: 56rem;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.06;
}

.testimonial-top {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: center;
}

.fictional-photo {
  position: relative;
  width: 4.85rem;
  height: 4.85rem;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 1.25rem;
  background:
    radial-gradient(circle at 65% 18%, rgba(255,255,255,0.34), transparent 0.55rem),
    linear-gradient(145deg, rgba(218,123,147,0.95), rgba(124,58,237,0.85) 55%, rgba(37,99,235,0.9));
  box-shadow: 0 18px 34px rgba(0,0,0,0.28), 0 0 28px rgba(124,58,237,0.24);
}

.fictional-photo::before,
.fictional-photo::after,
.photo-face::before,
.photo-face::after {
  content: "";
  position: absolute;
  display: block;
}

.fictional-photo::before {
  left: 50%;
  top: 0.74rem;
  width: 2.25rem;
  height: 2.1rem;
  border-radius: 999px 999px 0.8rem 0.8rem;
  background: rgba(21, 25, 46, 0.84);
  transform: translateX(-50%);
}

.fictional-photo::after {
  left: 50%;
  bottom: -0.35rem;
  width: 4.2rem;
  height: 2.45rem;
  border-radius: 2rem 2rem 0.9rem 0.9rem;
  background: linear-gradient(135deg, rgba(11,17,32,0.9), rgba(37,99,235,0.72));
  transform: translateX(-50%);
}

.photo-face {
  position: absolute;
  left: 50%;
  top: 1.42rem;
  z-index: 2;
  width: 1.78rem;
  height: 1.9rem;
  border-radius: 48% 48% 46% 46%;
  background: linear-gradient(135deg, #f3c7b8, #c98579);
  box-shadow: inset -0.18rem -0.12rem 0 rgba(92, 45, 56, 0.16);
  transform: translateX(-50%);
}

.photo-face::before {
  left: 0.38rem;
  top: 0.7rem;
  width: 0.18rem;
  height: 0.18rem;
  border-radius: 999px;
  background: rgba(17,24,39,0.78);
  box-shadow: 0.66rem 0 0 rgba(17,24,39,0.78);
}

.photo-face::after {
  left: 50%;
  bottom: 0.42rem;
  width: 0.55rem;
  height: 0.18rem;
  border-radius: 999px;
  border-bottom: 2px solid rgba(17,24,39,0.48);
  transform: translateX(-50%);
}

.portrait-two {
  background:
    radial-gradient(circle at 70% 20%, rgba(255,255,255,0.32), transparent 0.55rem),
    linear-gradient(145deg, #DA7B93, #7C3AED 48%, #2563EB);
}

.portrait-two::before,
.portrait-four::before,
.portrait-six::before {
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 999px 999px 1.15rem 1.15rem;
  background: rgba(36, 24, 54, 0.92);
}

.portrait-three {
  background:
    radial-gradient(circle at 66% 18%, rgba(255,255,255,0.28), transparent 0.55rem),
    linear-gradient(145deg, #C76580, #111827 52%, #2563EB);
}

.portrait-three::before,
.portrait-five::before {
  background: rgba(19, 22, 38, 0.9);
}

.portrait-four {
  background:
    radial-gradient(circle at 62% 18%, rgba(255,255,255,0.3), transparent 0.55rem),
    linear-gradient(145deg, #E879A1, #7C3AED 50%, #0B1120);
}

.portrait-five {
  background:
    radial-gradient(circle at 70% 18%, rgba(255,255,255,0.28), transparent 0.55rem),
    linear-gradient(145deg, #7C3AED, #2563EB 54%, #111827);
}

.portrait-six {
  background:
    radial-gradient(circle at 68% 18%, rgba(255,255,255,0.34), transparent 0.55rem),
    linear-gradient(145deg, #DA7B93, #C76580 38%, #2563EB);
}

.testimonial-person.compact {
  margin-top: 0;
}

.testimonial-person.compact span {
  line-height: 1.35;
}

@media (max-width: 430px) {
  .testimonial-top {
    grid-template-columns: 1fr;
  }
}
`;
