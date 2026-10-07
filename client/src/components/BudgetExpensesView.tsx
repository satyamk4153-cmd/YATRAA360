import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { ExpenseCategory, Expense } from '../types';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Utensils,
  Train,
  Building2,
  Car,
  HelpCircle,
  CheckCircle2,
  PiggyBank
} from 'lucide-react';

export const BudgetExpensesView: React.FC = () => {
  const { currentTrip, addExpense, updateExpense, deleteExpense, updateBudget } = useTripStore();

  // Add Expense State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseCategory>('Food');
  const [editNotes, setEditNotes] = useState('');

  // Edit Total Budget State
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [customBudgetVal, setCustomBudgetVal] = useState(currentTrip?.trip.budget || 25000);

  if (!currentTrip) return null;

  const { metrics, expenses, members, trip } = currentTrip;

  // Real-time calculation
  const totalBudget = trip.budget || 25000;
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentSpent = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    await addExpense({
      title,
      amount: Number(amount),
      category,
      paidByMemberId: paidBy || members[0]?.id,
      notes
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
    setEditNotes(exp.notes || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editTitle || !editAmount) return;
    await updateExpense(editingExpense.id, {
      title: editTitle,
      amount: Number(editAmount),
      category: editCategory,
      notes: editNotes
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
      case 'Transport': return <Train className="w-4 h-4 text-blue-600" />;
      case 'Accommodation': return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'Food': return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'Activities': return <Car className="w-4 h-4 text-emerald-600" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4 text-pink-600" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Financial Management
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Real-Time Reactive Travel Budget
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Budget − Total Spent = Remaining Balance. Any change immediately recalculates per-person splits and alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCustomBudgetVal(totalBudget);
              setBudgetModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Edit Total Budget
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Total Budget</span>
          <div className="text-2xl font-bold text-slate-900">₹{totalBudget.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-blue-600 block">
            ₹{Math.round(totalBudget / Math.max(1, trip.travellersCount)).toLocaleString('en-IN')} per traveller
          </span>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Total Spent</span>
          <div className="text-2xl font-bold text-amber-700">₹{totalSpent.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 block">
            {percentSpent}% of total allocated budget
          </span>
        </div>

        {/* Remaining Budget Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">Remaining Budget</span>
          <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            ₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <span className={`text-[11px] font-medium block ${remainingBudget < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {remainingBudget < 0 ? 'Budget exceeded' : 'Healthy remaining funds'}
          </span>
        </div>

      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Budget Utilization</span>
          <span className="font-semibold text-slate-800">{percentSpent}% used</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percentSpent > 90 ? 'bg-red-600' : percentSpent > 70 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>
      </div>

      {/* Main Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Logged Journey Expenses ({expenses.length})</h3>
            <p className="text-xs text-slate-500">Itemized log with real-time recalculations.</p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
          >
            + Log New
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No expenses logged yet. Click "Add Expense" to track train/flight fares, food, hotels, or local transfers.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{exp.title}</h4>
                    <p className="text-xs text-slate-500">
                      {exp.category} • Paid by: <span className="font-medium text-slate-700">{exp.paidByName || 'Organizer'}</span>
                      {exp.notes ? ` • ${exp.notes}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ₹{Math.round(Number(exp.amount) / Math.max(1, trip.travellersCount)).toLocaleString('en-IN')} / person
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(exp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="Edit expense"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Expense */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Journey Expense</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Train Tickets, Metro Pass, Dinner at Karim's"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Edit Expense</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Update Total Budget</h3>
            <p className="text-xs text-slate-500">
              Set your target journey budget. All remaining balances and alerts will adjust immediately.
            </p>
            <form onSubmit={handleBudgetSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Total Budget Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={customBudgetVal}
                  onChange={(e) => setCustomBudgetVal(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
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
