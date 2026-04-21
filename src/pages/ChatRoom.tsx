import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, Smartphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { Message, Chat } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch chat metadata
    getDoc(doc(db, 'chats', id)).then(snap => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() } as Chat);
    });

    const unsubscribe = chatService.subscribeToMessages(id, (data) => {
      setMessages(data);
    });

    return () => unsubscribe();
  }, [id, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id || !user) return;

    const msg = input.trim();
    setInput('');
    try {
      await chatService.sendMessage(id, user.uid, msg);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !chat) return null;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <Link to={`/listing/${chat.listingId}`} className="ml-2 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
              <img src={chat.listingImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{chat.listingTitle}</h3>
              <p className="text-[10px] text-indigo-600 font-bold">{formatPrice(chat.listingPrice)}</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400"><Smartphone size={18} /></button>
          <button className="p-2 text-gray-400"><Info size={18} /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth"
      >
        <div className="text-center py-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 inline-block px-3 py-1 rounded-full">Conversation Started</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                  isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
                )}>
                  {msg.content}
                </div>
                <span className="text-[8px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">
                  {msg.createdAt ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-50 pb-24">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full bg-gray-50 border-none px-4 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
