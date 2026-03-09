
import { Store, UserCircle, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onSwitchRole: (role: 'merchant' | 'customer') => void;
  onActivateMerchant: () => void;
}

export default function Navbar({ user, onLogout, onSwitchRole, onActivateMerchant }: NavbarProps) {
  return (
    <nav className="border-b border-[#E8EAE0] bg-white/80 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          <div className="w-10 h-10 bg-[#4A5D4E] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#4A5D4E]/20">E</div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#2D3436] block leading-none">EasyBook</span>
            <span className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest">精準預約系統</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-[#F8F9F4] rounded-xl border border-[#E8EAE0]">
              <div className="flex items-center gap-2 pr-4 border-r border-[#E8EAE0]">
                {user.role === 'merchant' ? <Store size={16} className="text-[#4A5D4E]" /> : <UserCircle size={16} className="text-[#4A5D4E]" />}
                <span className="text-sm font-bold text-[#2D3436]">{user.nickname || user.name || user.username}</span>
                <span className="text-[10px] bg-[#4A5D4E] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {user.role === 'merchant' ? '商家' : '顧客'}
                </span>
              </div>
              
              {user.roles.length > 1 ? (
                <button
                  onClick={() => onSwitchRole(user.role === 'merchant' ? 'customer' : 'merchant')}
                  className="text-[10px] font-bold text-[#4A5D4E] hover:text-[#2D3436] transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  切換為{user.role === 'merchant' ? '顧客' : '商家'}
                </button>
              ) : (
                !user.roles.includes('merchant') && (
                  <button
                    onClick={onActivateMerchant}
                    className="text-[10px] font-bold text-[#4A5D4E] hover:text-[#2D3436] transition-colors uppercase tracking-widest flex items-center gap-1"
                  >
                    成為商家
                  </button>
                )
              )}
            </div>
            <button
              onClick={onLogout}
              className="p-2.5 text-[#A0A4A8] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="登出"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
