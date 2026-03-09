
import React, { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle2, Phone, User, ArrowRight, Clock, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Slot, Booking, User as UserType } from '../types';
import { api, ApiError } from '../api/apiClient';
import { useError } from '../context/ErrorContext';

interface CustomerDashboardProps {
  user: UserType;
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const { showError } = useError();
  const [merchants, setMerchants] = useState<{ id: string; username: string }[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<{ id: string; username: string } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<'merchants' | 'services' | 'details' | 'my-bookings'>('merchants');

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const data = await api.customer.getMerchants();
      setMerchants(data as any);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取商家列表失敗');
      }
    }
  };

  const fetchServicesAndSlots = async (merchantId: string) => {
    try {
      const [sData, slData] = await Promise.all([
        api.customer.getServices(merchantId),
        api.customer.getSlots(merchantId)
      ]);
      setServices(sData as Service[]);
      setSlots(slData as Slot[]);
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取服務或時段失敗');
      }
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await api.customer.getMyBookings(user.id);
      setMyBookings(data as Booking[]);
      setStep('my-bookings');
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '獲取預約紀錄失敗');
      }
    }
  };

  const handleSelectMerchant = (merchant: { id: string; username: string }) => {
    setSelectedMerchant(merchant);
    fetchServicesAndSlots(merchant.id);
    setStep('services');
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;

    try {
      await api.customer.createBooking({
        serviceId: selectedService.id,
        slotId: selectedSlot.id,
        customerId: user.id,
      });
      setSelectedService(null);
      setSelectedSlot(null);
      fetchMyBookings();
    } catch (err: any) {
      if (err instanceof ApiError) {
        showError(err.message, err.status);
      } else {
        showError(err.message || '預約失敗');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3436] tracking-tight">
            {step === 'merchants' ? '選擇商家' : step === 'services' ? `預約 ${selectedMerchant?.username}` : step === 'details' ? '確認預約資訊' : '我的預約紀錄'}
          </h1>
          <p className="text-[#636E72] mt-1">您好，{user.nickname || user.name || user.username}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('merchants')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${step === 'merchants' || step === 'services' || step === 'details' ? 'bg-[#4A5D4E] text-white shadow-lg shadow-[#4A5D4E]/20' : 'bg-[#E8EAE0] text-[#636E72]'}`}
          >
            探索服務
          </button>
          <button
            onClick={fetchMyBookings}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${step === 'my-bookings' ? 'bg-[#4A5D4E] text-white shadow-lg shadow-[#4A5D4E]/20' : 'bg-[#E8EAE0] text-[#636E72]'}`}
          >
            我的預約
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'merchants' && (
          <motion.div
            key="merchants"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {merchants.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMerchant(m)}
                className="bg-white border border-[#E8EAE0] rounded-[2rem] p-8 text-left hover:border-[#4A5D4E]/30 hover:shadow-xl hover:shadow-[#4A5D4E]/5 transition-all group"
              >
                <div className="w-12 h-12 bg-[#F8F9F4] rounded-2xl flex items-center justify-center text-[#4A5D4E] mb-6 group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
                  <Store size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#2D3436] mb-2">{m.username}</h3>
                <p className="text-[#636E72] text-sm">點擊查看可預約的服務與時段</p>
                <div className="mt-6 flex items-center gap-2 text-[#4A5D4E] font-bold text-sm">
                  查看詳情 <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <section>
              <h2 className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-[0.2em] mb-6 ml-1">1. 選擇服務項目</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`text-left p-8 rounded-[2rem] border-2 transition-all ${selectedService?.id === service.id ? 'border-[#4A5D4E] bg-[#F8F9F4]' : 'border-[#E8EAE0] bg-white hover:border-[#A0A4A8]'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-[#2D3436]">{service.name}</h3>
                      <span className="text-[#4A5D4E] font-bold text-lg">${service.price}</span>
                    </div>
                    <p className="text-[#636E72] text-sm leading-relaxed line-clamp-2">{service.description}</p>
                  </button>
                ))}
              </div>
            </section>

            {selectedService && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-[0.2em] mb-6 ml-1">2. 選擇預約時段</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {slots.length === 0 && <p className="col-span-full text-[#636E72] italic py-10 text-center bg-white rounded-[2rem] border border-[#E8EAE0] border-dashed">該商家目前沒有可預約的時段</p>}
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${selectedSlot?.id === slot.id ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-lg shadow-[#4A5D4E]/20' : 'bg-white text-[#2D3436] border-[#E8EAE0] hover:border-[#A0A4A8]'}`}
                    >
                      <p className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider">{new Date(slot.startTime).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</p>
                      <p className="text-base font-bold">{new Date(slot.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {selectedService && selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-[#2D3436] text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 z-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-medium">{selectedService.name}</p>
                    <p className="text-lg font-bold">
                      {new Date(selectedSlot.startTime).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('details')}
                  className="w-full sm:w-auto bg-[#4A5D4E] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#3D4D40] transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  前往確認 <ArrowRight size={20} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white border border-[#E8EAE0] rounded-[2.5rem] p-10 shadow-xl shadow-[#4A5D4E]/5">
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-[#F8F9F4] rounded-3xl flex items-center justify-center text-[#4A5D4E] mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-[#2D3436]">確認您的預約</h2>
                <p className="text-[#636E72] mt-2">請再次核對預約資訊是否正確</p>
              </div>

              <div className="bg-[#F8F9F4] rounded-3xl p-8 space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#636E72]">預約商家</span>
                  <span className="font-bold text-[#2D3436]">{selectedMerchant?.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#636E72]">服務項目</span>
                  <span className="font-bold text-[#2D3436]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#636E72]">預約時間</span>
                  <span className="font-bold text-[#2D3436]">{new Date(selectedSlot?.startTime!).toLocaleString('zh-TW')}</span>
                </div>
                <div className="pt-4 border-t border-[#E8EAE0] flex justify-between items-center">
                  <span className="text-sm text-[#636E72]">服務價格</span>
                  <span className="text-2xl font-bold text-[#4A5D4E]">${selectedService?.price}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('services')}
                  className="flex-1 bg-[#E8EAE0] text-[#636E72] font-bold py-4 rounded-2xl hover:bg-[#D8DACE] transition-all"
                >
                  重新選擇
                </button>
                <button
                  onClick={handleBooking}
                  className="flex-[2] bg-[#4A5D4E] text-white font-bold py-4 rounded-2xl hover:bg-[#3D4D40] transition-all shadow-lg shadow-[#4A5D4E]/20"
                >
                  確認並送出預約
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'my-bookings' && (
          <motion.div
            key="my-bookings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid gap-6">
              {myBookings.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-[#E8EAE0] border-dashed">
                  <Calendar className="mx-auto text-[#A0A4A8] mb-4" size={48} />
                  <p className="text-[#636E72] italic">目前尚無預約紀錄</p>
                </div>
              )}
              {myBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-[#E8EAE0] rounded-[2rem] p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-[0.2em]">{booking.merchantName}</span>
                      <span className="w-1 h-1 bg-[#E8EAE0] rounded-full"></span>
                      <span className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-[0.2em]">已確認</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2D3436] mb-2">{booking.serviceName}</h3>
                    <div className="flex items-center gap-2 text-[#636E72]">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{new Date(booking.startTime!).toLocaleString('zh-TW')}</span>
                    </div>
                  </div>
                  <div className="bg-[#F8F9F4] rounded-2xl p-6 lg:w-80">
                    <p className="text-[10px] font-bold text-[#A0A4A8] uppercase tracking-widest mb-2">商家給您的備註</p>
                    <p className="text-sm text-[#2D3436] leading-relaxed italic">
                      {booking.merchantNote ? `"${booking.merchantNote}"` : '商家尚未提供備註'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
