import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Camera, X, Plus, Loader2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { marketplaceService } from '../services/marketplaceService';
import { useAuth } from '../hooks/useAuth';
import { Category } from '../types';

const categories: Category[] = ['Books', 'Electronics', 'Bikes', 'Others'];
const areas = ['Central Campus', 'Engineering Campus', 'Medicine Campus', 'Bhanu Chowk', 'Putali Line', 'Bijayapur'];

export default function PostListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'Others' as Category,
    area: 'Central Campus',
    description: '',
  });

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = [...images, ...acceptedFiles].slice(0, 5);
    setImages(newImages);
    setPreviews(newImages.map(file => URL.createObjectURL(file)));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  } as any);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setPreviews(newImages.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate('/auth');
    if (images.length === 0) return alert('Please add at least one image');

    setLoading(true);
    try {
      await marketplaceService.createListing({
        ...form,
        price: Number(form.price),
        sellerId: user.uid,
        sellerName: user.displayName || 'Unknown Student',
      }, images);
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to post items.</p>
        <button onClick={() => navigate('/auth')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-white mb-6 tracking-tight">Sell Something</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
          <div 
            {...getRootProps()} 
            className="flex-shrink-0 w-24 h-24 glass rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-[#2dd4bf] cursor-pointer hover:bg-white/5 transition-colors"
          >
            <input {...getInputProps()} />
            <Camera size={24} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Add Photo</span>
          </div>
          {previews.map((preview, i) => (
            <div key={i} className="flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden glass shadow-lg">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 shadow-md hover:bg-black"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">What are you selling?</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Engineering Mathematics Book"
              className="w-full glass px-4 py-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 text-sm text-white placeholder-white/20"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Price (NPR)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="w-full glass px-4 py-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 text-sm text-white placeholder-white/20"
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Category</label>
              <select 
                className="w-full glass px-4 py-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 text-sm text-white appearance-none"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value as Category})}
              >
                {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Location Details</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2dd4bf]" size={18} />
              <select 
                className="w-full glass pl-12 pr-4 py-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 text-sm text-white appearance-none"
                value={form.area}
                onChange={e => setForm({...form, area: e.target.value})}
              >
                {areas.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Tell other students about the item's condition..."
              className="w-full glass px-4 py-4 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/20 text-sm text-white placeholder-white/20 resize-none"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-[#2dd4bf] text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Optimizing & Uploading...</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>Post My Item</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
