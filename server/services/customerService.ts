import { v7 as uuidv7 } from 'uuid';
import { query, getOne } from "../db.js";

export const customerService = {
  getMerchants: async () => {
    return await query(`
      SELECT u.id, u.name as username 
      FROM users u
      JOIN merchant_profiles mp ON u.id = mp.user_id
    `);
  },

  getMerchantServices: async (merchantId) => {
    return await query("SELECT id, name, price, description FROM services WHERE merchant_id = ?", [merchantId]);
  },

  getMerchantSlots: async (merchantId) => {
    return await query("SELECT id, start_time as startTime, end_time as endTime FROM slots WHERE merchant_id = ? AND is_booked = 0", [merchantId]);
  },

  createBooking: async (serviceId, slotId, customerId) => {
    // Check slot
    const slot = await getOne("SELECT is_booked FROM slots WHERE id = ?", [slotId]);
    if (!slot || slot.is_booked) {
      throw new Error("SLOT_BOOKED");
    }

    await query("UPDATE slots SET is_booked = 1 WHERE id = ?", [slotId]);
    const id = uuidv7();
    await query("INSERT INTO bookings (id, service_id, slot_id, customer_id) VALUES (?, ?, ?, ?)", [id, serviceId, slotId, customerId]);
    return { id };
  },

  getMyBookings: async (customerId) => {
    return await query(`
      SELECT b.id, b.merchant_note as merchantNote, s.name as serviceName, 
             sl.start_time as startTime, sl.end_time as endTime, 
             m.name as merchantName
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      JOIN users m ON s.merchant_id = m.id
      WHERE b.customer_id = ?
      ORDER BY sl.start_time ASC
    `, [customerId]);
  }
};
