import { v7 as uuidv7 } from 'uuid';
import { query, getOne } from "../db.js";

const formatPhoneE164 = (phone: string, countryCode: string) => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  // Remove leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // Clean country code
  const cc = countryCode.replace(/\D/g, '');
  return `+${cc}${cleaned}`;
};

export const authService = {
  register: async (username, password, phone, countryCode) => {
    const phoneE164 = formatPhoneE164(phone, countryCode);

    // 1. Check if user exists by phone_e164
    let user = await getOne("SELECT id FROM users WHERE phone_e164 = ?", [phoneE164]);
    let userId: string;

    if (!user) {
      // Create new user
      userId = uuidv7();
      await query(
        "INSERT INTO users (id, username, password, phone, phone_e164, country_code) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, username, password, phone, phoneE164, countryCode]
      );
    } else {
      userId = user.id;
    }

    // 2. Always ensure customer profile exists
    const customerProfile = await getOne(`SELECT user_id FROM customer_profiles WHERE user_id = ?`, [userId]);
    if (!customerProfile) {
      await query(`INSERT INTO customer_profiles (user_id) VALUES (?)`, [userId]);
    }

    // 3. Get roles
    const roles = await authService.getUserRoles(userId);

    return { id: userId, username, phone, phoneE164, countryCode, roles };
  },

  getUserRoles: async (userId: string) => {
    const roles: string[] = [];
    const merchant = await getOne("SELECT user_id FROM merchant_profiles WHERE user_id = ?", [userId]);
    if (merchant) roles.push('merchant');
    const customer = await getOne("SELECT user_id FROM customer_profiles WHERE user_id = ?", [userId]);
    if (customer) roles.push('customer');
    return roles;
  },

  activateMerchantRole: async (userId: string) => {
    const merchant = await getOne("SELECT user_id FROM merchant_profiles WHERE user_id = ?", [userId]);
    if (!merchant) {
      await query("INSERT INTO merchant_profiles (user_id) VALUES (?)", [userId]);
    }
  },

  updateProfile: async (id, name, nickname, gender) => {
    await query(
      "UPDATE users SET name = ?, nickname = ?, gender = ? WHERE id = ?",
      [name, nickname, gender, id]
    );
    const user = await getOne("SELECT id, username, phone, phone_e164, name, nickname, gender, country_code FROM users WHERE id = ?", [id]);
    const roles = await authService.getUserRoles(id);
    return { ...user, roles };
  },

  login: async (username, password, countryCode?: string) => {
    let phoneE164 = username;
    if (countryCode) {
      phoneE164 = formatPhoneE164(username, countryCode);
    }

    const user = await getOne(
      "SELECT id, username, phone, phone_e164, name, nickname, gender, country_code FROM users WHERE (phone_e164 = ? OR username = ?) AND password = ?",
      [phoneE164, username, password]
    );
    if (user) {
      const roles = await authService.getUserRoles(user.id);
      return { ...user, roles };
    }
    return null;
  }
};
