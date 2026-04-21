import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Phone, Share2, MapPin, User, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { marketplaceService } from '../services/marketplaceService';
import { chatService } from '../services/chatService';
import { useAuth } from '../hooks/useAuth';
import { Listing } from '../types';
import { formatPrice } from '../lib/utils';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      marketplaceService.getListing(id).then(setListing).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!listing) return;

    try {
      const chatId = await chatService.getOrCreateChat(user.uid, listing.sellerId, {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        image: listing.images[0] || '',
      });
      navigate(`/chats/${chatId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-white/50">Loading amazing deal...</div>;
  if (!listing) return <div className="p-8 text-center text-red-400">Item not found. Was it sold already?</div>;

  return (
    <div className="min-h-screen pb-24">
      {/* Absolute Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full shadow-lg text-white">
          <ArrowLeft size={24} />
        </button>
        <button className="p-2 glass rounded-full shadow-lg text-white">
          <Share2 size={24} />
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
        <img
          src={listing.images[activeImage]}
          alt={listing.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {listing.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
            {listing.images.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full transition-all", 
                  i === activeImage ? "bg-[#2dd4bf] w-4" : "bg-white/30"
                )} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-[#2dd4bf] px-2 py-1 rounded mb-2 inline-block">
              {listing.category}
            </span>
            <h1 className="text-2xl font-black text-white leading-tight">{listing.title}</h1>
          </div>
          <p className="text-2xl font-black text-[#2dd4bf]">{formatPrice(listing.price)}</p>
        </div>

        <div className="flex items-center space-x-4 mb-6 p-4 glass rounded-2xl">
          <div className="flex items-center space-x-2 text-white/60 text-sm">
            <MapPin size={16} className="text-[#2dd4bf]" />
            <span className="font-bold text-white/80">{listing.area || 'Dharan, Sunsari'}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center space-x-2 text-white/40 text-sm">
            <Clock size={16} />
            <span>Added today</span>
          </div>
        </div>

        <div className="mb-8 p-4 glass rounded-2xl">
          <h2 className="text-lg font-bold text-[#2dd4bf] mb-3">Item Details</h2>
          <p className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm">{listing.description}</p>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between p-4 glass rounded-2xl mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#2dd4bf]/10 rounded-full flex items-center justify-center text-[#2dd4bf] font-bold border border-[#2dd4bf]/30 shadow-sm">
              {listing.sellerName[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-white">{listing.sellerName}</p>
              <div className="flex items-center text-[10px] text-[#2dd4bf] font-black uppercase tracking-wider">
                <ShieldCheck size={12} className="mr-1" />
                Verified Student
              </div>
            </div>
          </div>
          <Link to={`/profile/${listing.sellerId}`} className="text-[#2dd4bf] font-bold text-sm">Profile</Link>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-dark flex space-x-3 z-50">
        <button
          onClick={handleChat}
          className="flex-1 flex items-center justify-center space-x-2 bg-[#2dd4bf] text-slate-900 py-4 rounded-2xl font-black shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
        >
          <MessageCircle size={20} />
          <span>Chat with Seller</span>
        </button>
        <button className="flex items-center justify-center glass text-white w-14 rounded-2xl active:scale-95 transition-all">
          <Phone size={20} />
        </button>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
import { Clock, ShieldCheck } from 'lucide-react';
