import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Users,
  Plus,
  Trash2,
  Crown,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Wallet,
  Scale,
  Receipt,
  X
} from 'lucide-react';

export const GroupManagerView: React.FC = () => {
  const { currentTrip, addMember, deleteMember } = useTripStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Member' | 'Co-Leader'>('Member');

  if (!currentTrip) return null;

  const { members, metrics, accommodations } = currentTrip;
  const settlements = metrics.settlements || [];
  const outstandingAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  const settledCount = metrics.groupBalances.filter((b) => b.netBalance === 0).length;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addMember({ name: name.trim(), email: email.trim(), phone: phone.trim(), role });
    setName('');
    setEmail('');
    setPhone('');
    setRole('Member');
    setAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Split Engine
            </span>
            <span className="text-2xs text-slate-500">Algorithmic Debt Simplification</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Group &amp; Expense Splits</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Calculates exact minimum settlement transactions so you know exactly who gives money to whom,
            avoiding circular debts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Expenses</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{metrics.totalSpent.toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">
            Across {currentTrip.expenses?.length || 0} logged items
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Member Count</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{members.length} People</div>
          <span className="text-2xs text-slate-500 mt-1 block">
            Requires {accommodations[0]?.roomCount || Math.ceil(members.length / 2)} rooms
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Fair Share / Person</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            ₹{Math.round(metrics.totalSpent / Math.max(1, members.length)).toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">Target per traveller</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Outstanding Settlements</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            ₹{outstandingAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-2xs text-slate-500 mt-1 block">
            {settlements.length} transfers needed • {settledCount} settled
          </span>
        </div>
      </div>

      {/* Main Content: Members Ledger & Settlement Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Member Ledger */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Group Members &amp; Balances</span>
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">Who paid vs fair share</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {members.length} members
            </span>
          </div>

          <div className="space-y-3">
            {metrics.groupBalances.map((b) => {
              const memberRecord = members.find((m) => m.id === b.memberId);
              const isPositive = b.netBalance > 0;
              const isZero = b.netBalance === 0;

              return (
                <div
                  key={b.memberId}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{b.name}</h4>
                          {memberRecord?.role === 'Organizer' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-3xs font-bold flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> Lead
                            </span>
                          )}
                        </div>
                        <p className="text-3xs text-slate-500 truncate">
                          {memberRecord?.email || 'No email attached'}
                        </p>
                      </div>
                    </div>

                    {memberRecord?.role !== 'Organizer' && (
                      <button
                        type="button"
                        onClick={() => deleteMember(b.memberId)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-2xs">
                    <div>
                      <span className="text-slate-500 block text-3xs uppercase tracking-wider">Paid</span>
                      <span className="font-semibold text-slate-800">
                        ₹{b.paid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-3xs uppercase tracking-wider">Fair Share</span>
                      <span className="font-semibold text-slate-800">
                        ₹{b.shouldPay.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-3xs uppercase tracking-wider">Net Balance</span>
                      {isZero ? (
                        <span className="font-semibold text-slate-500">Settled (₹0)</span>
                      ) : isPositive ? (
                        <span className="font-bold text-emerald-600">
                          +₹{b.netBalance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="font-bold text-rose-600">
                          -₹{Math.abs(b.netBalance).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Algorithmic Settlement Plan */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Settlement Plan (Who Pays Whom)</span>
                </h3>
              </div>
              <p className="text-2xs text-slate-500 mt-0.5">
                Optimized payment flow to clear all group debts with minimum transactions
              </p>
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {settlements.length} Transactions
            </span>
          </div>

          {settlements.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">All Expenses Settled</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All travellers have paid exactly their fair share. No pending settlements are required.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement, idx) => (
                <div
                  key={settlement.id || `settlement_${idx}`}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Debtor */}
                    <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 min-w-[120px] text-center">
                      <span className="text-3xs uppercase font-bold text-rose-600 block">PAYS</span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {settlement.fromMemberName}
                      </span>
                    </div>

                    {/* Arrow with amount badge */}
                    <div className="flex flex-col items-center justify-center px-1 shrink-0">
                      <div className="flex items-center gap-1 text-slate-400">
                        <div className="w-4 h-0.5 bg-slate-300" />
                        <ArrowRight className="w-4 h-4 text-indigo-600" />
                      </div>
                    </div>

                    {/* Creditor */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 min-w-[120px] text-center">
                      <span className="text-3xs uppercase font-bold text-emerald-600 block">RECEIVES</span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {settlement.toMemberName}
                      </span>
                    </div>
                  </div>

                  {/* Transfer Amount & Plain English Sentence */}
                  <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                    <div className="text-base font-extrabold text-slate-900">
                      ₹{settlement.amount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{settlement.fromMemberName}</span> pays{' '}
                      <span className="font-semibold text-slate-700">{settlement.toMemberName}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Practical Info Callout */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
            <Scale className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-2xs leading-relaxed text-indigo-800">
              <strong>Zero-Sum Guarantee:</strong> Every expense logged or modified immediately triggers
              the greedy bipartite graph debt-simplification algorithm on the backend to maintain an exact
              zero-sum settlement plan.
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Group Member</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Adding a member will immediately update group expense splits, hotel room counts, and settlement paths.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Trip Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Member' | 'Co-Leader')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Member">Member</option>
                  <option value="Co-Leader">Co-Leader</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
