import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { ExpenseCategory, Expense, ExpenseSplit } from '../types';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Train,
  Building2,
  Car,
  HelpCircle,
  PiggyBank,
  Users,
  AlertCircle
} from 'lucide-react';

export const BudgetExpensesView: React.FC = () => {
  const { currentTrip, addExpense, updateExpense, deleteExpense, updateBudget } = useTripStore();

  // Add Expense State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'Equal' | 'Exact' | 'Custom'>('Equal');
  const [memberSplits, setMemberSplits] = useState<{ [memberId: string]: number }>({});
  const [splitError, setSplitError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('Food');
  const [editPaidBy, setEditPaidBy] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Edit Total Budget State
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [customBudgetVal, setCustomBudgetVal] = useState(currentTrip?.trip.budget || 25000);

  const members = currentTrip?.members || [];
  const metrics = currentTrip?.metrics;
  const expenses = currentTrip?.expenses || [];
  const trip = currentTrip?.trip;

  // Sync paidBy default when members become available
  const firstMemberId = members[0]?.id;
  useEffect(() => {
    if (firstMemberId && !paidBy) {
      setPaidBy(firstMemberId);
    }
  }, [firstMemberId, paidBy]);

  useEffect(() => {
    const numAmount = Number(amount) || 0;
    if (splitType === 'Equal') {
      const share = members.length > 0 ? Math.round((numAmount / members.length) * 100) / 100 : 0;
      const initial: { [id: string]: number } = {};
      members.forEach((m) => {
        initial[m.id] = share;
      });
      setMemberSplits(initial);
      setSplitError(null);
    } else if (splitType === 'Exact' || splitType === 'Custom') {
      setMemberSplits((prev) => {
        const next: { [id: string]: number } = {};
        members.forEach((m) => {
          next[m.id] = prev[m.id] ?? 0;
        });
        return next;
      });
    }
  }, [amount, splitType, members]);

  if (!currentTrip || !trip || !metrics) return null;

  // Real-time calculation
  const totalBudget = trip.budget || 25000;
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentSpent = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

  const handleSplitValueChange = (memberId: string, val: number) => {
    setMemberSplits((prev) => ({
      ...prev,
      [memberId]: val
    }));
  };

  const currentSplitSum = Object.values(memberSplits).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const numAmount = Number(amount) || 0;
  const splitDiff = Math.abs(currentSplitSum - numAmount);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    if (splitType === 'Exact' || splitType === 'Custom') {
      if (splitDiff > 1) {
        setSplitError(
          `Split amounts total ₹${currentSplitSum.toLocaleString('en-IN')}, which must equal the expense amount ₹${numAmount.toLocaleString('en-IN')}.`
        );
        return;
      }
    }

    setSplitError(null);

    // Build splits array
    const splitsPayload: ExpenseSplit[] = members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      amount: splitType === 'Equal' ? Math.round((numAmount / members.length) * 100) / 100 : Number(memberSplits[m.id] || 0)
    }));

    await addExpense({
      title: title.trim(),
      amount: numAmount,
      category,
      paidByMemberId: paidBy || members[0]?.id,
      splitType,
      splits: splitsPayload,
      notes: notes.trim()
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setAddModalOpen(false);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditTitle(exp.title);
    setEditAmount(String(exp.amount));
    setEditCategory(exp.category);
    setEditPaidBy(exp.paidByMemberId || members[0]?.id || '');
    setEditNotes(exp.notes || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editTitle.trim() || !editAmount) return;
    await updateExpense(editingExpense.id, {
      title: editTitle.trim(),
      amount: Number(editAmount),
      category: editCategory,
      paidByMemberId: editPaidBy,
      notes: editNotes.trim()
    });
    setEditingExpense(null);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBudget(Number(customBudgetVal));
    setBudgetModalOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Transport':
        return <Train className="w-4 h-4 text-blue-600" />;
      case 'Accommodation':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'Food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'Activities':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Financial Core
            </span>
            <span className="text-2xs text-slate-500">Live Reactive Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reactive Travel Budget &amp; Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Logged expenses instantly update category allocations, per-member fair share, and the zero-sum settlement plan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCustomBudgetVal(totalBudget);
              setBudgetModalOpen(true);
            }}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            Adjust Budget Target
          </button>

          <button
            type="button"
            onClick={() => {
              setSplitError(null);
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Trip Budget</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{totalBudget.toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">
            ₹{Math.round(totalBudget / Math.max(1, members.length)).toLocaleString('en-IN')} / person
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 text-2xs text-slate-500 mt-1">
            <span>{percentSpent}% of total budget</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Remaining Balance</span>
            <PiggyBank className="w-4 h-4 text-blue-600" />
          </div>
          <div
            className={`text-2xl font-bold ${
              remainingBudget < 0 ? 'text-rose-600' : 'text-indigo-600'
            }`}
          >
            ₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">
            {remainingBudget < 0 ? 'Budget exceeded' : 'Available headroom'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Settlements Required</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {metrics.settlements?.length || 0} Transfers
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">
            ₹{(metrics.settlements?.reduce((s, x) => s + x.amount, 0) || 0).toLocaleString('en-IN')} pending
          </span>
        </div>
      </div>

      {/* Category Breakdown Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Budget Consumption by Category
          </h3>
          <span className="text-2xs text-slate-500">{percentSpent}% used</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          {Object.entries(metrics.categorySpend || {}).map(([cat, amountVal]) => {
            const widthPct = Math.max(0, Math.min(100, ((amountVal as number) / (totalSpent || 1)) * 100));
            const colorClass =
              cat === 'Transport'
                ? 'bg-blue-500'
                : cat === 'Accommodation'
                ? 'bg-purple-500'
                : cat === 'Food'
                ? 'bg-amber-500'
                : cat === 'Activities'
                ? 'bg-emerald-500'
                : 'bg-pink-500';

            return (
              <div
                key={cat}
                style={{ width: `${widthPct}%` }}
                className={`h-full ${colorClass}`}
                title={`${cat}: ₹${(amountVal as number).toLocaleString('en-IN')}`}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1 text-2xs text-slate-600">
          {Object.entries(metrics.categorySpend || {}).map(([cat, amountVal]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  cat === 'Transport'
                    ? 'bg-blue-500'
                    : cat === 'Accommodation'
                    ? 'bg-purple-500'
                    : cat === 'Food'
                    ? 'bg-amber-500'
                    : cat === 'Activities'
                    ? 'bg-emerald-500'
                    : 'bg-pink-500'
                }`}
              />
              <span>
                {cat}: <strong>₹{(amountVal as number).toLocaleString('en-IN')}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Itemized Travel Expenses</h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              {expenses.length} records • Real-time ledger
            </p>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <PiggyBank className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No expenses logged yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Add Expense&quot; above to log transport, meals, tickets, or stays.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((exp) => {
              const payer = members.find((m) => m.id === exp.paidByMemberId);
              return (
                <div
                  key={exp.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{exp.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-3xs font-semibold">
                          {exp.category}
                        </span>
                        {exp.splitType && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-3xs font-semibold">
                            {exp.splitType} Split
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Paid by <strong className="text-slate-700">{payer?.name || 'Group'}</strong>
                        {exp.notes && <span> • {exp.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                      </div>
                      <span className="text-3xs text-slate-400">
                        ₹{Math.round(Number(exp.amount) / Math.max(1, members.length)).toLocaleString('en-IN')} / person
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Expense with Split Support */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900">Add Journey Expense</h3>

            {splitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{splitError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Train Tickets, Metro Card, Royal Haveli Dinner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Transport">Transport (Train/Flight/Cab)</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.role === 'Organizer' ? '(Lead)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Split Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Equal', 'Exact', 'Custom'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSplitType(type)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        splitType === type
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type} Split
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Breakdown Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>Split distribution across {members.length} members:</span>
                  {(splitType === 'Exact' || splitType === 'Custom') && (
                    <span
                      className={`font-semibold ${
                        splitDiff <= 1 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      Sum: ₹{currentSplitSum.toLocaleString('en-IN')} / ₹{numAmount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {members.map((m) => {
                    const equalVal = members.length > 0 ? Math.round((numAmount / members.length) * 100) / 100 : 0;
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-700 truncate font-medium">{m.name}</span>
                        {splitType === 'Equal' ? (
                          <span className="text-slate-500 font-semibold">
                            ₹{equalVal.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-2xs text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={memberSplits[m.id] ?? 0}
                              onChange={(e) =>
                                handleSplitValueChange(m.id, Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 text-xs border border-slate-300 rounded-lg text-right focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Receipt number, payment method, or occasion"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Expense */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Expense</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Transport">Transport (Train/Flight/Cab)</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Food">Food &amp; Dining</option>
                    <option value="Activities">Activities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Paid By</label>
                <select
                  value={editPaidBy}
                  onChange={(e) => setEditPaidBy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Total Budget */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Update Total Budget Target</h3>
            <p className="text-xs text-slate-500">
              Set your target journey budget. All remaining balances and alerts will adjust immediately.
            </p>
            <form onSubmit={handleBudgetSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Total Budget Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={customBudgetVal}
                  onChange={(e) => setCustomBudgetVal(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
