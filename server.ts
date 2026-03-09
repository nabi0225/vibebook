import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// Controllers
import { authController } from "./server/controllers/authController.js";
import { merchantController } from "./server/controllers/merchantController.js";
import { customerController } from "./server/controllers/customerController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- RESTful API Routes ---

  // Auth
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/activate-merchant", authController.activateMerchantRole);
  app.post("/api/auth/update-profile", authController.updateProfile);

  // Merchant
  app.get("/api/merchants/:id/services", merchantController.getServices);
  app.post("/api/services", merchantController.createService);
  app.put("/api/services/:id", merchantController.updateService);
  app.delete("/api/services/:id", merchantController.deleteService);
  app.get("/api/merchants/:id/slots", merchantController.getSlots);
  app.post("/api/slots", merchantController.createSlot);
  app.delete("/api/slots/:id", merchantController.deleteSlot);
  app.get("/api/merchants/:id/bookings", merchantController.getBookings);
  app.patch("/api/bookings/:id/note", merchantController.updateBookingNote);

  // Customer
  app.get("/api/merchants", customerController.getMerchants);
  app.get("/api/merchants/:merchantId/available-services", customerController.getMerchantServices);
  app.get("/api/merchants/:merchantId/available-slots", customerController.getMerchantSlots);
  app.post("/api/bookings", customerController.createBooking);
  app.get("/api/customers/:id/bookings", customerController.getMyBookings);

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
