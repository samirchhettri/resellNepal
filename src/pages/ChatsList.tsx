import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { Chat } from '../types';
import { formatPrice } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const ChatItem = ({ chat }: { chat: Chat }) => {
  const lastMsgTime = chat.lastMessageAt ? formatDistanceToNow(chat.lastMessageAt.toDate(), { addSuffix: true }) : '';

  return (
    <Link to={`/chats/${chat.id}`}>
      <motion.div 
        whileHover={{ x: 4 }}
        className="flex items-center p-4 glass rounded-2xl mb-3 shadow-lg active:bg-white/5 transition-colors border-white/5"
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
          <img src={chat.listingImage || 'https://picsum.photos/seed/placeholder/100/100'} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-extrabold text-white truncate pr-2 text-sm leading-tight">{chat.listingTitle}</h3>
            <span className="text-[10px] text-white/30 whitespace-nowrap font-bold uppercase tracking-tighter">{lastMsgTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/40 text-[11px] truncate max-w-[80%] font-medium">
              {chat.lastMessage || 'Start the conversation...'}
            </p>
            <span className="text-[#2dd4bf] font-black text-xs">{formatPrice(chat.listingPrice)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function ChatsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = chatService.subscribeToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-bold mb-4 text-white">Your Conversations</h2>
        <p className="text-white/40 mb-6">Login to see your chats with buyers and sellers.</p>
        <button onClick={() => navigate('/auth')} className="bg-[#2dd4bf] text-slate-900 px-8 py-3 rounded-2xl font-black">Sign In</button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Messages</h1>
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-[#2dd4bf] shadow-xl">
          <MessageSquare size={20} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 glass rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {chats.length > 0 ? (
            <div className="space-y-3">
              {chats.map(chat => <div key={chat.id}><ChatItem chat={chat} /></div>)}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-3xl p-8 shadow-2xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-white/20" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No chats yet</h3>
              <p className="text-sm text-white/40 mb-6">Message a seller to start a deal!</p>
              <button onClick={() => navigate('/')} className="text-[#2dd4bf] font-black bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 px-6 py-3 rounded-xl transition-all active:scale-95">Explore Items</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
