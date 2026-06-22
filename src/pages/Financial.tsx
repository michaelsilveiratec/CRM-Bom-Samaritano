import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  createServerFinancialRecord,
  deleteServerFinancialRecord,
  fetchServerFinancialRecords,
  saveServerFinancialRecords,
  updateServerFinancialRecord,
} from "../services/crm.service";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Plus,
  X,
  CreditCard,
  Printer
} from "lucide-react";

interface FinanceRecord {
  id: number;
  contributor: string;
  category: "Dízimo" | "Oferta Geral" | "Missões" | "Construção";
  value: number;
  date: string;
  paymentMethod: "Pix" | "Dinheiro" | "Débito" | "Crédito";
  notes?: string;
}

interface WeeklyComparison {
  label: string;
  startDate: Date;
  endDate: Date;
  boleta: number;
  patrocinadores: number;
  total: number;
}

interface MonthlyComparison {
  monthIndex: number;
  monthName: string;
  boleta: number;
  patrocinadores: number;
  total: number;
  weeks: WeeklyComparison[];
}

interface QuickEntry {
  label: "Boleta" | "Patrocinadores";
  category: FinanceRecord["category"];
  date: string;
  notes: string;
  recordId?: number;
  duplicateIds?: number[];
}

interface YearMonthComparison {
  previousTotal: number;
  difference: number;
  percentage: number | null;
  status: "growth" | "drop" | "same" | "empty";
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getWeeksForMonth = (year: number, monthIndex: number) => {
  const weeks: Omit<WeeklyComparison, "boleta" | "patrocinadores" | "total">[] = [];
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  let startDay = 1;
  let weekNumber = 1;

  while (startDay <= lastDay) {
    const startDate = new Date(year, monthIndex, startDay);
    const daysUntilSunday = (7 - startDate.getDay()) % 7;
    const endDay = Math.min(startDay + daysUntilSunday, lastDay);
    const endDate = new Date(year, monthIndex, endDay);

    weeks.push({
      label: `Semana ${weekNumber}`,
      startDate,
      endDate,
    });

    startDay = endDay + 1;
    weekNumber += 1;
  }

  return weeks;
};

const getRevenueGroup = (category: string) => {
  const raw = String(category || "").toLowerCase();
  const normalized = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("dizimo") || normalized.includes("zimo") || normalized.includes("boleta")) {
    return "boleta";
  }

  if (normalized.includes("oferta") || normalized.includes("patrocin")) {
    return "patrocinadores";
  }

  return "outros";
};

export default function Financial() {
  function normalizeRecord(record: any): FinanceRecord {
    return {
      id: record.id ?? Date.now(),
      contributor: record.contributor || "",
      category: (record.category || "Dízimo") as FinanceRecord["category"],
      value: Number(record.value || 0),
      date: record.date || new Date().toISOString().split("T")[0],
      paymentMethod: (record.paymentMethod || "Pix") as FinanceRecord["paymentMethod"],
      notes: record.notes || "",
    };
  }

  const [records, setRecords] = useState<FinanceRecord[]>([]);

  useEffect(() => {
    const loadRemoteRecords = async () => {
      try {
        const response = await fetchServerFinancialRecords();
        const serverRecords = (response?.records || []).map(normalizeRecord);

        if (serverRecords.length > 0) {
          setRecords(serverRecords);
          localStorage.setItem("financial_records_data", JSON.stringify(serverRecords));
          return;
        }

        if (records.length > 0) {
          const syncResponse = await saveServerFinancialRecords(records);
          const syncedRecords = (syncResponse?.records || []).map(normalizeRecord);
          setRecords(syncedRecords);
          localStorage.setItem("financial_records_data", JSON.stringify(syncedRecords));
        }
      } catch (error) {
        console.warn("Não foi possível carregar financeiro do servidor:", error);
      }
    };

    loadRemoteRecords();
  }, []);

  useEffect(() => {
    localStorage.setItem("financial_records_data", JSON.stringify(records));
  }, [records]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const [comparisonYear, setComparisonYear] = useState(new Date().getFullYear());
  const [reportScope, setReportScope] = useState<"month" | "year">("month");
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Form State
  const [newContributor, setNewContributor] = useState("");
  const [newCategory, setNewCategory] = useState<FinanceRecord["category"]>("Dízimo");
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMethod, setNewMethod] = useState<FinanceRecord["paymentMethod"]>("Pix");
  const [newNotes, setNewNotes] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [quickEntry, setQuickEntry] = useState<QuickEntry | null>(null);
  const [quickValue, setQuickValue] = useState("");

  const resetForm = () => {
    setNewContributor("");
    setNewCategory("Dízimo");
    setNewValue("");
    setNewDate("");
    setNewMethod("Pix");
    setNewNotes("");
    setEditingId(null);
  };

  const openWeekEntryModal = (
    monthName: string,
    week: WeeklyComparison,
    category: FinanceRecord["category"]
  ) => {
    const entryLabel = category === "Dízimo" ? "Boleta" : "Patrocinadores";
    const notes = getQuickEntryNotes(entryLabel, monthName, week);
    const existingRecords = getQuickEntryRecords(monthName, week, category);
    const existingRecord = existingRecords[0];

    setQuickEntry({
      label: entryLabel,
      category,
      date: formatInputDate(week.startDate),
      notes,
      recordId: existingRecord?.id,
      duplicateIds: existingRecords.slice(1).map((record) => record.id),
    });
    setQuickValue(existingRecord ? String(existingRecord.value) : "");
  };

  const getQuickEntryNotes = (
    entryLabel: QuickEntry["label"],
    monthName: string,
    week: WeeklyComparison
  ) => `${entryLabel} - ${monthName} ${comparisonYear} - ${week.label} (${formatShortDate(week.startDate)} a ${formatShortDate(week.endDate)})`;

  const getQuickEntryRecords = (
    monthName: string,
    week: WeeklyComparison,
    category: FinanceRecord["category"]
  ) => {
    const entryLabel = category === "Dízimo" ? "Boleta" : "Patrocinadores";
    const notes = getQuickEntryNotes(entryLabel, monthName, week);

    return records.filter((record) => (
      record.category === category &&
      record.contributor === entryLabel &&
      record.notes === notes
    ));
  };

  const getQuickEntryRecord = (
    monthName: string,
    week: WeeklyComparison,
    category: FinanceRecord["category"]
  ) => getQuickEntryRecords(monthName, week, category)[0];

  const handleQuickEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEntry || quickValue === "") return;
    const parsedValue = Number(quickValue);

    try {
      if (quickEntry.recordId) {
        const response = await updateServerFinancialRecord(quickEntry.recordId, {
          contributor: quickEntry.label,
          category: quickEntry.category,
          value: parsedValue,
          date: quickEntry.date,
          paymentMethod: "Pix",
          notes: quickEntry.notes,
        });
        const duplicateIds = quickEntry.duplicateIds || [];
        await Promise.all(duplicateIds.map((id) => deleteServerFinancialRecord(id)));
        setRecords(records
          .filter((record) => !duplicateIds.includes(record.id))
          .map((record) => (
            record.id === quickEntry.recordId ? normalizeRecord(response.record) : record
          )));
      } else {
        const response = await createServerFinancialRecord({
          contributor: quickEntry.label,
          category: quickEntry.category,
          value: parsedValue,
          date: quickEntry.date,
          paymentMethod: "Pix",
          notes: quickEntry.notes,
        });
        setRecords([normalizeRecord(response.record), ...records]);
      }
      setQuickEntry(null);
      setQuickValue("");
    } catch (error) {
      console.warn("Falha ao salvar lançamento financeiro no backend:", error);
      alert("Não foi possível salvar o lançamento no servidor. Verifique se o backend está rodando na porta 3001.");
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContributor || !newValue) return;

    if (editingId) {
      try {
        const response = await updateServerFinancialRecord(editingId, {
          contributor: newContributor,
          category: newCategory,
          value: Number(newValue),
          date: newDate,
          paymentMethod: newMethod,
          notes: newNotes,
        });
        setRecords(records.map(r => 
          r.id === editingId ? normalizeRecord(response.record) : r
        ));
      } catch (error) {
        console.warn("Falha ao atualizar lançamento financeiro no backend:", error);
        alert("Não foi possível salvar o lançamento no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    } else {
      try {
        const response = await createServerFinancialRecord({
          contributor: newContributor,
          category: newCategory,
          value: Number(newValue),
          date: newDate || new Date().toISOString().split("T")[0],
          paymentMethod: newMethod,
          notes: newNotes,
        });
        setRecords([normalizeRecord(response.record), ...records]);
      } catch (error) {
        console.warn("Falha ao salvar lançamento financeiro no backend:", error);
        alert("Não foi possível salvar o lançamento no servidor. Verifique se o backend está rodando na porta 3001.");
        return;
      }
    }

    setIsModalOpen(false);
    resetForm();
  };

  const totalRevenue = records.reduce((sum, r) => sum + r.value, 0);
  const totalTithes = records.filter(r => r.category === "Dízimo").reduce((sum, r) => sum + r.value, 0);
  const totalOfferings = records.filter(r => r.category === "Oferta Geral").reduce((sum, r) => sum + r.value, 0);
  const totalOthers = records.filter(r => ["Missões", "Construção"].includes(r.category)).reduce((sum, r) => sum + r.value, 0);

  const availableYears = useMemo(() => {
    const years = new Set<number>([2025, new Date().getFullYear()]);

    records.forEach((record) => {
      const parsedDate = parseLocalDate(record.date);
      if (parsedDate) {
        years.add(parsedDate.getFullYear());
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const yearlyComparison = useMemo<MonthlyComparison[]>(() => {
    return MONTH_NAMES.map((monthName, monthIndex) => {
      const weeks = getWeeksForMonth(comparisonYear, monthIndex).map((week) => ({
        ...week,
        boleta: 0,
        patrocinadores: 0,
        total: 0,
      }));

      records.forEach((record) => {
        const parsedDate = parseLocalDate(record.date);
        if (!parsedDate) return;
        if (parsedDate.getFullYear() !== comparisonYear || parsedDate.getMonth() !== monthIndex) return;

        const group = getRevenueGroup(record.category);
        if (group === "outros") return;

        const week = weeks.find(
          (item) => parsedDate >= item.startDate && parsedDate <= item.endDate
        );
        if (!week) return;

        if (group === "boleta") {
          week.boleta += record.value;
        } else {
          week.patrocinadores += record.value;
        }
        week.total += record.value;
      });

      const boleta = weeks.reduce((sum, week) => sum + week.boleta, 0);
      const patrocinadores = weeks.reduce((sum, week) => sum + week.patrocinadores, 0);

      return {
        monthIndex,
        monthName,
        boleta,
        patrocinadores,
        total: boleta + patrocinadores,
        weeks,
      };
    });
  }, [records, comparisonYear]);

  const selectedYearTotals = yearlyComparison.reduce(
    (totals, month) => ({
      boleta: totals.boleta + month.boleta,
      patrocinadores: totals.patrocinadores + month.patrocinadores,
      total: totals.total + month.total,
    }),
    { boleta: 0, patrocinadores: 0, total: 0 }
  );

  const previousYearMonthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0) as number[];

    records.forEach((record) => {
      const parsedDate = parseLocalDate(record.date);
      if (!parsedDate) return;
      if (parsedDate.getFullYear() !== comparisonYear - 1) return;
      if (getRevenueGroup(record.category) === "outros") return;

      totals[parsedDate.getMonth()] += record.value;
    });

    return totals;
  }, [records, comparisonYear]);

  const yearMonthComparisons = useMemo<YearMonthComparison[]>(() => {
    return yearlyComparison.map((month) => {
      const previousTotal = previousYearMonthlyTotals[month.monthIndex] || 0;
      const difference = month.total - previousTotal;
      const percentage = previousTotal > 0 ? (difference / previousTotal) * 100 : null;

      return {
        previousTotal,
        difference,
        percentage,
        status:
          previousTotal === 0 && month.total === 0
            ? "empty"
            : difference > 0
              ? "growth"
              : difference < 0
                ? "drop"
                : "same",
      };
    });
  }, [yearlyComparison, previousYearMonthlyTotals]);

  const maxComparisonValue = Math.max(
    1,
    ...yearlyComparison.flatMap((month) => [
      month.total,
      ...month.weeks.map((week) => week.total),
    ])
  );

  const getBarWidth = (value: number) => `${Math.max(value > 0 ? 4 : 0, (value / maxComparisonValue) * 100)}%`;

  const reportMonths = reportScope === "year"
    ? yearlyComparison
    : yearlyComparison.filter((month) => month.monthIndex === reportMonth);

  const reportTotals = reportMonths.reduce(
    (totals, month) => ({
      boleta: totals.boleta + month.boleta,
      patrocinadores: totals.patrocinadores + month.patrocinadores,
      total: totals.total + month.total,
    }),
    { boleta: 0, patrocinadores: 0, total: 0 }
  );

  const handlePrintReport = () => {
    const reportTitle = reportScope === "year"
      ? `Ano completo de ${comparisonYear}`
      : `${MONTH_NAMES[reportMonth]} de ${comparisonYear}`;

    const monthRows = reportMonths.map((month) => {
      const comparison = yearMonthComparisons[month.monthIndex];
      const missingToGoal = Math.max(0, comparison.previousTotal - month.total);
      const comparisonLabel =
        comparison.status === "growth"
          ? `Cresceu ${formatCurrency(comparison.difference)}`
          : comparison.status === "drop"
            ? `Caiu ${formatCurrency(Math.abs(comparison.difference))}`
            : comparison.status === "same"
              ? "Mesmo valor"
              : "Sem comparativo";

      return `
        <tr>
          <td>${month.monthName}</td>
          <td>${formatCurrency(month.boleta)}</td>
          <td>${formatCurrency(month.patrocinadores)}</td>
          <td>${formatCurrency(month.total)}</td>
          <td>${comparisonYear} x ${comparisonYear - 1}: ${comparisonLabel}</td>
          <td>${missingToGoal > 0 ? formatCurrency(missingToGoal) : "Meta alcançada"}</td>
        </tr>
      `;
    }).join("");

    const weekRows = reportScope === "month" && reportMonths[0]
      ? reportMonths[0].weeks.map((week) => `
          <tr>
            <td>${week.label}</td>
            <td>${formatShortDate(week.startDate)} a ${formatShortDate(week.endDate)}</td>
            <td>${formatCurrency(week.boleta)}</td>
            <td>${formatCurrency(week.patrocinadores)}</td>
            <td>${formatCurrency(week.total)}</td>
          </tr>
        `).join("")
      : "";

    const reportHtml = `
      <!doctype html>
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { margin: 28px 0 10px; font-size: 18px; }
            p { margin: 4px 0; color: #4b5563; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 24px 0; }
            .summary-card { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
            .summary-label { color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .summary-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f3f4f6; }
            @media print { body { margin: 18mm; } }
          </style>
        </head>
        <body>
          <h1>Relatório Financeiro</h1>
          <p>${reportTitle}</p>
          <p>Boleta = Dízimo | Patrocinadores = Oferta Geral</p>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Boleta</div>
              <div class="summary-value">${formatCurrency(reportTotals.boleta)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Patrocinadores</div>
              <div class="summary-value">${formatCurrency(reportTotals.patrocinadores)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total</div>
              <div class="summary-value">${formatCurrency(reportTotals.total)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Boleta</th>
                <th>Patrocinadores</th>
                <th>Total</th>
                <th>Comparativo</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>${monthRows}</tbody>
          </table>

          ${weekRows ? `
            <h2>Semanas de ${reportMonths[0].monthName}</h2>
            <table>
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Período</th>
                  <th>Boleta</th>
                  <th>Patrocinadores</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>${weekRows}</tbody>
            </table>
          ` : ""}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      alert("Não foi possível abrir o relatório. Verifique se o navegador bloqueou pop-ups.");
      return;
    }

    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write(reportHtml);
    printDocument.close();

    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  return (
    <>
    <style>{`
      .goal-confetti {
        pointer-events: none;
        position: absolute;
        inset: -12px 0 auto;
        height: 46px;
        overflow: hidden;
      }
      .goal-confetti span {
        position: absolute;
        top: -8px;
        width: 6px;
        height: 10px;
        border-radius: 2px;
        animation: goal-confetti-fall 1.8s ease-out infinite;
      }
      .goal-confetti span:nth-child(1) { left: 6%; background: #facc15; animation-delay: 0s; }
      .goal-confetti span:nth-child(2) { left: 18%; background: #34d399; animation-delay: .18s; }
      .goal-confetti span:nth-child(3) { left: 30%; background: #60a5fa; animation-delay: .34s; }
      .goal-confetti span:nth-child(4) { left: 42%; background: #f472b6; animation-delay: .08s; }
      .goal-confetti span:nth-child(5) { left: 55%; background: #a78bfa; animation-delay: .26s; }
      .goal-confetti span:nth-child(6) { left: 68%; background: #f97316; animation-delay: .44s; }
      .goal-confetti span:nth-child(7) { left: 80%; background: #22d3ee; animation-delay: .14s; }
      .goal-confetti span:nth-child(8) { left: 92%; background: #bef264; animation-delay: .32s; }
      @keyframes goal-confetti-fall {
        0% { transform: translateY(-8px) rotate(0deg); opacity: 0; }
        15% { opacity: 1; }
        100% { transform: translateY(48px) rotate(220deg); opacity: 0; }
      }
      @media print {
        body { background: #ffffff !important; color: #111827 !important; }
        .financial-screen { display: none !important; }
        .financial-print { display: block !important; }
        .financial-print table { width: 100%; border-collapse: collapse; }
        .financial-print th, .financial-print td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }
        .financial-print th { background: #f3f4f6; text-align: left; }
        .financial-print .print-page-break { page-break-before: always; }
      }
    `}</style>
    <div className="space-y-8 animate-fade-in financial-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Financeiro</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Gestão transparente de dízimos, ofertas gerais, missões e construções
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Lançar Entrada</span>
        </button>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <div className="flex justify-between items-center mb-4">
            <DollarSign className="text-emerald-400 w-8 h-8" />
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">TOTAL</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Entrada Total</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-card p-6 border bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <Wallet className="text-purple-400 w-8 h-8" />
            <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">DÍZIMOS</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Dízimos</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">R$ {totalTithes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-card p-6 border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
          <div className="flex justify-between items-center mb-4">
            <TrendingUp className="text-blue-400 w-8 h-8" />
            <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">OFERTAS</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ofertas Gerais</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">R$ {totalOfferings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
        </div>

        <div className="glass-card p-6 border bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <div className="flex justify-between items-center mb-4">
            <CreditCard className="text-amber-400 w-8 h-8" />
            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">OUTROS</span>
          </div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Missões & Construção</p>
          <h3 className="text-3xl font-extrabold text-white mt-1">R$ {totalOthers.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      <div className="glass-card p-6 border border-white/10 bg-zinc-950/60">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <TrendingUp size={18} />
              <h3 className="text-lg font-bold text-white">Comparativo Anual</h3>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Boleta usa Dízimo; Patrocinadores usa Oferta Geral.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                min="1900"
                max="2100"
                value={comparisonYear}
                onChange={(e) => setComparisonYear(Number(e.target.value) || new Date().getFullYear())}
                list="financial-years"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500"
              />
              <datalist id="financial-years">
                {availableYears.map((year) => (
                  <option key={year} value={year} />
                ))}
              </datalist>
              <select
                value={reportScope}
                onChange={(e) => setReportScope(e.target.value as "month" | "year")}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="month" className="bg-zinc-900">Relatório mensal</option>
                <option value="year" className="bg-zinc-900">Relatório anual</option>
              </select>
              {reportScope === "month" && (
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {MONTH_NAMES.map((monthName, index) => (
                    <option key={monthName} value={index} className="bg-zinc-900">
                      {monthName}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={handlePrintReport}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95"
              >
                <Printer size={16} />
                <span>PDF</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="block text-[10px] uppercase font-bold text-purple-300">Boleta</span>
                <strong className="text-xs text-white">{formatCurrency(selectedYearTotals.boleta)}</strong>
              </div>
              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="block text-[10px] uppercase font-bold text-blue-300">Patrocinadores</span>
                <strong className="text-xs text-white">{formatCurrency(selectedYearTotals.patrocinadores)}</strong>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-[10px] uppercase font-bold text-emerald-300">Total</span>
                <strong className="text-xs text-white">{formatCurrency(selectedYearTotals.total)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {yearlyComparison.map((month) => {
            const yearAlert = yearMonthComparisons[month.monthIndex];
            const alertClass =
              yearAlert.status === "growth"
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
                : yearAlert.status === "drop"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  : "border-white/10 bg-white/5 text-zinc-300";
            const alertText =
              yearAlert.status === "growth"
                ? `Cresceu ${formatCurrency(yearAlert.difference)}`
                : yearAlert.status === "drop"
                  ? `Caiu ${formatCurrency(Math.abs(yearAlert.difference))}`
                  : yearAlert.status === "same"
                    ? "Mesmo valor"
                    : "Sem valores para comparar";
            const percentageText = yearAlert.percentage === null ? "" : ` (${yearAlert.percentage.toFixed(1)}%)`;
            const missingToGoal = Math.max(0, yearAlert.previousTotal - month.total);

            return (
            <div key={month.monthIndex} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                <div>
                  <div className="flex items-center justify-between gap-3 lg:block">
                    <h4 className="text-sm font-bold text-white">{month.monthName}</h4>
                    <span className="text-xs font-bold text-emerald-300 lg:block lg:mt-2">
                      {formatCurrency(month.total)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-[11px] text-zinc-400">
                    <div className="flex justify-between gap-2">
                      <span>Boleta</span>
                      <span className="text-purple-300">{formatCurrency(month.boleta)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Patrocinadores</span>
                      <span className="text-blue-300">{formatCurrency(month.patrocinadores)}</span>
                    </div>
                  </div>
                  <div className={`mt-3 rounded-lg border px-3 py-2 text-[11px] font-bold ${alertClass}`}>
                    <div>{comparisonYear} x {comparisonYear - 1}</div>
                    <div>{alertText}{percentageText}</div>
                    {yearAlert.previousTotal > 0 && (
                      <div
                        className={`relative mt-2 overflow-hidden rounded-md border px-2 py-1 text-[10px] ${
                          missingToGoal > 0
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        }`}
                      >
                        {missingToGoal === 0 && (
                          <div className="goal-confetti" aria-hidden="true">
                            {Array.from({ length: 8 }).map((_, index) => (
                              <span key={index} />
                            ))}
                          </div>
                        )}
                        {missingToGoal > 0
                          ? `Falta para a meta: ${formatCurrency(missingToGoal)}`
                          : "Meta alcançada"}
                      </div>
                    )}
                    <div className="mt-1 text-[10px] font-semibold opacity-80">
                      {formatCurrency(month.total)} / {formatCurrency(yearAlert.previousTotal)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400" style={{ width: getBarWidth(month.total) }} />
                  </div>

                  <div className="grid gap-2">
                    {month.weeks.map((week) => {
                      const boletaRecord = getQuickEntryRecord(month.monthName, week, "Dízimo");
                      const patrocinadoresRecord = getQuickEntryRecord(month.monthName, week, "Oferta Geral");

                      return (
                      <div key={`${month.monthIndex}-${week.label}`} className="grid gap-2 md:grid-cols-[150px_1fr_170px_110px] md:items-center">
                        <div className="text-[11px] text-zinc-400">
                          <span className="font-bold text-zinc-300">{week.label}</span>
                          <span className="ml-2">{formatShortDate(week.startDate)} a {formatShortDate(week.endDate)}</span>
                        </div>

                        <div className="grid gap-1">
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-purple-500" style={{ width: getBarWidth(week.boleta) }} />
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: getBarWidth(week.patrocinadores) }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openWeekEntryModal(month.monthName, week, "Dízimo")}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-[11px] font-bold text-purple-200 transition-all hover:bg-purple-500/20 active:scale-95"
                            title={`${boletaRecord ? "Alterar" : "Inserir"} Boleta em ${week.label}`}
                          >
                            <Plus size={12} />
                            <span>{boletaRecord ? "Alterar" : "Inserir"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openWeekEntryModal(month.monthName, week, "Oferta Geral")}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-bold text-blue-200 transition-all hover:bg-blue-500/20 active:scale-95"
                            title={`${patrocinadoresRecord ? "Alterar" : "Inserir"} Patrocinadores em ${week.label}`}
                          >
                            <Plus size={12} />
                            <span>{patrocinadoresRecord ? "Alterar" : "Inserir"}</span>
                          </button>
                        </div>

                        <div className="text-[11px] text-zinc-300 md:text-right">
                          <span className="text-purple-300">{formatCurrency(week.boleta)}</span>
                          <span className="mx-1 text-zinc-600">+</span>
                          <span className="text-blue-300">{formatCurrency(week.patrocinadores)}</span>
                          <div className="font-bold text-white">{formatCurrency(week.total)}</div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {quickEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickEntrySubmit}
            className={`w-full max-w-xs rounded-2xl border bg-zinc-950 p-5 shadow-2xl animate-scale-up ${
              quickEntry.label === "Boleta" ? "border-purple-500/30" : "border-blue-500/30"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-white">{quickEntry.label}</h3>
              <button
                type="button"
                onClick={() => {
                  setQuickEntry(null);
                  setQuickValue("");
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Valor</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-emerald-500">
              <span className="text-sm font-bold text-zinc-300">R$</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                min="0"
                required
                value={quickValue}
                onChange={(e) => setQuickValue(e.target.value)}
                placeholder="0,00"
                className="w-full bg-transparent text-lg font-bold text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
                quickEntry.label === "Boleta" ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {quickEntry.recordId ? "Salvar alteração" : "Salvar"}
            </button>
          </form>
        </div>
      )}

      {/* Registrar Lançamento Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="text-emerald-400" size={20} />
                <span>{editingId ? "Editar Lançamento" : "Registrar Novo Lançamento"}</span>
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Contribuinte / Doador</label>
                <input
                  type="text"
                  required
                  value={newContributor}
                  onChange={(e) => setNewContributor(e.target.value)}
                  placeholder="Ex: Lucas da Silva Rocha (ou Membro Anônimo)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FinanceRecord["category"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Dízimo" className="bg-zinc-900">Boleta / Dízimo</option>
                    <option value="Oferta Geral" className="bg-zinc-900">Patrocinadores / Oferta Geral</option>
                    <option value="Missões" className="bg-zinc-900">Missões</option>
                    <option value="Construção" className="bg-zinc-900">Construção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Ex: 350.00"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Data Lançamento</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Forma de Recebimento</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as FinanceRecord["paymentMethod"])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Pix" className="bg-zinc-900">Pix</option>
                    <option value="Dinheiro" className="bg-zinc-900">Dinheiro</option>
                    <option value="Débito" className="bg-zinc-900">Cartão Débito</option>
                    <option value="Crédito" className="bg-zinc-900">Cartão Crédito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Observações / Detalhes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {editingId ? "Salvar Alterações" : "Lançar Entrada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <div className="financial-print hidden p-8 bg-white text-zinc-900">
      <div className="mb-6 border-b border-zinc-300 pb-4">
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>
        <p className="mt-1 text-sm">
          {reportScope === "year"
            ? `Ano completo de ${comparisonYear}`
            : `${MONTH_NAMES[reportMonth]} de ${comparisonYear}`}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Boleta = Dízimo | Patrocinadores = Oferta Geral
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded border border-zinc-300 p-3">
          <div className="text-xs font-bold uppercase text-zinc-500">Boleta</div>
          <div className="text-lg font-bold">{formatCurrency(reportTotals.boleta)}</div>
        </div>
        <div className="rounded border border-zinc-300 p-3">
          <div className="text-xs font-bold uppercase text-zinc-500">Patrocinadores</div>
          <div className="text-lg font-bold">{formatCurrency(reportTotals.patrocinadores)}</div>
        </div>
        <div className="rounded border border-zinc-300 p-3">
          <div className="text-xs font-bold uppercase text-zinc-500">Total</div>
          <div className="text-lg font-bold">{formatCurrency(reportTotals.total)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Boleta</th>
            <th>Patrocinadores</th>
            <th>Total</th>
            <th>Comparativo</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {reportMonths.map((month) => {
            const comparison = yearMonthComparisons[month.monthIndex];
            const missingToGoal = Math.max(0, comparison.previousTotal - month.total);
            const comparisonLabel =
              comparison.status === "growth"
                ? `Cresceu ${formatCurrency(comparison.difference)}`
                : comparison.status === "drop"
                  ? `Caiu ${formatCurrency(Math.abs(comparison.difference))}`
                  : comparison.status === "same"
                    ? "Mesmo valor"
                    : "Sem comparativo";

            return (
              <tr key={`print-${month.monthIndex}`}>
                <td>{month.monthName}</td>
                <td>{formatCurrency(month.boleta)}</td>
                <td>{formatCurrency(month.patrocinadores)}</td>
                <td>{formatCurrency(month.total)}</td>
                <td>{comparisonYear} x {comparisonYear - 1}: {comparisonLabel}</td>
                <td>{missingToGoal > 0 ? formatCurrency(missingToGoal) : "Meta alcançada"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {reportScope === "month" && reportMonths[0] && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Semanas de {reportMonths[0].monthName}</h2>
          <table>
            <thead>
              <tr>
                <th>Semana</th>
                <th>Período</th>
                <th>Boleta</th>
                <th>Patrocinadores</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reportMonths[0].weeks.map((week) => (
                <tr key={`print-week-${week.label}`}>
                  <td>{week.label}</td>
                  <td>{formatShortDate(week.startDate)} a {formatShortDate(week.endDate)}</td>
                  <td>{formatCurrency(week.boleta)}</td>
                  <td>{formatCurrency(week.patrocinadores)}</td>
                  <td>{formatCurrency(week.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
