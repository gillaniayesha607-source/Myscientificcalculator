/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import * as math from 'mathjs';
import { 
  Calculator as CalcIcon, 
  MessageSquare, 
  History, 
  Settings, 
  Delete, 
  X, 
  ChevronRight,
  Sparkles,
  Send,
  RotateCcw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { solveMathProblem } from './services/geminiService';

type Mode = 'standard' | 'scientific' | 'ai';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('scientific');
  const [history, setHistory] = useState<string[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, aiResponse]);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' || result !== null) ? num : prev + num);
    setResult(null);
  };

  const handleOperator = (op: string) => {
    setDisplay(prev => result !== null ? result + op : prev + op);
    setResult(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setResult(null);
  };

  const handleDelete = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleEqual = () => {
    try {
      const evaluated = math.evaluate(display);
      const formattedResult = math.format(evaluated, { precision: 14 });
      setResult(formattedResult.toString());
      setHistory(prev => [display + ' = ' + formattedResult, ...prev].slice(0, 10));
    } catch (error) {
      setResult('Error');
    }
  };

  const handleScientific = (fn: string) => {
    if (fn === 'sqrt') {
      setDisplay(prev => `sqrt(${prev})`);
    } else if (fn === 'pow') {
      setDisplay(prev => prev + '^');
    } else {
      setDisplay(prev => `${fn}(${prev})`);
    }
    setResult(null);
  };

  const handleAiSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = aiQuery;
    setAiQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    const response = await solveMathProblem(userMsg, chatHistory);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response || "No response" }]);
    setIsAiLoading(false);
  };

  const buttons = [
    { label: 'C', action: handleClear, className: 'text-red-400' },
    { label: '(', action: () => handleOperator('('), className: 'text-emerald-400' },
    { label: ')', action: () => handleOperator(')'), className: 'text-emerald-400' },
    { label: '÷', action: () => handleOperator('/'), className: 'text-emerald-400' },
    
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '×', action: () => handleOperator('*'), className: 'text-emerald-400' },
    
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '-', action: () => handleOperator('-'), className: 'text-emerald-400' },
    
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '+', action: () => handleOperator('+'), className: 'text-emerald-400' },
    
    { label: '0', action: () => handleNumber('0'), className: 'col-span-1' },
    { label: '.', action: () => handleNumber('.') },
    { label: 'DEL', action: handleDelete, className: 'text-orange-400' },
    { label: '=', action: handleEqual, className: 'bg-emerald-600 text-white hover:bg-emerald-500' },
  ];

  const scientificButtons = [
    { label: 'sin', action: () => handleScientific('sin') },
    { label: 'cos', action: () => handleScientific('cos') },
    { label: 'tan', action: () => handleScientific('tan') },
    { label: 'log', action: () => handleScientific('log10') },
    { label: 'ln', action: () => handleScientific('log') },
    { label: 'π', action: () => handleNumber('pi') },
    { label: 'e', action: () => handleNumber('e') },
    { label: '^', action: () => handleScientific('pow') },
    { label: '√', action: () => handleScientific('sqrt') },
    { label: '!', action: () => handleOperator('!') },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-gray-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Header Section */}
        <header className="lg:col-span-12 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CalcIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">AI Scientific</h1>
              <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Precision v2.4</p>
            </div>
          </div>
          
          <nav className="flex bg-gray-900/50 p-1 rounded-xl border border-white/5">
            {[
              { id: 'standard', icon: CalcIcon, label: 'Standard' },
              { id: 'scientific', icon: Settings, label: 'Scientific' },
              { id: 'ai', icon: Sparkles, label: 'AI Solver' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id as Mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  mode === item.id 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Main Calculator Body */}
        <main className="lg:col-span-7 space-y-4">
          <div className="bg-[#15171C] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
            {/* Display Area */}
            <div className="p-8 bg-black/20 border-bottom border-white/5 relative">
              <div className="absolute top-4 right-6 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              </div>
              
              <div className="text-right space-y-2 min-h-[120px] flex flex-col justify-end">
                <div className="text-gray-500 font-mono text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {display}
                </div>
                <div className="text-5xl font-light tracking-tighter text-white overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {result || display}
                </div>
              </div>
            </div>

            {/* Keypad */}
            <div className="p-6 grid grid-cols-4 gap-3">
              {mode === 'scientific' && (
                <div className="col-span-4 grid grid-cols-5 gap-2 mb-4 p-3 bg-black/20 rounded-2xl border border-white/5">
                  {scientificButtons.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="py-2 text-xs font-mono text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              {buttons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className={`
                    h-16 rounded-2xl text-xl font-medium transition-all active:scale-95
                    ${btn.className || 'bg-white/5 hover:bg-white/10 text-gray-200'}
                    ${btn.label === '=' ? 'shadow-lg shadow-emerald-500/20' : ''}
                  `}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Panel (Mobile/Small Screen) */}
          <div className="lg:hidden bg-[#15171C] rounded-2xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-medium">
              <History className="w-4 h-4" />
              Recent Calculations
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-gray-600 italic">No history yet</p>
              ) : (
                history.map((item, i) => (
                  <div key={i} className="text-sm font-mono text-gray-500 border-b border-white/5 pb-2 last:border-0">
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Side Panel: AI Solver & History */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Chat Interface */}
          <div className="flex-1 bg-[#15171C] rounded-3xl border border-white/5 shadow-xl flex flex-col overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-white/5 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">AI Math Assistant</span>
              </div>
              <button 
                onClick={() => setChatHistory([])}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 transition-colors"
                title="Clear Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-emerald-500/50" />
                  </div>
                  <div>
                    <h3 className="text-gray-300 font-medium">Ask anything</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      "Solve for x: 2x² + 5x - 3 = 0"<br/>
                      "Explain the Pythagorean theorem"<br/>
                      "What is the derivative of sin(x)?"
                    </p>
                  </div>
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-3 rounded-2xl text-sm
                    ${msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'}
                  `}>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAiSubmit} className="p-4 bg-black/20 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a math question..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop History Panel */}
          <div className="hidden lg:block bg-[#15171C] rounded-3xl border border-white/5 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <History className="w-4 h-4" />
                History
              </div>
              <button 
                onClick={() => setHistory([])}
                className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-20">
                  <History className="w-8 h-8 mb-2" />
                  <p className="text-xs">Empty</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <div 
                    key={i} 
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      const [expr] = item.split(' = ');
                      setDisplay(expr);
                      setResult(null);
                    }}
                  >
                    <div className="text-xs font-mono text-gray-500 truncate mr-2">
                      {item}
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-emerald-500 transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Footer Info */}
        <footer className="lg:col-span-12 flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <span>Engine: Math.js 12.0</span>
            <span>AI: Gemini 3 Flash</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>Built for Scientific Accuracy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
