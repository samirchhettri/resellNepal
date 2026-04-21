import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { marketplaceService } from '../services/marketplaceService';
import { Listing, Category } from '../types';
import { formatPrice, cn } from '../lib/utils';

const categories: Category[] = ['Books', 'Electronics', 'Bikes', 'Others'];

const ListingCard = ({ listing }: { listing: Listing }) => (
  <Link to={`/listing/${listing.id}`}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl overflow-hidden group h-full flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img
          src={listing.images[0] || 'https://picsum.photos/seed/placeholder/400/400'}
          alt={listing.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-[#2dd4bf] px-2 py-1 rounded text-[10px] font-black text-slate-900 uppercase tracking-wider shadow-lg">
            {formatPrice(listing.price)}
          </span>
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between bg-white/5">
        <div>
          <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1">
            {listing.title}
          </h3>
          <p className="text-[#2dd4bf] text-[10px] font-bold uppercase tracking-widest">{listing.category}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center text-white/40 text-[10px] space-x-1 font-bold">
            <MapPin size={10} />
            <span>{listing.area || 'Dharan'}</span>
          </div>
          <div className="flex items-center text-white/40 text-[10px] space-x-1">
            <Clock size={10} />
            <span>2h ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
);

export default function Feed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const result = await marketplaceService.getListings({ category: selectedCategory || undefined });
        setListings(result.docs);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchListings();
  }, [selectedCategory]);

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
          resell<span className="text-[#2dd4bf]">Nepal</span>
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input
            type="text"
            placeholder="Search books, bikes, etc..."
            className="w-full glass pl-12 pr-4 py-4 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 transition-all text-sm text-white placeholder-white/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all",
              selectedCategory === null ? "bg-[#2dd4bf] text-slate-900" : "glass text-white/60"
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                selectedCategory === cat ? "bg-[#2dd4bf] text-slate-900" : "glass text-white/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredListings.map((listing) => (
                <div key={listing.id}><ListingCard listing={listing} /></div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="text-white/20" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">No items found</h3>
              <p className="text-sm text-white/40">Try searching for something else.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
