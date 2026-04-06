import { useState, useEffect } from 'react';
import { X, Code2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface SystemPromptPanelProps {
  open: boolean;
  onClose: () => void;
  prompt: string;
  isModified: boolean;
  onSave: (prompt: string) => void;
  onReset: () => void;
}

export function SystemPromptPanel({ open, onClose, prompt, isModified, onSave, onReset }: SystemPromptPanelProps) {
  const [value, setValue] = useState(prompt);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    setValue(prompt);
    setHasUnsaved(false);
  }, [prompt, open]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setHasUnsaved(newValue !== prompt);
  };

  const handleClose = () => {
    if (hasUnsaved) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(value);
    setHasUnsaved(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={handleClose} />
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl z-40 flex flex-col border-l border-surface-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code2 className="w-5 h-5 text-surface-400" />
            Systémový prompt
            {isModified && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Upravený</span>
            )}
          </h3>
          <Button variant="icon" size="icon-sm" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-full min-h-[300px] p-4 rounded-lg border border-surface-200 bg-surface-50 font-mono text-sm text-surface-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          {hasUnsaved && (
            <div className="mt-2 text-xs text-amber-600">Neuložené změny</div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-sm text-surface-500 hover:text-surface-700 hover:underline transition-colors"
          >
            Obnovit výchozí
          </button>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={handleClose}>
              Zavřít
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={!hasUnsaved}>
              Uložit
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Neuložené změny"
      >
        <p className="text-sm text-surface-600 mb-4">
          Máte neuložené změny v systémovém promptu. Opravdu chcete zavřít bez uložení?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={() => setShowDiscardConfirm(false)}>
            Pokračovat v editaci
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => { setShowDiscardConfirm(false); onClose(); }}
            className="!bg-red-600 !text-white hover:!bg-red-700 !border-red-600"
          >
            Zavřít bez uložení
          </Button>
        </div>
      </Modal>
    </>
  );
}
