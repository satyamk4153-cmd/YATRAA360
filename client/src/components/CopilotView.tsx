import React, { useState, useEffect, useRef } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  Compass,
  CreditCard,
  CloudRain,
  ShieldCheck,
  Calendar,
  Luggage,
  Coffee
} from 'lucide-react';

interface ChatBubble {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  time: string;
}

export const CopilotView: React.FC = () => {
  const { currentTrip } = useTripStore();
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or update welcome message when currentTrip is available
  useEffect(() => {
    if (currentTrip && messages.length === 0) {
      setMessages([
        {
          id: 'init_copilot',
          sender: 'copilot',
          text: `Namaste! I'm your Yatra Copilot, grounded in your live trip data.\n\n📍 **Route:** ${currentTrip.trip.origin} → ${currentTrip.trip.destination} (${currentTrip.trip.startDate} to ${currentTrip.trip.endDate})\n👥 **Travellers:** ${currentTrip.trip.travellersCount} people\n💰 **Remaining Budget:** ₹${currentTrip.metrics.remainingBudget.toLocaleString('en-IN')}\n🌦️ **Current Weather:** ${currentTrip.weather[0]?.condition || 'Pleasant'} (${currentTrip.weather[0]?.tempC || 20}°C)\n\nAsk me anything: weather adaptations, budget splits, schedule changes, packing advice, food recommendations, or local hidden gems.`,
          time: 'Just now'
        }
      ]);
    }
  }, [currentTrip, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const categories = [
    { label: 'Weather Advisory', icon: CloudRain, question: "It's raining tomorrow, what should we do with our remaining budget?" },
    { label: 'Budget Status', icon: CreditCard, question: "How much money do we have left and what is our daily allowance?" },
    { label: 'Group Splits', icon: Compass, question: "Who owes money in the group and who gets money back?" },
    { label: 'Tomorrow Plan', icon: Calendar, question: "What is my plan and schedule for tomorrow?" },
    { label: 'Hidden Gems', icon: Sparkles, question: "What are the best offbeat places and hidden gems to visit?" },
    { label: 'Local Food', icon: Coffee, question: "What are the best local food and dining recommendations?" },
    { label: 'Packing Checklist', icon: Luggage, question: "What clothes and essentials should I pack for this trip?" },
    { label: 'Road & Transit', icon: Compass, question: "What is the best road route and transit timing between our origin and destination?" }
  ];

  const handleAsk = async (questionText: string) => {
    const textToAsk = questionText.trim();
    if (!textToAsk || !currentTrip) return;
    
    const userMsg: ChatBubble = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToAsk,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askCopilot(currentTrip.trip.id, textToAsk);
      const aiMsg: ChatBubble = {
        id: `ai_${Date.now()}`,
        sender: 'copilot',
        text: res.answer,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'copilot',
          text: `⚠️ Copilot Notice: ${err.message || 'Unable to reach backend copilot engine. Please check connection.'}`,
          time: 'Now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (!currentTrip) return;
    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: 'copilot',
        text: `Chat restarted. I'm ready to assist with your journey to ${currentTrip.trip.destination}!`,
        time: 'Just now'
      }
    ]);
  };

  // Helper function to render text with bolding and bullet styling cleanly
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold rendering within lines: replace **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  if (!currentTrip) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <Bot className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Active Trip Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Please select or create a trip to start using Yatra Copilot.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Context-Aware Travel Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Yatra Copilot</h1>
          <p className="text-xs text-slate-500 mt-1">
            Synchronized with <span className="font-medium text-slate-700">{currentTrip.trip.origin} → {currentTrip.trip.destination}</span> • {currentTrip.trip.travellersCount} travellers • ₹{currentTrip.metrics.remainingBudget.toLocaleString('en-IN')} remaining
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-600" /> Instant Quick Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={i}
                onClick={() => handleAsk(c.question)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[560px]">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 p-5">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isUser
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isUser ? 'You' : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-2xl p-4 rounded-xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  <div className={`flex items-center justify-between text-[10px] mb-2 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                    <span className="font-bold">{isUser ? 'You' : 'Yatra Copilot'}</span>
                    <span>{m.time}</span>
                  </div>
                  <div className="space-y-1">
                    {isUser ? m.text : renderMessageContent(m.text)}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-flex gap-1 text-blue-600">
                  <span className="animate-bounce" style={{animationDelay: '0ms'}}>●</span>
                  <span className="animate-bounce" style={{animationDelay: '150ms'}}>●</span>
                  <span className="animate-bounce" style={{animationDelay: '300ms'}}>●</span>
                </span>
                <span>Consulting live trip dependencies & state...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(query); }} 
          className="p-4 border-t border-slate-200 flex items-center gap-2 bg-slate-50/50 rounded-b-xl"
        >
          <input
            type="text"
            placeholder="Ask about weather alternatives, budget remaining, packing advice, local food, or schedule..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
