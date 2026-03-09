import { customerService } from "../services/customerService.js";

export const customerController = {
  getMerchants: async (req, res) => {
    const merchants = await customerService.getMerchants();
    res.json(merchants);
  },

  getMerchantServices: async (req, res) => {
    const services = await customerService.getMerchantServices(req.params.merchantId);
    res.json(services);
  },

  getMerchantSlots: async (req, res) => {
    const slots = await customerService.getMerchantSlots(req.params.merchantId);
    res.json(slots);
  },

  createBooking: async (req, res) => {
    const { serviceId, slotId, customerId } = req.body;
    try {
      const result = await customerService.createBooking(serviceId, slotId, customerId);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "SLOT_BOOKED") {
        res.status(400).json({ error: "Slot is already booked" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getMyBookings: async (req, res) => {
    const bookings = await customerService.getMyBookings(req.params.id);
    res.json(bookings);
  }
};
