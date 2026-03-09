
import React, { useState, useEffect } from 'react';
import { Calendar, Package, Clock, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Service, Slot } from '../types';
import { api, ApiError } from '../api/apiClient';
import { useError } from '../context/ErrorContext';

interface MerchantPageProps {
  merchantId: string;
}

export default function MerchantPage({ merchantId }: MerchantPageProps) {
  const { showError } = useError();
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, slData] = await Promise.all([
          api.merchant.getServices(merchantId),
          api.merchant.getSlots(merchantId)
        ]);
        setServices(sData as Service[]);
        setSlots((slData as Slot[]).filter(s => !s.isBooked));
      } catch (err: any) {
        if (err instanceof ApiError) {
          showError(err.message, err.status);
        } else {
          showError('無法載入商家資訊');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [merchantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A5D4E]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2D3436] tracking-tight mb-4">商家服務主頁</h1>
        <p className="text-[#636E72]">歡迎瀏覽我們的服務項目與預約時段</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-bold text-[#2D3436] mb-6 flex items-center gap-2">
            <Package className="text-[#4A5D4E]" /> 服務項目
          </h2>
          <div className="space-y-4">
            {services.length === 0 && <p className="text-[#A0A4A8] italic">目前尚無服務項目</p>}
            {services.map(service => (
              <div key={service.id} className="bg-white border border-[#E8EAE0] rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[#2D3436]">{service.name}</h3>
                  <span className="text-[#4A5D4E] font-bold text-xl">${service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-[#636E72] text-sm mb-3">
                  <Clock size={14} />
                  <span>{service.duration} 分鐘</span>
                </div>
                <p className="text-[#636E72] text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#2D3436] mb-6 flex items-center gap-2">
            <Calendar className="text-[#4A5D4E]" /> 可預約時段
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {slots.length === 0 && <p className="text-[#A0A4A8] italic">目前尚無可預約時段</p>}
            {slots.map(slot => (
              <div key={slot.id} className="bg-white border border-[#E8EAE0] rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest">{new Date(slot.startTime).toLocaleDateString('zh-TW')}</p>
                  <p className="text-lg font-bold text-[#2D3436]">
                    {new Date(slot.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button 
                  className="bg-[#4A5D4E] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#3D4D40] transition-colors"
                  onClick={() => alert('請先登入以進行預約')}
                >
                  立即預約
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
