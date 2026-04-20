'use client';

import { useState } from 'react';
import { useResearchStock } from '../hooks/useAI';
import { Company, Financial, FinancialRatio } from '../types/market';
import { Send, Bot, User, TrendingUp, AlertTriangle } from 'lucide-react';
interface AIAssistantProps {
  ticker: string;
  company: Company;
  financials: Financial[];
  ratios: FinancialRatio | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: {
    valuation_summary?: string;
    growth_signals?: string[];
    risk_factors?: string[];
    overall_assessment?: string;
  };
}

export default function AIAssistant({
  ticker,
  company,
  financials: _financials,
  ratios: _ratios,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI research assistant. Ask me anything about ${company.name} (${ticker}).`,
    },
  ]);
  const [input, setInput] = useState('');
  const researchStock = useResearchStock();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await researchStock.mutateAsync({
        ticker,
        question: input,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: 'Here is my analysis:',
        data: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error analyzing this stock. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="flex items-center mb-4">
        <Bot className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">AI Research Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start mb-2">
                {message.role === 'user' ? (
                  <User className="h-4 w-4 mr-2 mt-0.5" />
                ) : (
                  <Bot className="h-4 w-4 mr-2 mt-0.5" />
                )}
                <p className="text-sm">{message.content}</p>
              </div>

              {message.data && (
                <div className="mt-4 space-y-4">
                  {message.data.valuation_summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Valuation Summary</h4>
                      <p className="text-sm">{message.data.valuation_summary}</p>
                    </div>
                  )}

                  {message.data.growth_signals && message.data.growth_signals.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 text-success" />
                        Growth Signals
                      </h4>
                      <ul className="text-sm space-y-1">
                        {message.data.growth_signals.map((signal, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message.data.risk_factors && message.data.risk_factors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1 text-danger" />
                        Risk Factors
                      </h4>
                      <ul className="text-sm space-y-1">
                        {message.data.risk_factors.map((risk, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message.data.overall_assessment && (
                    <div>
                      <h4 className="font-semibold mb-2">Overall Assessment</h4>
                      <p className="text-sm font-medium">{message.data.overall_assessment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {researchStock.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-gray-600">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about valuation, growth prospects, risks..."
          className="flex-1 input"
          disabled={researchStock.isPending}
        />
        <button
          type="submit"
          disabled={researchStock.isPending || !input.trim()}
          className="btn btn-primary"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
