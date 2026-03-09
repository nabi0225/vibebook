import { v7 as uuidv7 } from 'uuid';
import { query, getOne } from "../db.js";

export const serviceService = {
  getMerchantServices: async (merchantId: string) => {
    return await query(
      "SELECT id, merchant_id as merchantId, name, price, duration, description FROM services WHERE merchant_id = ?",
      [merchantId]
    );
  },

  getServiceById: async (id: string) => {
    return await getOne(
      "SELECT id, merchant_id as merchantId, name, price, duration, description FROM services WHERE id = ?",
      [id]
    );
  },

  createService: async (merchantId: string, name: string, price: number, duration: number, description: string) => {
    const id = uuidv7();
    await query(
      "INSERT INTO services (id, merchant_id, name, price, duration, description) VALUES (?, ?, ?, ?, ?, ?)",
      [id, merchantId, name, price, duration, description]
    );
    return { id, merchantId, name, price, duration, description };
  },

  updateService: async (id: string, name: string, price: number, duration: number, description: string) => {
    await query(
      "UPDATE services SET name = ?, price = ?, duration = ?, description = ? WHERE id = ?",
      [name, price, duration, description, id]
    );
    return { id, name, price, duration, description };
  },

  deleteService: async (id: string) => {
    return await query("DELETE FROM services WHERE id = ?", [id]);
  },

  getMerchantUrl: (merchantId: string) => {
    return `/s/${merchantId}`;
  }
};
