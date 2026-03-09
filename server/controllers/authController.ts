import { authService } from "../services/authService.js";

export const authController = {
  register: async (req, res) => {
    const { username, password, phone, countryCode } = req.body;
    try {
      const user = await authService.register(username, password, phone, countryCode);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: "Username or phone already exists" });
    }
  },

  activateMerchantRole: async (req, res) => {
    const { userId } = req.body;
    try {
      await authService.activateMerchantRole(userId);
      const roles = await authService.getUserRoles(userId);
      res.json({ roles });
    } catch (err) {
      res.status(400).json({ error: "Failed to activate merchant role" });
    }
  },

  updateProfile: async (req, res) => {
    const { id, name, nickname, gender } = req.body;
    try {
      const user = await authService.updateProfile(id, name, nickname, gender);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  },

  login: async (req, res) => {
    const { username, password, countryCode } = req.body;
    const user = await authService.login(username, password, countryCode);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }
};
