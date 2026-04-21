import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Package, Star, ShieldCheck, Mail, Phone, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { marketplaceService } from '../services/marketplaceService';
import { Listing } from '../types';
import { formatPrice, cn } from '../lib/utils';

export default function Profile() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      marketplaceService.getUserListings(user.uid).then(setListings).finally(() => setLoading(false));
    } else if (!authLoading) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen pb-24">
      {/* Profile Header */}
      <div className="glass-dark px-6 pt-12 pb-8 rounded-b-[40px] mb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">resell<span className="text-[#2dd4bf]">Nepal</span></h1>
          <button onClick={handleLogout} className="p-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl active:scale-95 transition-all">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center border-2 border-white/20 shadow-xl overflow-hidden">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
               ) : (
                 <User className="text-[#2dd4bf]" size={32} />
               )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#2dd4bf] text-slate-900 p-1 rounded-lg border-2 border-white/20">
              <ShieldCheck size={12} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{user.displayName || 'Discovery Student'}</h2>
            <p className="text-sm text-white/40 font-bold tracking-tight">{user.email || 'student@dharan.edu'}</p>
            <div className="flex items-center mt-2 space-x-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={10} className="fill-[#2dd4bf] text-[#2dd4bf]" />)}
              <span className="text-[10px] font-black text-white/30 ml-1 uppercase tracking-widest">(4.9/5 • 12 Deals)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div className="glass p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-black text-[#2dd4bf]">{listings.length}</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Listed Items</p>
        </div>
        <div className="glass p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-black text-[#2dd4bf]">8</p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Sold Items</p>
        </div>
      </div>

      {profile?.role === 'admin' && (
        <div className="px-6 mb-8">
          <button 
            onClick={() => navigate('/admin')}
            className="w-full glass p-5 rounded-3xl flex items-center justify-between border-2 border-[#2dd4bf]/20 hover:bg-[#2dd4bf]/5 transition-all text-white group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#2dd4bf]/20 rounded-xl flex items-center justify-center text-[#2dd4bf]">
                <Shield size={20} />
              </div>
              <div className="text-left">
                <p className="font-black italic text-sm">Security Terminal</p>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Admin Control Center</p>
              </div>
            </div>
            <ChevronRight className="text-white/20 group-hover:text-[#2dd4bf] transition-colors" size={20} />
          </button>
        </div>
      )}

      {/* My Listings Feed */}
      <div className="px-6">
        <h3 className="text-lg font-black text-white mb-4 flex items-center">
          <Package className="text-[#2dd4bf] mr-2" size={20} />
          My Active Listings
        </h3>
        {loading ? (
          <div className="h-32 glass rounded-3xl animate-pulse" />
        ) : (
          <div className="space-y-3">
            {listings.length > 0 ? listings.map((l) => (
              <div key={l.id} className="glass p-3 rounded-2xl flex items-center space-x-4 shadow-sm border border-white/5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-white text-sm line-clamp-1">{l.title}</h4>
                  <p className="text-[#2dd4bf] font-black text-xs mt-1">{formatPrice(l.price)}</p>
                  <div className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/40 mt-2 inline-block">
                    {l.status}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-white/20 text-xs font-bold uppercase tracking-widest py-10 glass rounded-3xl border-dashed border-white/10 border-2">
                Inventory is Empty
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
