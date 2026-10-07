import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  Vote,
  Shield,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ChatMessage } from '../types';

export const TravelConnectView: React.FC = () => {
  const { currentTrip, addToast } = useTripStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [soloConnectActive, setSoloConnectActive] = useState(false);

  const [votes, setVotes] = useState({
    joginiFalls: { up: 3, down: 0, userVoted: 'UP' },
    naggarCastle: { up: 4, down: 0, userVoted: 'UP' },
    dhamLunch: { up: 4, down: 0, userVoted: 'UP' }
  });

  useEffect(() => {
    if (currentTrip) {
      loadMessages();
    }
  }, [currentTrip]);

  const loadMessages = async () => {
    if (!currentTrip) return;
    const msgs = await api.getChat(currentTrip.trip.id);
    setMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !currentTrip) return;
    try {
      const msg = await api.sendChatMessage(currentTrip.trip.id, inputMsg, currentTrip.members[0]?.name || 'You');
      setMessages([...messages, msg]);
      setInputMsg('');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const castVote = (pollKey: keyof typeof votes, type: 'UP' | 'DOWN') => {
    setVotes(prev => {
      const curr = prev[pollKey];
      const diff = type === 'UP' ? { up: curr.up + 1 } : { down: curr.down + 1 };
      return {
        ...prev,
        [pollKey]: { ...curr, ...diff, userVoted: type }
      };
    });
    addToast('Vote recorded!', 'success');
  };

  if (!currentTrip) return null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Collaborative Communication</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Travel Connect</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time group chat, activity voting polls, and privacy-first solo traveller networking.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
          <Shield className="w-4 h-4 text-emerald-600" />
          <div className="text-slate-700">
            <span className="font-semibold block">Available to Connect</span>
            <span className="text-[10px] text-slate-500">No phone number shared</span>
          </div>
          <input
            type="checkbox"
            checked={soloConnectActive}
            onChange={(e) => {
              setSoloConnectActive(e.target.checked);
              addToast(e.target.checked ? 'Solo Connect activated for your region' : 'Solo Connect hidden', 'info');
            }}
            className="w-4 h-4 accent-blue-600 cursor-pointer ml-2"
          />
        </div>
      </div>

      {/* Main Grid: Chatroom vs Activity Voting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Group Chat Room */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Group Chat ({currentTrip.members.length} Members)</h3>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((msg) => {
              const isMe = msg.senderName.includes('You') || msg.senderId === 'mem_satyam';
              const isAi = msg.isAi;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAi ? 'bg-blue-700 text-white' : isMe ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isAi ? 'AI' : msg.senderName.charAt(0)}
                  </div>

                  <div className={`max-w-md p-3 rounded-xl text-xs ${
                    isMe
                      ? 'bg-blue-700 text-white rounded-tr-none'
                      : isAi
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 rounded-tl-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Message your fellow travellers..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right 1 Col: Activity Voting & Polls */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Vote className="w-4 h-4 text-blue-700" />
                <span>Activity Polls</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Group Vote</span>
            </div>

            {/* Poll 1 */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Jogini Falls Upper Trek (Day 2)</h4>
              <p className="text-[11px] text-slate-500">Off-beat nature hike with mountain views.</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-700 font-bold">{votes.joginiFalls.up} Approve</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => castVote('joginiFalls', 'UP')}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => castVote('joginiFalls', 'DOWN')}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Poll 2 */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Traditional Himachali Dham (Day 2)</h4>
              <p className="text-[11px] text-slate-500">7-course heritage feast experience.</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-700 font-bold">{votes.dhamLunch.up} Approve</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => castVote('dhamLunch', 'UP')}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => castVote('dhamLunch', 'DOWN')}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
            💡 When 75% of members vote Approve, the item is auto-scheduled into the itinerary.
          </div>
        </div>

      </div>

    </div>
  );
};
