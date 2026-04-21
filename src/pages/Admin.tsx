import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Package, 
  Users, 
  Trash2, 
  Search, 
  ExternalLink, 
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../hooks/useAuth';
import { Listing, UserProfile } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ totalListings: 0, totalUsers: 0, totalSold: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.role !== 'admin') {
        navigate('/');
      } else {
        fetchAdminData();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Get all listings
      const listResult = await marketplaceService.getListings({});
      setListings(listResult.docs);

      // Get basic stats
      const usersSnap = await getDocs(query(collection(db, 'users')));
      
      setStats({
        totalListings: listResult.docs.length,
        totalUsers: usersSnap.size,
        totalSold: listResult.docs.filter(l => l.status === 'sold').length
      });
    } catch (err) {
      console.error("Admin data fetch error:", err);
    }
    setLoading(false);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm("Are you sure you want to delete this listing permanently?")) {
      try {
        await deleteDoc(doc(db, 'listings', listingId));
        setListings(listings.filter(l => l.id !== listingId));
      } catch (err) {
        alert("Failed to delete listing.");
      }
    }
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50 animate-pulse font-mono uppercase tracking-widest">Accessing Secure Terminal...</div>;
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <button onClick={() => navigate('/')} className="p-2 glass rounded-xl text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-[#2dd4bf] font-black uppercase tracking-[0.2em] text-[10px] mb-1">
              <Shield size={12} />
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter italic font-serif">Command<span className="text-[#2dd4bf]">Center</span></h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="glass px-4 py-2 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf]">
              <Users size={16} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Active Users</p>
              <p className="text-white font-black">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-[#2dd4bf]">
              <Package size={16} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-wider">Total Listings</p>
              <p className="text-white font-black">{stats.totalListings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-5 rounded-3xl">
            <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Quick Search</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text" 
                placeholder="Lookup listing/seller..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#2dd4bf]/30"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="glass p-5 rounded-3xl">
            <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Moderation Logs</h2>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start space-x-3 text-[10px] font-mono leading-relaxed text-white/20">
                  <Clock size={12} className="mt-0.5 flex-shrink-0" />
                  <span>[03:42:01] System bootstrapped initial admin: {user?.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-bold text-white flex items-center">
                <AlertTriangle className="text-yellow-400 mr-2" size={18} />
                Listing Inventory
              </h2>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">Status: Secure</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase tracking-[0.1em] font-serif italic border-b border-white/10">Listing Details</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase tracking-[0.1em] font-serif italic border-b border-white/10">Seller</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase tracking-[0.1em] font-serif italic border-b border-white/10">Price</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase tracking-[0.1em] font-serif italic border-b border-white/10">Status</th>
                    <th className="p-4 text-[10px] font-black text-white/30 uppercase tracking-[0.1em] font-serif italic border-b border-white/10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length > 0 ? filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 group">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img src={listing.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5 border border-white/10" />
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#2dd4bf] transition-colors">{listing.title}</p>
                            <p className="text-[10px] text-white/30 font-mono tracking-tighter">{listing.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-white/70">{listing.sellerName}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-mono font-bold text-[#2dd4bf]">{formatPrice(listing.price)}</p>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                          listing.status === 'active' ? "bg-green-500/20 text-green-400" : (listing.status === 'sold' ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400")
                        )}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => navigate(`/listing/${listing.id}`)}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all shadow-sm"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-all shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-white/20 font-mono italic text-sm">
                         No matching signal in local area...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-white/5 text-center">
              <button 
                onClick={fetchAdminData}
                className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
              >
                Sync Terminal with Cloud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
