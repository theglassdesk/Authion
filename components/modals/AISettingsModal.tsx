"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { AIProvider } from '@/lib/types';
import { X, Sparkles, Key, Server, Cpu, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AISettingsModalProps {
  onClose: () => void;
}

export function AISettingsModal({ onClose }: { onClose: () => void }) {
  const { aiSettings, setAiSettings } = useAppStore();
  const [provider, setProvider] = useState<AIProvider>(aiSettings.provider || 'Google');
  const [model, setModel] = useState(aiSettings.model || 'gemini-2.5-flash');
  const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
  const [localEndpoint, setLocalEndpoint] = useState(aiSettings.localEndpoint || 'http://localhost:11434');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  const providerModels: Record<AIProvider, string[]> = {
    Google: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    OpenAI: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    OpenRouter: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-70b-instruct', 'deepseek/deepseek-r1'],
    Local: ['llama3', 'mistral', 'qwen2.5', 'phi3', 'custom'],
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    setModel(providerModels[newProvider][0]);
    setTestStatus({ loading: false });
  };

  const handleSave = () => {
    setAiSettings({
      provider,
      model,
      apiKey,
      localEndpoint,
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    try {
      if (provider === 'Local') {
        const res = await fetch(`${localEndpoint}/api/tags`, { method: 'GET' });
        if (res.ok) {
          setTestStatus({ loading: false, success: true, message: 'Connected to local LLM server!' });
        } else {
          setTestStatus({ loading: false, success: false, message: `Could not reach ${localEndpoint}. Is Ollama running with OLLAMA_ORIGINS=*?` });
        }
      } else {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Say "Connection successful" in two words.',
            model,
            provider,
            apiKey: apiKey || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok && data.text) {
          setTestStatus({ loading: false, success: true, message: 'AI Connection verified successfully!' });
        } else {
          setTestStatus({ loading: false, success: false, message: data.error || 'Connection test failed.' });
        }
      }
    } catch (err: any) {
      setTestStatus({ loading: false, success: false, message: err.message || 'Connection failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI Privacy & Engine Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure your local or cloud LLM provider</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Provider Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Google', 'OpenAI', 'OpenRouter', 'Local'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    provider === p
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {p === 'Local' && <Cpu className="w-4 h-4" />}
                  {p === 'Google' && <Sparkles className="w-4 h-4" />}
                  {p === 'OpenAI' && <Key className="w-4 h-4" />}
                  {p === 'OpenRouter' && <Server className="w-4 h-4" />}
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Local Provider Info */}
          {provider === 'Local' ? (
            <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Local-First & Enhanced Privacy:</strong> Prompts are processed strictly on your computer (via Ollama or LM Studio). No text leaves your machine.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300">
              Cloud models allow high-intelligence reasoning and outlines with your private API credentials or default environment key.
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Model Name / Identifier
            </label>
            <div className="flex space-x-2">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              >
                {providerModels[provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or custom model..."
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* API Key or Endpoint */}
          {provider === 'Local' ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Local Endpoint URL
              </label>
              <input
                type="text"
                value={localEndpoint}
                onChange={(e) => setLocalEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default Ollama port is 11434; LM Studio is typically 1234.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {provider} API Key {provider === 'Google' && '(Optional, defaults to server secret)'}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'Google' ? "Using default server Gemini key or custom key" : `Enter your ${provider} API Key`}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">API keys are stored securely in browser local storage and never logged.</p>
            </div>
          )}

          {/* Test Status feedback */}
          {testStatus.message && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              testStatus.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {testStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus.loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {testStatus.loading ? 'Testing...' : 'Test Connection'}
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
