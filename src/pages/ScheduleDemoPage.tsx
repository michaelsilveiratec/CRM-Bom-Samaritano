import { FormEvent, useState } from "react";
import { PageHero, PublicShell } from "./public/PublicShell";

const fields = [
  { id: "fullName", label: "Nome completo", type: "text" },
  { id: "churchName", label: "Nome da igreja", type: "text" },
  { id: "role", label: "Cargo ou função", type: "text" },
  { id: "cityState", label: "Cidade e estado", type: "text" },
  { id: "whatsapp", label: "WhatsApp", type: "tel" },
  { id: "email", label: "E-mail", type: "email" },
  { id: "members", label: "Quantidade aproximada de membros", type: "text" },
  { id: "bestTime", label: "Melhor horário para contato", type: "text" },
];

export default function ScheduleDemoPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Agendar Demonstração"
        title="Veja o CRM Bom Samaritano aplicado à realidade da sua igreja"
        text="Preencha os dados para que a apresentação seja direcionada ao tamanho, rotina e necessidade da sua equipe."
      />

      <section className="landing-section">
        <div className="section-inner">
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-grid">
              {fields.map((field) => (
                <div key={field.id} className="field">
                  <label htmlFor={field.id}>{field.label}</label>
                  <input id={field.id} name={field.id} type={field.type} required />
                </div>
              ))}
              <div className="field full">
                <label htmlFor="need">Principal necessidade da igreja</label>
                <textarea id="need" name="need" required />
              </div>
            </div>

            <button className="primary-action mt-5" type="submit">
              Solicitar minha demonstração
            </button>

            {sent ? (
              <div className="success-message">
                Recebemos sua solicitação. Em breve entraremos em contato para apresentar o CRM Bom Samaritano.
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </PublicShell>
  );
}
