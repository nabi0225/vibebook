import { v7 as uuidv7 } from 'uuid';
import { query } from "../db.js";

export const merchantService = {
  getServices: async (merchantId) => {
    return await query("SELECT id, name, price, description FROM services WHERE merchant_id = ?", [merchantId]);
  },

  createService: async (merchantId, name, price, description) => {
    const id = uuidv7();
    await query("INSERT INTO services (id, merchant_id, name, price, description) VALUES (?, ?, ?, ?, ?)", [id, merchantId, name, price, description]);
    return { id };
  },

  deleteService: async (id) => {
    return await query("DELETE FROM services WHERE id = ?", [id]);
  },

  getSlots: async (merchantId) => {
    return await query("SELECT id, start_time as startTime, end_time as endTime, is_booked as isBooked FROM slots WHERE merchant_id = ?", [merchantId]);
  },

  createSlot: async (merchantId, startTime, endTime) => {
    const id = uuidv7();
    await query("INSERT INTO slots (id, merchant_id, start_time, end_time) VALUES (?, ?, ?, ?)", [id, merchantId, startTime, endTime]);
    return { id };
  },

  deleteSlot: async (id) => {
    return await query("DELETE FROM slots WHERE id = ?", [id]);
  },

  getBookings: async (merchantId) => {
    return await query(`
      SELECT b.id, b.merchant_note as merchantNote, s.name as serviceName, 
             sl.start_time as startTime, sl.end_time as endTime, 
             u.name as customerName, u.phone as customerPhone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      JOIN users u ON b.customer_id = u.id
      WHERE s.merchant_id = ?
      ORDER BY sl.start_time ASC
    `, [merchantId]);
  },

  updateBookingNote: async (id, note) => {
    return await query("UPDATE bookings SET merchant_note = ? WHERE id = ?", [note, id]);
  }
};
