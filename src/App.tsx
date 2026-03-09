import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MerchantDashboard from './components/MerchantDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import MerchantPage from './components/MerchantPage';
import Auth from './components/Auth';
import { User as UserType } from './types';
import { api } from './api/apiClient';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('easybook_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: UserType) => {
    setUser(userData);
    localStorage.setItem('easybook_user', JSON.stringify(userData));
  };

  const handleSwitchRole = (role: 'merchant' | 'customer') => {
    if (user && user.roles.includes(role)) {
      const newUser = { ...user, role };
      setUser(newUser);
      localStorage.setItem('easybook_user', JSON.stringify(newUser));
    }
  };

  const handleActivateMerchant = async () => {
    if (!user) return;
    try {
      const { roles } = await api.auth.activateMerchant(user.id);
      const newUser = { ...user, roles, role: 'merchant' as const };
      setUser(newUser);
      localStorage.setItem('easybook_user', JSON.stringify(newUser));
    } catch (err: any) {
      console.error('Failed to activate merchant role:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('easybook_user');
  };

  const needsProfile = user && !user.name;

  const isMerchantPage = path.startsWith('/s/');
  const merchantIdFromPath = isMerchantPage ? path.split('/')[2] : null;

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9F4] font-sans text-[#2D3436] flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onSwitchRole={handleSwitchRole} 
        onActivateMerchant={handleActivateMerchant}
      />
      
      <main className="flex-1 py-12">
        {isMerchantPage && merchantIdFromPath ? (
          <MerchantPage merchantId={merchantIdFromPath} />
        ) : !user || needsProfile ? (
          <Auth onLogin={handleLogin} initialUser={user || undefined} />
        ) : user.role === 'merchant' ? (
          <MerchantDashboard user={user} />
        ) : (
          <CustomerDashboard user={user} />
        )}
      </main>

      <footer className="py-16 border-t border-[#E8EAE0] bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-[#4A5D4E] rounded flex items-center justify-center text-white text-xs font-bold">E</div>
            <span className="font-bold text-lg tracking-tight text-[#2D3436]">EasyBook</span>
          </div>
          <p className="text-[#A0A4A8] text-sm font-medium">© 2024 EasyBook. 精準預約，美好生活。</p>
          <div className="mt-6 flex justify-center gap-8 text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest">
            <a href="#" className="hover:opacity-70">服務條款</a>
            <a href="#" className="hover:opacity-70">隱私政策</a>
            <a href="#" className="hover:opacity-70">聯繫我們</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
