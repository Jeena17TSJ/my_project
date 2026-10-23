// dental-clinic\components\chatbot\ChatMessage.tsx
import { FaRobot, FaUser } from 'react-icons/fa';

interface ChatMessageProps {
  role:    'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
        {isUser
          ? <FaUser    size={11} className="text-white" />
          : <FaRobot   size={11} className="text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
        ${isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
        }`}>
        {/* Render line-breaks and basic bullet formatting */}
        {content.split('\n').map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <br key={i} />;
          // Render lines starting with • or - as list items
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div key={i} className="flex gap-1.5 mt-1">
                <span className={isUser ? 'text-blue-200' : 'text-blue-500'}>•</span>
                <span>{trimmed.replace(/^[•\-]\s*/, '')}</span>
              </div>
            );
          }
          // Bold for lines ending with :
          if (trimmed.endsWith(':')) {
            return <p key={i} className="font-semibold mt-2 first:mt-0">{trimmed}</p>;
          }
          return <p key={i} className="mt-1 first:mt-0">{line}</p>;
        })}
      </div>
    </div>
  );
}
