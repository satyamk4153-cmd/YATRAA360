import React from 'react';
import { useTripStore } from '../store/tripStore';
import { jsPDF } from 'jspdf';
import {
  History,
  FileDown,
  Clock
} from 'lucide-react';

export const TripHistoryView: React.FC = () => {
  const { currentTrip, addToast } = useTripStore();

  if (!currentTrip) return null;

  const { changeLogs, trip, metrics, transports, accommodations, itinerary } = currentTrip;

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(22);
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text('YATRAA — Travel Planner', 14, y);
      y += 8;

      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`Trip: ${trip.title}`, 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`${trip.origin} → ${trip.destination} | ${trip.startDate} to ${trip.endDate}`, 14, y);
      y += 10;

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Travellers: ${trip.travellersCount} Pax`, 18, y + 8);
      doc.text(`Total Budget: INR ${metrics.totalBudget.toLocaleString('en-IN')}`, 18, y + 16);
      doc.text(`Total Spent: INR ${metrics.totalSpent.toLocaleString('en-IN')}`, 100, y + 8);
      doc.text(`Remaining: INR ${metrics.remainingBudget.toLocaleString('en-IN')}`, 100, y + 16);
      doc.text(`Budget Status: ${metrics.budgetHealthStatus}`, 18, y + 24);
      y += 36;

      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text('1. Transport & Bookings', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      transports.forEach(t => {
        doc.text(`• [${t.isReturn ? 'RETURN' : 'OUTBOUND'}] ${t.provider} | Dep: ${t.departureTime} (${t.departureStation}) -> Arr: ${t.arrivalTime} (${t.arrivalStation}) | PNR: ${t.pnr}`, 16, y);
        y += 5;
      });

      if (accommodations.length > 0) {
        const acc = accommodations[0];
        doc.text(`• [HOTEL] ${acc.name} (${acc.roomCount} Rooms) | ${acc.address} | Check-in: ${acc.checkIn}`, 16, y);
        y += 7;
      }

      y += 4;

      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text('2. Daily Itinerary', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      itinerary.forEach(day => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`Day ${day.dayNumber} (${day.date}): ${day.theme}`, 16, y);
        doc.setFont('helvetica', 'normal');
        y += 5;

        day.items.forEach(item => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`   - ${item.startTime}-${item.endTime}: ${item.title} (${item.location})`, 18, y);
          y += 4.5;
        });
        y += 3;
      });

      y += 4;

      if (y > 260) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setTextColor(29, 78, 216);
      doc.text('3. Group Expense Settlements', 14, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      if (metrics.settlements && metrics.settlements.length > 0) {
        metrics.settlements.forEach((s) => {
          doc.text(`• ${s.fromMemberName} pays ${s.toMemberName}: INR ${s.amount.toLocaleString('en-IN')}`, 16, y);
          y += 5;
        });
      } else {
        doc.text('• All group balances are fully settled.', 16, y);
        y += 5;
      }

      doc.save(`YATRAA_Trip_${trip.destination}_${trip.startDate}.pdf`);
      addToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      addToast(`PDF error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Audit & Export</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Trip History & PDF Export</h1>
          <p className="text-xs text-slate-500 mt-1">
            Timestamped audit log of all trip modifications, plus a full offline PDF manifest.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-5 py-2.5 rounded-lg font-bold text-xs bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <FileDown className="w-4 h-4" />
          <span>Download Trip PDF</span>
        </button>
      </div>

      {/* Change Logs Timeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-700" />
            <span>Change History ({changeLogs.length} Events)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Newest first</span>
        </div>

        {changeLogs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No changes logged yet. Modify your trip to see the history here.
          </div>
        ) : (
          <div className="space-y-3">
            {changeLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {log.timestamp} — {log.fieldChanged}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200">
                    {log.oldValue} → <strong className="text-blue-700">{log.newValue}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {log.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
