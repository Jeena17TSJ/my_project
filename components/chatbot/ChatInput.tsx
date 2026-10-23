// dental-clinic\components\chatbot\ChatInput.tsx
'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa';

const QUICK_SUGGESTIONS = [
  'What services do you offer?',
  'Book an appointment',
  'Doctor availability',
  'Service prices',
  'Clinic timings',
];

interface ChatInputProps {
  onSend:    (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value,       setValue]       = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    setShowSuggest(false);
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 100)}px`;
  };

  const handleSuggestion = (s: string) => {
    onSend(s);
    setShowSuggest(false);
  };

  return (
    <div className="p-3 border-t bg-white">
      {/* Quick suggestions */}
      {showSuggest && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs bg-blue-50 text-blue-600 border border-blue-200
                         px-2.5 py-1 rounded-full hover:bg-blue-100 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Suggestions toggle */}
        <button
          onClick={() => setShowSuggest(v => !v)}
          className={`p-2 rounded-xl transition flex-shrink-0 mb-0.5
            ${showSuggest
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          title="Quick suggestions"
        >
          <span className="text-base leading-none">💬</span>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="Ask about dental services, book an appointment…"
          rows={1}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     resize-none leading-relaxed
                     disabled:bg-gray-50 disabled:text-gray-400"
          style={{ minHeight: '36px', maxHeight: '100px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center
                     hover:bg-blue-700 transition flex-shrink-0
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FaPaperPlane size={13} />
        </button>
      </div>

      <p className="text-xs text-center text-gray-300 mt-1.5">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
