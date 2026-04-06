import { useState } from 'react';
import { FileText, File, FileSpreadsheet } from 'lucide-react';
import { Modal } from './Modal';

interface DocumentPillProps {
  name: string;
  format?: string;
  content?: string;
}

function getIcon(format?: string) {
  switch (format?.toLowerCase()) {
    case 'pdf': return <File className="w-4 h-4 text-red-500" />;
    case 'docx': case 'doc': return <FileText className="w-4 h-4 text-blue-500" />;
    case 'md': return <FileText className="w-4 h-4 text-surface-600" />;
    case 'txt': return <FileSpreadsheet className="w-4 h-4 text-surface-500" />;
    default: return <FileText className="w-4 h-4 text-surface-500" />;
  }
}

export function DocumentPill({ name, format, content }: DocumentPillProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-100 hover:bg-surface-200 rounded-full text-sm text-surface-700 transition-colors"
      >
        {getIcon(format)}
        <span>{name}</span>
        {format && <span className="text-xs text-surface-400 uppercase">{format}</span>}
      </button>

      <Modal open={showPreview} onClose={() => setShowPreview(false)} title={name} width="max-w-2xl">
        <div className="bg-surface-50 rounded-lg p-6 font-mono text-sm text-surface-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {content ?? `Náhled dokumentu "${name}" není k dispozici v mock režimu.\n\nToto je simulovaný obsah dokumentu pro účely prototypu.`}
        </div>
      </Modal>
    </>
  );
}
