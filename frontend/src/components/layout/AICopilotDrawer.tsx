import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AssistantQueryResponse } from '../../types';
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  Bot,
  User,
  ShieldAlert,
  ArrowRight,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  responseObj?: AssistantQueryResponse;
  timestamp: string;
}

export const AICopilotDrawer: React.FC = () => {
  const { 
    isCopilotOpen, 
    setIsCopilotOpen, 
    selectedParcel, 
    userRole, 
    setCurrentView,
    copilotQueryToInject,
    setCopilotQueryToInject
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Hello ${userRole}. I am **TerraShield AI**, your context-aware geospatial intelligence copilot.\n\nI have loaded spatial telemetry and hazard layers for **${selectedParcel?.name || 'Orion Coastal Basin'}**.\n\nAsk me any location-specific questions, or select a quick query below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPills = [
    "Evaluate this plot for flood exposure",
    "Which repairs should be prioritized under $1.2M?",
    "Trace infrastructure cascading failures",
    "Explain the land suitability score for residential use",
    "What data sources are missing for this location?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (copilotQueryToInject) {
      handleSend(copilotQueryToInject);
      setCopilotQueryToInject(null);
    }
  }, [copilotQueryToInject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const resp = await api.queryAssistant(textToSend, {
        selected_parcel_id: selectedParcel?.id,
        user_role: userRole
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: resp.answer,
        responseObj: resp,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          content: 'Apologies, I encountered a temporary connection glitch while parsing geospatial layers. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (actionName: string) => {
    if (actionName === 'open_land_intelligence') setCurrentView('land');
    else if (actionName === 'open_3d_view') setCurrentView('digital-twin');
    else if (actionName === 'open_simulator') setCurrentView('simulator');
    else if (actionName === 'open_infrastructure') setCurrentView('infrastructure');
    else if (actionName === 'open_recovery') setCurrentView('recovery');
    else if (actionName === 'open_reports') setCurrentView('reports');
    else if (actionName === 'open_map') setCurrentView('map');
  };

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-ts-card border-l border-ts-card-border backdrop-blur-2xl shadow-2xl z-50 flex flex-col transition-all select-text">
      {/* Drawer Header */}
      <div className="h-16 px-4 border-b border-ts-card-border bg-ts-header flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ts-primary to-ts-secondary flex items-center justify-center text-slate-950">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono font-bold text-xs text-ts-text flex items-center space-x-1.5">
              <span>TERRASHIELD COPILOT</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-ts-primary/20 text-ts-primary border border-ts-primary/40 font-mono">
                RAG v1.0
              </span>
            </div>
            <div className="text-[10px] text-ts-muted">
              Context: {selectedParcel?.name || 'Regional Grid'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCopilotOpen(false)}
          className="w-8 h-8 rounded-lg hover:bg-ts-bg flex items-center justify-center text-ts-muted hover:text-ts-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
              msg.sender === 'user' 
                ? 'bg-ts-accent text-slate-950 font-bold' 
                : 'bg-ts-primary/20 text-ts-primary border border-ts-primary/40'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[85%] space-y-2`}>
              <div className={`p-3 rounded-xl border leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-ts-accent/15 border-ts-accent/40 text-ts-text rounded-tr-none'
                  : 'bg-ts-bg/80 border-ts-card-border text-ts-text rounded-tl-none shadow-md'
              }`}>
                <div className="whitespace-pre-line prose prose-invert prose-xs">
                  {msg.content}
                </div>

                {/* Hypothetical Simulation Badge */}
                {msg.responseObj?.is_hypothetical_context && (
                  <div className="mt-2 text-[10px] font-mono px-2 py-1 rounded bg-ts-danger/10 border border-ts-danger/30 text-ts-danger flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>Hypothetical scenario evaluation output</span>
                  </div>
                )}
              </div>

              {/* Sourced Citations Accordion */}
              {msg.responseObj?.sources && msg.responseObj.sources.length > 0 && (
                <div className="p-2 rounded-lg bg-ts-card border border-ts-card-border/80 text-[11px] space-y-1.5">
                  <div className="font-mono text-[10px] text-ts-primary flex items-center space-x-1 font-semibold">
                    <Database className="w-3 h-3" />
                    <span>CITED DATA SOURCES ({msg.responseObj.sources.length}):</span>
                  </div>
                  {msg.responseObj.sources.map((src, i) => (
                    <div key={i} className="pl-2 border-l-2 border-ts-primary/50 text-[10px] text-ts-muted">
                      <div className="font-medium text-ts-text">{src.dataset_name}</div>
                      <div className="text-ts-muted/80">{src.provider} • {src.observation_date}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Actions Buttons */}
              {msg.responseObj?.suggested_actions && msg.responseObj.suggested_actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.responseObj.suggested_actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionClick(act.action)}
                      className="px-2.5 py-1 rounded-md bg-ts-primary/10 hover:bg-ts-primary/25 border border-ts-primary/40 text-ts-primary text-[10px] font-mono font-medium flex items-center space-x-1 transition-all"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}

              <div className={`text-[9px] text-ts-muted font-mono ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-ts-primary text-xs font-mono p-3 bg-ts-bg/50 rounded-xl border border-ts-card-border animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>TerraShield RAG querying topological & hazard layers...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="p-2 border-t border-ts-card-border bg-ts-bg/60 overflow-x-auto whitespace-nowrap space-x-1.5 flex items-center">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-ts-card hover:bg-ts-primary/15 border border-ts-card-border hover:border-ts-primary/50 text-ts-muted hover:text-ts-text transition-all shrink-0 font-sans"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-ts-card-border bg-ts-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about parcel risk, recovery budget, or detours..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-ts-bg border border-ts-card-border rounded-xl px-3 py-2 text-xs text-ts-text focus:outline-none focus:border-ts-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-ts-primary hover:bg-ts-primary/80 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-ts-primary/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
