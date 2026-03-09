
import React, { useState } from 'react';
import { User, Lock, Phone, UserCircle, LogIn, UserPlus, Globe, CheckCircle2, Eye, EyeOff, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import { api, ApiError } from '../api/apiClient';
import { useError } from '../context/ErrorContext';

interface AuthProps {
  onLogin: (user: UserType) => void;
  initialUser?: UserType;
}

const COUNTRIES = [
  { code: '+886', name: '台灣', flag: '🇹🇼' },
  { code: '+1', name: '美國', flag: '🇺🇸' },
  { code: '+1 ', name: '加拿大', flag: '🇨🇦' },
];

export default function Auth({ onLogin, initialUser }: AuthProps) {
  const { showError } = useError();
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(initialUser && !initialUser.name ? 'profile' : 'login');
  const [username, setUsername] = useState(''); // This is the phone number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('+886');
  
  // Profile fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [tempUser, setTempUser] = useState<UserType | null>(initialUser || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        const data = await api.auth.login({ username, password, countryCode });
        const user = data as UserType;
        // Default to customer role after login
        onLogin({ ...user, role: 'customer' });
      } else if (mode === 'register') {
        const data = await api.auth.register({ 
          username, // Phone number as account
          password, 
          phone: username, 
          countryCode 
        });
        setTempUser({ ...data as UserType, role: 'customer' });
        setMode('profile');
      } else if (mode === 'profile' && tempUser) {
        const data = await api.auth.updateProfile({ 
          id: tempUser.id, 
          name, 
          nickname,
          gender
        });
        onLogin({ ...data as UserType, role: 'customer' });
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '認證失敗');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-[#E8EAE0] rounded-[2rem] p-8 shadow-xl shadow-[#4A5D4E]/5"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A5D4E] rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-[#4A5D4E]/20">
            {mode === 'login' ? <LogIn size={32} /> : mode === 'register' ? <UserPlus size={32} /> : <User size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-[#2D3436] tracking-tight">
            {mode === 'login' ? '歡迎回來' : mode === 'register' ? '建立新帳號' : '完善個人資料'}
          </h2>
          <p className="text-[#636E72] text-sm mt-2">
            {mode === 'login' ? '請輸入您的手機號碼以登入系統' : mode === 'register' ? '加入 EasyBook，開啟您的預約生活' : '請填寫基本資料以完成註冊'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode !== 'profile' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">國家/地區</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A4A8]" size={18} />
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all text-[#2D3436] appearance-none"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">手機號碼 (帳號)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A4A8]" size={18} />
                  <input
                    required
                    type="tel"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all text-[#2D3436]"
                    placeholder="請輸入手機號碼"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">密碼</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A4A8]" size={18} />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all text-[#2D3436]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A4A8] hover:text-[#4A5D4E] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">真實姓名</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A4A8]" size={18} />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all text-[#2D3436]"
                    placeholder="請輸入您的姓名"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">暱稱 (選填)</label>
                <div className="relative">
                  <Smile className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A4A8]" size={18} />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all text-[#2D3436]"
                    placeholder="大家該如何稱呼您？"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-2 ml-1">性別</label>
                <div className="grid grid-cols-3 gap-3 p-1 bg-[#F8F9F4] rounded-2xl border border-[#E8EAE0]">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${gender === g ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#A0A4A8]'}`}
                    >
                      {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-[#4A5D4E] text-white font-bold py-4 rounded-2xl hover:bg-[#3D4D40] transition-all shadow-lg shadow-[#4A5D4E]/20 mt-4 flex items-center justify-center gap-2"
          >
            {mode === 'login' ? (
              <><LogIn size={20} /> 登入系統</>
            ) : mode === 'register' ? (
              <><ArrowRight size={20} /> 下一步</>
            ) : (
              <><CheckCircle2 size={20} /> 完成註冊</>
            )}
          </button>
        </form>

        {mode !== 'profile' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[#4A5D4E] font-bold text-sm hover:underline underline-offset-4"
            >
              {mode === 'login' ? '還沒有帳號？點此註冊' : '已有帳號？返回登入'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
