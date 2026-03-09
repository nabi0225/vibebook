import { merchantService } from "../services/merchantService.js";
import { serviceService } from "../services/serviceService.js";

export const merchantController = {
  getServices: async (req, res) => {
    const services = await serviceService.getMerchantServices(req.params.id);
    res.json(services);
  },

  createService: async (req, res) => {
    const { merchantId, name, price, duration, description } = req.body;
    try {
      const result = await serviceService.createService(merchantId, name, price, duration, description);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: "Service name must be unique for this merchant" });
    }
  },

  updateService: async (req, res) => {
    const { name, price, duration, description } = req.body;
    try {
      const result = await serviceService.updateService(req.params.id, name, price, duration, description);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: "Failed to update service" });
    }
  },

  deleteService: async (req, res) => {
    await serviceService.deleteService(req.params.id);
    res.json({ success: true });
  },

  getSlots: async (req, res) => {
    const slots = await merchantService.getSlots(req.params.id);
    res.json(slots);
  },

  createSlot: async (req, res) => {
    const { merchantId, startTime, endTime } = req.body;
    const result = await merchantService.createSlot(merchantId, startTime, endTime);
    res.status(201).json(result);
  },

  deleteSlot: async (req, res) => {
    await merchantService.deleteSlot(req.params.id);
    res.json({ success: true });
  },

  getBookings: async (req, res) => {
    const bookings = await merchantService.getBookings(req.params.id);
    res.json(bookings);
  },

  updateBookingNote: async (req, res) => {
    await merchantService.updateBookingNote(req.params.id, req.body.note);
    res.json({ success: true });
  }
};
