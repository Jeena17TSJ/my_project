'use client';
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaCalendarCheck } from 'react-icons/fa';
import ChatMessage     from './ChatMessage';
import ChatInput       from './ChatInput';
import TypingIndicator from './TypingIndicator';

interface Message {
  role:    'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  role: 'assistant',
  content: `Hi! I'm **DentalBot**, your DentalCare assistant.

I can help you with:
- Dental treatments & services
- Service prices & fees  
- Doctor info & availability
- Book an appointment
- Any dental questions

How can I help you today?`,
};

export default function ChatbotWidget() {
  const [open,    setOpen]    = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [loading,  setLoading]  = useState(false);
  const [booked,   setBooked]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res  = await fetch('/api/chatbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: updated }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: 'Sorry, something went wrong. Please try again or call +91-80-1234-5678.',
        }]);
        return;
      }

      const rawReply: string = data.reply || '';

      // -- Detect booking confirmation JSON ------------------
      if (rawReply.includes('BOOKING_CONFIRMED:')) {
        const match = rawReply.match(/BOOKING_CONFIRMED:\s*({[\s\S]*})/i);
        const jsonStr = match?.[1]?.trim()
          || rawReply.slice(rawReply.indexOf('BOOKING_CONFIRMED:') + 'BOOKING_CONFIRMED:'.length).trim().split('\n')[0];

        try {
          const bookingData = JSON.parse(jsonStr);

          // Show "processing" message immediately
          setMessages(prev => [...prev, {
            role:    'assistant',
            content: 'Processing your booking, please wait...',
          }]);

          // Call API to save patient + appointment
          const bookRes  = await fetch('/api/chatbot', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ bookingData }),
          });
          const bookData = await bookRes.json();

          if (bookData.conflict) {
            // Replace processing message with conflict reply
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: bookData.reply },
            ]);
          } else {
            // Replace processing message with confirmation
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: bookData.reply },
            ]);
            setBooked(true);
          }
          return;

        } catch (jsonErr) {
          console.error('Failed to parse booking JSON:', jsonErr);
          // Fall through to show raw reply
        }
      }

      // -- Normal reply --------------------------------------
      setMessages(prev => [...prev, { role: 'assistant', content: rawReply }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Connection error. Please check your internet and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME]);
    setBooked(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full
                   shadow-xl shadow-blue-300 flex items-center justify-center
                   hover:bg-blue-700 transition z-50 hover:scale-110 active:scale-95"
      >
        {open
          ? <FaTimes size={20} />
          : <FaRobot size={22} />
        }
        {/* Unread dot when closed */}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full
                           border-2 border-white" />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl
                     shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden
                     animate-slide-up"
          style={{ height: '540px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white
                          px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <FaRobot size={18} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">DentalBot</p>
              <p className="text-xs text-blue-200">DentalCare AI Assistant</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-green-300">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online
              </span>
              <button
                onClick={resetChat}
                title="Start new chat"
                className="text-blue-200 hover:text-white text-xs transition ml-1"
              >
                ?
              </button>
            </div>
          </div>

          {/* Booked success banner */}
          {booked && (
            <div className="bg-green-50 border-b border-green-200 px-4 py-2.5
                            flex items-center gap-2">
              <FaCalendarCheck className="text-green-600" size={14} />
              <p className="text-green-700 text-xs font-medium">
                Appointment booked 
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
      )}
    </>
  );
}