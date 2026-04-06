import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import type { LogEntry } from '../../types';
import { formatTime } from '../../utils/formatters';
import clsx from 'clsx';

interface AgentLogProps {
  entries: LogEntry[];
  isRunning: boolean;
  hasError: boolean;
}

export function AgentLog({ entries, isRunning, hasError }: AgentLogProps) {
  const [expanded, setExpanded] = useState(isRunning || hasError);
  const [copied, setCopied] = useState(false);

  if (entries.length === 0 && !isRunning) return null;

  const shouldAutoCollapse = !isRunning && !hasError && entries.length > 0;

  const handleCopy = () => {
    const text = entries.map((e) => `[${formatTime(e.timestamp)}] [${e.type}] ${e.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpanded = expanded || isRunning || hasError;

  return (
    <div className="rounded-lg border border-surface-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-surface-800 text-surface-300 text-sm hover:bg-surface-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-medium">Agent Activity Log</span>
          {isRunning && <span className="text-blue-400 text-xs">(běží...)</span>}
          {hasError && <span className="text-red-400 text-xs">(chyba)</span>}
          {shouldAutoCollapse && !isExpanded && (
            <span className="text-surface-500 text-xs">({entries.length} záznamů)</span>
          )}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="p-1 rounded hover:bg-surface-600 text-surface-400"
          title="Kopírovat log"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </button>

      {isExpanded && (
        <div className="bg-surface-900 p-4 max-h-64 overflow-y-auto font-mono text-xs leading-relaxed">
          {entries.map((entry, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-3 py-0.5',
                entry.type === 'error' && 'text-red-400 bg-red-950/30 -mx-4 px-4',
                entry.type === 'warn' && 'text-amber-400',
                entry.type === 'info' && 'text-blue-400',
                entry.type === 'ok' && 'text-surface-400',
              )}
            >
              <span className="text-surface-600 shrink-0">{formatTime(entry.timestamp)}</span>
              <span className="shrink-0 w-10 text-right">
                [{entry.type}]
              </span>
              <span>{entry.message}</span>
            </div>
          ))}
          {isRunning && (
            <div className="flex gap-3 py-0.5 text-blue-400">
              <span className="text-surface-600 shrink-0">{formatTime(new Date().toISOString())}</span>
              <span className="shrink-0 w-10 text-right">[info]</span>
              <span className="animate-pulse">Zpracovávám...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
