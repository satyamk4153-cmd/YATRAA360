import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Users,
  Plus,
  Trash2,
  Crown,
  CheckCircle2,
  ArrowRightLeft,
  Sparkles,
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

  const { members, metrics, trip, accommodations } = currentTrip;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await addMember({ name, email, phone, role });
    setName('');
    setEmail('');
    setPhone('');
    setAddModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Group Management</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Group & Expense Splitting</h1>
          <p className="text-xs text-slate-500 mt-1">
            Adding or removing members automatically updates per-person costs, hotel rooms, and the balance matrix.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Group Size</span>
          <div className="text-2xl font-bold text-slate-900">{members.length} Members</div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Requires {Math.ceil(members.length / 2)} Hotel Rooms
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Equal Share per Person</span>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{Math.round(metrics.totalSpent / Math.max(1, members.length)).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Based on ₹{metrics.totalSpent.toLocaleString('en-IN')} total spending
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Per-Person Budget Target</span>
          <div className="text-2xl font-bold text-blue-700">
            ₹{Math.round(metrics.totalBudget / Math.max(1, members.length)).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total Budget: ₹{metrics.totalBudget.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Grid: Members List vs Split Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left: Members List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>Trip Members ({members.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              {accommodations[0]?.roomCount || Math.ceil(members.length / 2)} Rooms
            </span>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{member.name}</span>
                      {member.role === 'Organizer' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold border border-amber-200 flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Organizer
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Paid</span>
                    <span className="text-xs font-bold text-slate-800">₹{member.paidAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {member.role !== 'Organizer' && (
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Splitwise-style Balance Matrix */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
              <span>Split Settlement</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Net
            </span>
          </div>

          <div className="space-y-3">
            {metrics.groupBalances.map((b) => {
              const isPositive = b.netBalance > 0;
              const isZero = b.netBalance === 0;

              return (
                <div
                  key={b.memberId}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Paid: ₹{b.paid.toLocaleString('en-IN')} • Fair Share: ₹{b.shouldPay.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    {isZero ? (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                      </span>
                    ) : isPositive ? (
                      <div>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Gets Back</span>
                        <span className="text-xs font-bold text-emerald-700">+₹{b.netBalance.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-red-600 block font-semibold">Owes Group</span>
                        <span className="text-xs font-bold text-red-600">−₹{Math.abs(b.netBalance).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Settle via UPI / QR
            </span>
            <button className="px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] transition-colors cursor-pointer">
              Settle Balances
            </button>
          </div>
        </div>

      </div>

      {/* Add Member Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full border border-slate-200 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Group Member</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Adding a member will recalculate group expenses, room allocations, and per-person budget.
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
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
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
