import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Wallet,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  X,
  CreditCard,
  Trash2
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

export default function Financial() {
  const [records, setRecords] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem("financial_records_data");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        contributor: "Lucas Rocha",
        category: "Dízimo",
        value: 350.0,
        date: "2026-05-15",
        paymentMethod: "Pix",
        notes: "Referente ao mês de maio",
      },
      {
        id: 2,
        contributor: "Sandra Regina",
        category: "Oferta Geral",
        value: 120.0,
        date: "2026-05-14",
        paymentMethod: "Dinheiro",
        notes: "Culto de Quinta-feira",
      },
      {
        id: 3,
        contributor: "Anderson Silva",
        category: "Dízimo",
        value: 800.0,
        date: "2026-05-10",
        paymentMethod: "Pix",
      },
      {
        id: 4,
        contributor: "Membro Anônimo",
        category: "Missões",
        value: 200.0,
        date: "2026-05-08",
        paymentMethod: "Pix",
        notes: "Oferta para campo missionário na África",
      },
      {
        id: 5,
        contributor: "Renata Fagundes",
        category: "Construção",
        value: 500.0,
        date: "2026-05-01",
        paymentMethod: "Débito",
        notes: "Campanha do novo templo",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("financial_records_data", JSON.stringify(records));
  }, [records]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

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

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContributor || !newValue) return;

    const newRecord: FinanceRecord = {
      id: Date.now(),
      contributor: newContributor,
      category: newCategory,
      value: Number(newValue),
      date: newDate || new Date().toISOString().split("T")[0],
      paymentMethod: newMethod,
      notes: newNotes,
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);

    // Reset Form
    setNewContributor("");
    setNewCategory("Dízimo");
    setNewValue("");
    setNewDate("");
    setNewMethod("Pix");
    setNewNotes("");
  };

  const handleDeleteRecord = (id: number) => {
    if (window.confirm("Deseja realmente excluir este lançamento financeiro?")) {
      setRecords(records.filter((r) => r.id !== id));
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.contributor.toLowerCase().includes(search.toLowerCase()) || 
                          r.notes?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "All" || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRevenue = records.reduce((sum, r) => sum + r.value, 0);
  const totalTithes = records.filter(r => r.category === "Dízimo").reduce((sum, r) => sum + r.value, 0);
  const totalOfferings = records.filter(r => r.category === "Oferta Geral").reduce((sum, r) => sum + r.value, 0);
  const totalOthers = records.filter(r => ["Missões", "Construção"].includes(r.category)).reduce((sum, r) => sum + r.value, 0);

  const getCategoryColor = (cat: FinanceRecord["category"]) => {
    switch (cat) {
      case "Dízimo":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "Oferta Geral":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Missões":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Construção":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Financeiro</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Gestão transparente de dízimos, ofertas gerais, missões e construções
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por contribuinte ou observação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="All" className="bg-zinc-900">Todas Categorias</option>
            <option value="Dízimo" className="bg-zinc-900">Dízimo</option>
            <option value="Oferta Geral" className="bg-zinc-900">Oferta Geral</option>
            <option value="Missões" className="bg-zinc-900">Missões</option>
            <option value="Construção" className="bg-zinc-900">Construção</option>
          </select>
        </div>
      </div>

      {/* Ledger Records Table */}
      <div className="glass-card overflow-hidden border border-white/5 bg-zinc-950/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">Contribuinte</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Forma Pagto</th>
                <th className="px-6 py-4">Data Lançamento</th>
                <th className="px-6 py-4">Observações</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-zinc-200">
                    {rec.contributor}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getCategoryColor(rec.category)}`}>
                      {rec.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400 font-semibold">
                    {rec.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400">
                    {new Date(rec.date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 italic max-w-xs truncate">
                    {rec.notes || "-"}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    R$ {rec.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Confirmado
                      </span>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        title="Excluir Entrada"
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-all active:scale-90"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-500 font-semibold">
                    Nenhum lançamento financeiro registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registrar Lançamento Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="text-emerald-400" size={20} />
                <span>Registrar Novo Lançamento Financeiro</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
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
                    <option value="Dízimo" className="bg-zinc-900">Dízimo</option>
                    <option value="Oferta Geral" className="bg-zinc-900">Oferta Geral</option>
                    <option value="Missões" className="bg-zinc-900">Missões</option>
                    <option value="Construção" className="bg-zinc-900">Construção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Lançar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
