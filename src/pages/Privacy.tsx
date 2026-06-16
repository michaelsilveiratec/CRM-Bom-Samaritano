import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Database,
  FileText,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const collectedData = [
  "Nome completo, telefone, WhatsApp e e-mail",
  "Endereço, data de nascimento e estado civil",
  "Informações ministeriais e histórico pastoral",
  "Discipulado, batismo, certificados e fotografias",
  "Dados de crianças, jovens e responsáveis",
  "Pedidos de oração e informações financeiras da igreja",
];

const purposes = [
  "Cadastro pastoral e acompanhamento de visitantes",
  "Consolidação espiritual, discipulado e batismo",
  "Comunicação institucional da igreja",
  "Emissão e validação de certificados",
  "Organização administrativa, ministerial e financeira",
];

const rights = [
  "Confirmar a existencia de tratamento dos dados",
  "Solicitar acesso, correção, exclusão ou anonimização",
  "Revogar consentimento e bloquear contato",
  "Solicitar informações sobre compartilhamento e segurança",
];

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8 md:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-purple-400/40 hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <ShieldCheck className="text-emerald-400" size={18} />
            <span>Bom Samaritano</span>
          </div>
        </header>

        <section className="grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Lock size={14} />
              LGPD e Privacidade
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Política de Privacidade do Sistema Bom Samaritano
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300">
              Esta página resume as diretrizes de proteção de dados pessoais do
              CRM Pastoral Bom Samaritano, em conformidade com a Lei Geral de
              Proteção de Dados, Lei nº 13.709/2018.
            </p>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
              <FileText className="text-purple-400" size={17} />
              Responsavel
            </h2>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Sistema Bom Samaritano - CRM Pastoral</p>
              <p>Igreja da Graça</p>
              <p>Administrador Responsável: Pastor Michael Ramos</p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoPanel
            icon={<Database size={18} />}
            title="Dados Tratados"
            items={collectedData}
          />
          <InfoPanel
            icon={<UserCheck size={18} />}
            title="Finalidades"
            items={purposes}
          />
          <InfoPanel
            icon={<ShieldCheck size={18} />}
            title="Direitos do Titular"
            items={rights}
          />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-lg font-bold text-white">Consentimento</h2>
            <p className="text-sm leading-relaxed text-zinc-300">
              Todo cadastro deve possuir consentimento expresso do titular dos
              dados ou de seu responsável legal, com registro de data, hora,
              usuário responsável e origem do consentimento.
            </p>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-lg font-bold text-white">Seguranca</h2>
            <p className="text-sm leading-relaxed text-zinc-300">
              O sistema deve utilizar autenticação de usuários, controle por
              perfil, logs de auditoria, proteção de backups e bloqueio de
              dados reais em repositórios públicos.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-lg border border-amber-400/20 bg-amber-400/10 p-5">
          <h2 className="mb-3 text-lg font-bold text-amber-200">GitHub</h2>
          <p className="text-sm leading-relaxed text-amber-100/90">
            É proibido armazenar banco de dados real, planilhas de membros,
            dados financeiros, arquivos de backup, arquivos .env, uploads ou
            dados pessoais de visitantes e membros em repositórios públicos.
            Somente código-fonte deve ser versionado.
          </p>
        </section>
      </div>
    </main>
  );
}

function InfoPanel({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300">
        <span className="text-purple-400">{icon}</span>
        {title}
      </h2>
      <ul className="space-y-2 text-sm leading-relaxed text-zinc-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
