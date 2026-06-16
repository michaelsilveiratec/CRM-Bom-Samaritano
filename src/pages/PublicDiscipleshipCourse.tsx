import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, BookOpen, CheckCircle, Printer, Send, XCircle } from "lucide-react";
import {
  completePublicDiscipleshipCourse,
  fetchPublicDiscipleshipCourse,
} from "../services/crm.service";

export default function PublicDiscipleshipCourse() {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetchPublicDiscipleshipCourse(token);
        setCourse(response);
        setAnswers(Array(response.evaluation?.length || 0).fill(-1));
      } catch (err: any) {
        setError(err.message || "Não foi possível abrir este curso.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some((answer) => answer < 0)) return;

    setSending(true);
    try {
      const response = await completePublicDiscipleshipCourse(token, answers);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Não foi possível enviar a avaliação.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="text-sm text-zinc-400">Carregando aula...</div>
      </div>
    );
  }

  if (error || !course?.lesson) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
          <XCircle className="mx-auto mb-3 text-rose-300" size={34} />
          <h1 className="text-lg font-bold">Curso indisponivel</h1>
          <p className="mt-2 text-sm text-rose-100/80">{error || "Link invalido."}</p>
        </div>
      </div>
    );
  }

  const { enrollment, journey, lesson, evaluation } = course;
  const effectiveEnrollment = result?.enrollment || enrollment;
  const alreadyCompleted = effectiveEnrollment.status === "Concluido";
  const totalLessons = Number(journey?.totalLessons || effectiveEnrollment.totalLessons || 0);
  const isFinalLesson =
    totalLessons > 0 && Number(effectiveEnrollment.lessonNum || lesson.num || 0) >= totalLessons;
  const canShowDiploma = alreadyCompleted && isFinalLesson;

  const handlePrintDiploma = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const churchName = localStorage.getItem("settings_church_name") || "Igreja Bom Samaritano";
    const pastorName = localStorage.getItem("settings_pastor_name") || "Pastor";

    win.document.write(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Diploma - ${effectiveEnrollment.memberName}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; background: #e5e7eb; font-family: Georgia, serif; }
          .page { width: 297mm; height: 210mm; box-sizing: border-box; padding: 24mm; background: #fff; color: #172554; display: flex; align-items: center; justify-content: center; }
          .frame { width: 100%; height: 100%; border: 4px double #b45309; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 18mm; box-sizing: border-box; }
          .church { font-size: 16px; letter-spacing: 4px; text-transform: uppercase; color: #1e3a8a; }
          h1 { font-size: 54px; margin: 22px 0 8px; color: #b45309; }
          .label { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #64748b; }
          .name { font-size: 58px; margin: 24px 0; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding: 0 40px 10px; }
          .text { max-width: 780px; font-size: 18px; line-height: 1.7; color: #334155; }
          .signatures { width: 80%; display: flex; justify-content: space-between; margin-top: 48px; font-size: 13px; color: #475569; }
          .line { width: 240px; border-top: 1px solid #64748b; padding-top: 8px; }
          .date { margin-top: 28px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="frame">
            <div class="church">${churchName}</div>
            <h1>Diploma Digital</h1>
            <div class="label">Conclusao de Curso</div>
            <div class="name">${effectiveEnrollment.memberName}</div>
            <div class="text">
              Concluiu com aproveitamento o curso <strong>${journey?.name || "Discipulado"}</strong>,
              demonstrando crescimento espiritual e compromisso com a Palavra de Deus.
            </div>
            <div class="signatures">
              <div class="line">Discipulado</div>
              <div class="line">${pastorName}</div>
            </div>
            <div class="date">${today}</div>
          </div>
        </div>
        <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          {enrollment.courseImageUrl ? (
            <div className="bg-zinc-900">
              <img
                src={enrollment.courseImageUrl}
                alt={lesson.title}
                className="mx-auto max-h-[420px] w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-44 bg-gradient-to-br from-purple-900 via-zinc-900 to-emerald-900 flex items-center justify-center">
              <BookOpen size={48} className="text-white/70" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-300">
                {journey?.name || "Curso de Discipulado"} - Aula {lesson.num}
              </div>
              <h1 className="mt-2 text-2xl font-extrabold">{lesson.title}: {lesson.subtitle}</h1>
              <p className="mt-2 text-sm text-zinc-400">Aluno: {enrollment.memberName}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
              <p className="text-xs font-bold uppercase text-zinc-500">Objetivo</p>
              <p className="mt-2 text-sm text-zinc-100 leading-relaxed">{lesson.objective}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase text-zinc-500">{lesson.base}</p>
              <p className="mt-2 text-sm italic text-zinc-100 leading-relaxed">{lesson.baseText}</p>
            </div>

            <div className="space-y-4">
              {(lesson.sections || []).map((section: any, index: number) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <h2 className="text-base font-bold text-white">{section.title}</h2>
                  {section.body && <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{section.body}</p>}
                  {Array.isArray(section.items) && section.items.length > 0 && (
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      {section.items.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="flex gap-2">
                          <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {alreadyCompleted || result?.passed ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <Award className="mx-auto mb-3 text-emerald-300" size={40} />
                <h2 className="text-xl font-bold text-emerald-100">
                  {canShowDiploma ? "Curso concluido com diploma liberado" : "Lição concluida com presenca validada"}
                </h2>
                <p className="mt-2 text-sm text-emerald-100/80">
                  {canShowDiploma
                    ? "Sua conclusao foi registrada no acompanhamento espiritual."
                    : "Sua resposta foi enviada ao pastor. Aguarde o envio da próxima lição."}
                </p>
                {canShowDiploma && (
                  <button
                    type="button"
                    onClick={handlePrintDiploma}
                    className="mx-auto mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
                  >
                    <Printer size={16} />
                    <span>Gerar diploma digital</span>
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-5 space-y-5">
                <div>
                  <h2 className="text-lg font-bold">Avaliacao da aula</h2>
                  <p className="text-xs text-purple-100/70 mt-1">Responda para validar sua presenca e conclusao.</p>
                </div>

                {evaluation.map((question: any, questionIndex: number) => (
                  <div key={question.id} className="space-y-3">
                    <p className="text-sm font-bold text-white">{questionIndex + 1}. {question.question}</p>
                    <div className="grid gap-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <label
                          key={optionIndex}
                          className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
                            answers[questionIndex] === optionIndex
                              ? "border-purple-400 bg-purple-500/20 text-white"
                              : "border-white/10 bg-white/5 text-zinc-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            checked={answers[questionIndex] === optionIndex}
                            onChange={() => {
                              const nextAnswers = [...answers];
                              nextAnswers[questionIndex] = optionIndex;
                              setAnswers(nextAnswers);
                            }}
                            className="sr-only"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {result && !result.passed && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
                    Algumas respostas precisam ser revistas. Leia a aula e tente novamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || answers.some((answer) => answer < 0)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>{sending ? "Enviando..." : "Enviar avaliação"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
