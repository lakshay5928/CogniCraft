export default function HistoryPanel({ open, onClose, onSelectPrompt }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full max-h-96 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-mono font-bold">History</h2>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <p className="text-ink-faint text-sm text-center py-8">No history yet</p>
        </div>
      </div>
    </div>
  );
}
