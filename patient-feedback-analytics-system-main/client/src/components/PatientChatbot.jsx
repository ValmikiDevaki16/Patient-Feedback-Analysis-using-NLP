import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { feedbackAPI } from '../services/api';

export default function PatientChatbot({ patientName, patientId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I can help answer your questions about our hospital. Ask me about visiting hours, facilities, or emergency services!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const faqResponses = {
    'visiting hours': 'Our visiting hours are 9:00 AM to 8:00 PM daily. ICU visiting hours are 2:00 PM to 4:00 PM and 6:00 PM to 8:00 PM.',
    'cafeteria': 'The hospital cafeteria is located on the ground floor, near the main entrance. Open 7:00 AM to 10:00 PM.',
    'emergency': 'Emergency department is available 24/7. Located at the east wing entrance. For emergencies, dial extension 911 or go directly to the emergency desk.',
    'parking': 'Parking is available in the multi-level parking structure adjacent to the main building. First 2 hours free for visitors.',
    'pharmacy': 'Our pharmacy is located on the first floor, open Monday-Saturday 8:00 AM to 8:00 PM, Sunday 10:00 AM to 6:00 PM.',
    'appointment': 'To schedule an appointment, call (555) 123-4567 or use our online portal. Please have your patient ID ready.',
    'billing': 'Billing department is on the second floor. Hours: Monday-Friday 9:00 AM to 5:00 PM. Phone: (555) 123-4568.'
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const lowerInput = input.toLowerCase();
    let botResponse = "I'm here to help! You can ask me about:\n• Visiting hours\n• Cafeteria location\n• Emergency services\n• Parking\n• Pharmacy\n• Appointments\n• Billing\n\nOr share your feedback anytime!";

    for (const [key, response] of Object.entries(faqResponses)) {
      if (lowerInput.includes(key)) {
        botResponse = response;
        break;
      }
    }

    if (lowerInput.includes('feedback') || lowerInput.includes('complaint') || lowerInput.includes('complain')) {
      botResponse = "I'd be happy to help you submit feedback! Please use the feedback form on the main page, or tell me your feedback here and I'll save it for you.";

      if (lowerInput.length > 30) {
        try {
          await feedbackAPI.submit({
            text: input,
            patientName,
            patientId
          });
          botResponse = "Thank you for your feedback! I've recorded it and our team will review it. Is there anything else I can help you with?";
        } catch (error) {
          botResponse = "I apologize, but I couldn't save your feedback right now. Please try using the main feedback form.";
        }
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Patient Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300'
                  }`}
                >
                  <p
                    className="text-sm whitespace-pre-line"
                    style={{ color: '#000000' }}   // <-- hard-force pure black text
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
