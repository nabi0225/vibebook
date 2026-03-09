
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Package, ClipboardList, User, Phone, Edit2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Slot, Booking, User as UserType } from '../types';
import { api, ApiError } from '../api/apiClient';
import { useError } from '../context/ErrorContext';

interface MerchantDashboardProps {
  user: UserType;
}

export default function MerchantDashboard({ user }: MerchantDashboardProps) {
  const { showError } = useError();
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 30, description: '' });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' });
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'slots'>('bookings');
  const [copied, setCopied] = useState(false);

  const merchantUrl = `${window.location.origin}/s/${user.id}`;

  useEffect(() => {
    fetchServices();
    fetchSlots();
    fetchBookings();
  }, [user.id]);

  const fetchServices = async () => {
    try {
      const data = await api.merchant.getServices(user.id);
      setServices(data as Service[]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取服務列表失敗');
      }
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await api.merchant.getSlots(user.id);
      setSlots(data as Slot[]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取時段列表失敗');
      }
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await api.merchant.getBookings(user.id);
      setBookings(data as Booking[]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取預約訂單失敗');
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.merchant.updateService(editingService.id, newService);
        setEditingService(null);
      } else {
        await api.merchant.createService({ ...newService, merchantId: user.id });
      }
      setNewService({ name: '', price: 0, duration: 30, description: '' });
      fetchServices();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '操作失敗');
      }
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(merchantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteService = async (id: string) => {
    try {
      await api.merchant.deleteService(id);
      fetchServices();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '刪除服務失敗');
      }
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = new Date(`${newSlot.date}T${newSlot.startTime}`).toISOString();
      const endTime = new Date(`${newSlot.date}T${newSlot.endTime}`).toISOString();
      await api.merchant.createSlot({ merchantId: user.id, startTime, endTime });
      setNewSlot({ date: '', startTime: '', endTime: '' });
      fetchSlots();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '新增時段失敗');
      }
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await api.merchant.deleteSlot(id);
      fetchSlots();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '刪除時段失敗');
      }
    }
  };

  const handleUpdateNote = async (id: string, note: string) => {
    try {
      await api.merchant.updateNote(id, note);
      fetchBookings();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '更新備註失敗');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3436] tracking-tight">商家管理中心</h1>
          <p className="text-[#636E72] mt-1">歡迎回來，{user.nickname || user.name || user.username}</p>
          <div className="mt-4 flex items-center gap-2 bg-white border border-[#E8EAE0] px-4 py-2 rounded-xl shadow-sm">
            <LinkIcon size={14} className="text-[#4A5D4E]" />
            <span className="text-xs font-mono text-[#636E72] truncate max-w-[200px] md:max-w-xs">{merchantUrl}</span>
            <button 
              onClick={copyToClipboard}
              className="ml-2 p-1.5 hover:bg-[#F8F9F4] rounded-lg transition-colors text-[#4A5D4E]"
              title="複製連結"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className="flex gap-1 bg-[#E8EAE0] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'}`}
          >
            <ClipboardList size={18} /> 訂單管理
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'services' ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'}`}
          >
            <Package size={18} /> 服務項目
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'slots' ? 'bg-white text-[#4A5D4E] shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'}`}
          >
            <Calendar size={18} /> 時段設定
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {bookings.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-[#E8EAE0] border-dashed">
                  <ClipboardList className="mx-auto text-[#A0A4A8] mb-4" size={48} />
                  <p className="text-[#636E72] italic">目前尚無預約訂單</p>
                </div>
              )}
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-[#E8EAE0] rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                      <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-[0.2em] mb-2 block">預約服務</span>
                      <h3 className="text-2xl font-bold text-[#2D3436]">{booking.serviceName}</h3>
                      <div className="flex items-center gap-2 text-[#636E72] mt-2">
                        <Calendar size={16} />
                        <span className="text-sm font-medium">
                          {new Date(booking.startTime!).toLocaleString('zh-TW')} - {new Date(booking.endTime!).toLocaleTimeString('zh-TW')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#F8F9F4] border border-[#E8EAE0] px-6 py-3 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#A0A4A8] uppercase tracking-widest">顧客資訊</p>
                          <p className="font-bold text-[#2D3436]">{booking.customerName}</p>
                          <p className="text-xs text-[#636E72]">{booking.customerPhone}</p>
                        </div>
                        <div className="w-10 h-10 bg-[#4A5D4E] rounded-xl flex items-center justify-center text-white">
                          <User size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-[#F8F9F4]">
                    <label className="block text-[10px] font-bold text-[#4A5D4E] uppercase tracking-widest mb-3 ml-1">商家內部備註</label>
                    <textarea
                      defaultValue={booking.merchantNote}
                      onBlur={(e) => handleUpdateNote(booking.id, e.target.value)}
                      placeholder="在此輸入對顧客的備註（例如：喜好顏色、過敏史...）"
                      className="w-full bg-[#F8F9F4] border border-[#E8EAE0] rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-10"
          >
            <div className="lg:col-span-1">
              <div className="bg-[#4A5D4E] text-white rounded-[2rem] p-8 sticky top-24 shadow-xl shadow-[#4A5D4E]/20">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  {editingService ? <Edit2 className="bg-white/20 p-1 rounded-lg" size={24} /> : <Plus className="bg-white/20 p-1 rounded-lg" size={24} />}
                  {editingService ? '修改服務項目' : '新增服務項目'}
                </h2>
                <form onSubmit={handleAddService} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">服務名稱</label>
                    <input
                      required
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all placeholder:text-white/30"
                      placeholder="例如：手部單色美甲"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">價格 (TWD)</label>
                      <input
                        required
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">時長 (分鐘)</label>
                      <input
                        required
                        type="number"
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">詳細描述</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none placeholder:text-white/30"
                      placeholder="描述服務內容、耗時等資訊..."
                    />
                  </div>
                  <div className="flex gap-3">
                    {editingService && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingService(null);
                          setNewService({ name: '', price: 0, duration: 30, description: '' });
                        }}
                        className="flex-1 bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition-all"
                      >
                        取消
                      </button>
                    )}
                    <button type="submit" className="flex-[2] bg-white text-[#4A5D4E] font-bold py-4 rounded-xl hover:bg-[#F8F9F4] transition-all shadow-lg">
                      {editingService ? '更新服務' : '儲存服務'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[#2D3436] mb-6">現有服務列表</h2>
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white border border-[#E8EAE0] rounded-2xl p-6 flex justify-between items-center group hover:border-[#4A5D4E]/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#2D3436]">{service.name}</h3>
                        <span className="text-[10px] bg-[#F8F9F4] text-[#636E72] px-2 py-0.5 rounded-md font-bold">{service.duration} 分鐘</span>
                      </div>
                      <p className="text-[#636E72] text-sm mt-1">{service.description}</p>
                      <p className="text-[#4A5D4E] font-bold text-xl mt-2">${service.price}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-[#A0A4A8] hover:text-[#4A5D4E] p-3 bg-[#F8F9F4] rounded-xl transition-all"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-[#A0A4A8] hover:text-red-500 p-3 bg-[#F8F9F4] rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'slots' && (
          <motion.div
            key="slots"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-10"
          >
            <div className="lg:col-span-1">
              <div className="bg-[#4A5D4E] text-white rounded-[2rem] p-8 sticky top-24 shadow-xl shadow-[#4A5D4E]/20">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Calendar className="bg-white/20 p-1 rounded-lg" size={24} /> 開放預約時段
                </h2>
                <form onSubmit={handleAddSlot} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">選擇日期</label>
                    <input
                      required
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">開始時間</label>
                      <input
                        required
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 ml-1">結束時間</label>
                      <input
                        required
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-white text-[#4A5D4E] font-bold py-4 rounded-xl hover:bg-[#F8F9F4] transition-all shadow-lg">
                    確認開放時段
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[#2D3436] mb-6">已開放時段列表</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div key={slot.id} className={`p-6 rounded-[1.5rem] border-2 transition-all flex flex-col justify-between group ${slot.isBooked ? 'bg-[#F8F9F4] border-[#E8EAE0]' : 'bg-white border-[#E8EAE0] hover:border-[#4A5D4E]/30'}`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-[0.2em]">{new Date(slot.startTime).toLocaleDateString('zh-TW')}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${slot.isBooked ? 'bg-zinc-100 text-zinc-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          {slot.isBooked ? '已預約' : '開放中'}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-[#2D3436]">
                        {new Date(slot.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!slot.isBooked && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-[#A0A4A8] hover:text-red-500 p-2 bg-[#F8F9F4] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
