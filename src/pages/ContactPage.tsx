import { Mail, MessageCircle, Phone, Shield } from "lucide-react";
import { FormEvent, useState } from "react";
import { ContactActions, PageHero, PublicShell, emailHref, whatsappHref } from "./public/PublicShell";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Contato"
        title="Fale com o CRM Bom Samaritano"
        text="Um canal profissional para interessados, igrejas e líderes que querem conhecer a plataforma."
      >
        <ContactActions />
      </PageHero>

      <section className="landing-section">
        <div className="section-inner contact-grid">
          <div className="contact-info-grid">
            {[
              { icon: MessageCircle, title: "WhatsApp comercial", text: "Atendimento rápido para dúvidas e demonstrações.", href: whatsappHref },
              { icon: Mail, title: "E-mail", text: "Envie uma mensagem com mais detalhes sobre sua igreja.", href: emailHref },
              { icon: Shield, title: "Atendimento profissional", text: "Contato seguro, organizado e focado na necessidade da igreja." },
            ].map((item) => (
              <article key={item.title} className="contact-card">
                <item.icon size={26} className="text-[#DA7B93]" />
                <h2 className="mt-4">{item.title}</h2>
                <p>{item.text}</p>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="secondary-action mt-4">
                    Abrir contato
                    <Phone size={16} />
                  </a>
                ) : null}
              </article>
            ))}
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="contact-name">Nome</label>
                <input id="contact-name" name="name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="contact-email">E-mail</label>
                <input id="contact-email" name="email" type="email" required />
              </div>
              <div className="field full">
                <label htmlFor="contact-subject">Assunto</label>
                <input id="contact-subject" name="subject" type="text" required />
              </div>
              <div className="field full">
                <label htmlFor="contact-message">Mensagem</label>
                <textarea id="contact-message" name="message" required />
              </div>
            </div>
            <button className="primary-action mt-5" type="submit">
              Enviar mensagem
            </button>
            {sent ? <div className="success-message">Mensagem registrada para apresentação visual.</div> : null}
          </form>
        </div>
      </section>
    </PublicShell>
  );
}
