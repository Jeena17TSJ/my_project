// dental-clinic\components\chatbot\TypingIndicator.tsx
import { FaRobot } from 'react-icons/fa';

export default function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700
                      flex items-center justify-center flex-shrink-0">
        <FaRobot size={11} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full inline-block"
              style={{
                animation: 'bounce 1.2s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
            40%            { transform: translateY(-5px); opacity: 1;   }
          }
        `}</style>
      </div>
    </div>
  );
}
