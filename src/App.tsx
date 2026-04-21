import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, PlusCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './hooks/useAuth';
import Feed from './pages/Feed';
import ListingDetail from './pages/ListingDetail';
import PostListing from './pages/PostListing';
import ChatsList from './pages/ChatsList';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { cn } from './lib/utils';

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Chats', path: '/chats' },
    { icon: PlusCircle, label: 'Post', path: '/post', primary: true },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass-dark flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors relative",
              item.primary 
                ? "text-slate-900 -translate-y-6 bg-[#2dd4bf] p-4 rounded-2xl shadow-xl shadow-teal-500/30 border border-white/20" 
                : (isActive ? "text-[#2dd4bf]" : "text-white/40")
            )}
          >
            <item.icon size={item.primary ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />
            {!item.primary && <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen pb-20 font-sans selection:bg-teal-500/30 selection:text-teal-200">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post" element={<PostListing />} />
            <Route path="/chats" element={<ChatsList />} />
            <Route path="/chats/:id" element={<ChatRoom />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}
