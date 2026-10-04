const { isSupabaseConnected, getSupabaseClient, isMongoConnected, memoryStore } = require("../config/db");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "password123" },
  wallet_address: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['admin','manufacturer','distributor','wholesaler','pharmacist','customer'] },
  facility_name: { type: String },
  license_number: { type: String },
  contact_phone: { type: String },
  reason_for_access: { type: String },
  status: { type: String, default: 'pending', enum: ['pending','approved','rejected'] },
  admin_note: { type: String },
  approved_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", UserSchema);

// Initial default approved demo accounts
const DEFAULT_ACCOUNTS = [
  {
    id: "usr_admin",
    name: "System Administrator",
    email: "admin@medchain.io",
    password: "password123",
    wallet_address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    role: "admin",
    facility_name: "MedChain Network Operations Center",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_mfg",
    name: "Apex Pharma Labs (Mfg)",
    email: "manufacturer@apexpharma.com",
    password: "password123",
    wallet_address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    role: "manufacturer",
    facility_name: "Apex Pharma Labs Pvt. Ltd. (Facility #1)",
    license_number: "DL-MFG-2024-001",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_dist",
    name: "NorthStar Cold-Chain Logistics",
    email: "distributor@northstar.com",
    password: "password123",
    wallet_address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    role: "distributor",
    facility_name: "NorthStar Logistics Hub Alpha",
    license_number: "DL-DIST-2024-012",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_ws",
    name: "Metro Wholesale Drug Corp",
    email: "wholesaler@metrodrug.com",
    password: "password123",
    wallet_address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    role: "wholesaler",
    facility_name: "Metro Drug Distribution Center",
    license_number: "DL-WS-2024-089",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_pharma",
    name: "St. Jude Community Pharmacy",
    email: "pharmacist@stjude.org",
    password: "password123",
    wallet_address: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    role: "pharmacist",
    facility_name: "St. Jude Community Pharmacy - Main St",
    license_number: "DL-PH-2024-555",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_cust",
    name: "Aarav Patel (Patient / Consumer)",
    email: "customer@patient.com",
    password: "password123",
    wallet_address: "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
    role: "customer",
    facility_name: "City General Hospital OPD",
    contact_phone: "+91-98765-43210",
    status: "approved",
    approved_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

if (!memoryStore.users) {
  memoryStore.users = [...DEFAULT_ACCOUNTS];
}

const UserService = {
  async create(data) {
    const payload = {
      password: data.password || "password123",
      status: data.status || "pending",
      created_at: new Date().toISOString(),
      ...data,
      wallet_address: (data.wallet_address || "").toLowerCase(),
    };
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data: inserted, error } = await supabase.from("users").insert([payload]).select().single();
        if (!error && inserted) return inserted;
        if (error) console.warn("Supabase user insert note (falling back to memory):", error.message);
      } catch (e) {
        console.warn("Supabase error (falling back):", e.message);
      }
    }
    if (isMongoConnected()) {
      return await UserModel.create(payload);
    }
    const doc = { ...payload, id: payload.id || ("usr_" + Date.now()) };
    // Update or insert
    const idx = memoryStore.users.findIndex(u => u.wallet_address.toLowerCase() === doc.wallet_address.toLowerCase());
    if (idx >= 0) {
      memoryStore.users[idx] = doc;
    } else {
      memoryStore.users.push(doc);
    }
    return doc;
  },

  async findByEmail(email) {
    const em = (email || "").toLowerCase().trim();
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("users").select("*").ilike("email", em).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await UserModel.findOne({ email: { $regex: new RegExp(`^${em}$`, 'i') } }).lean();
    }
    return memoryStore.users.find(u => (u.email || "").toLowerCase().trim() === em) || null;
  },

  async findByAddress(wallet_address) {
    const addr = (wallet_address || "").toLowerCase().trim();
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("users").select("*").ilike("wallet_address", addr).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await UserModel.findOne({ wallet_address: { $regex: new RegExp(`^${addr}$`, 'i') } }).lean();
    }
    return memoryStore.users.find(u => (u.wallet_address || "").toLowerCase().trim() === addr) || null;
  },

  async findAll(filter = {}) {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        let q = supabase.from("users").select("*").order("created_at", { ascending: false });
        if (filter.status) q = q.eq("status", filter.status);
        if (filter.role) q = q.eq("role", filter.role);
        const { data, error } = await q;
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await UserModel.find(filter).sort({ created_at: -1 }).lean();
    }
    let results = [...memoryStore.users];
    if (filter.status) results = results.filter(u => u.status === filter.status);
    if (filter.role) results = results.filter(u => u.role === filter.role);
    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateStatus(id, status, admin_note = "") {
    const updatePayload = {
      status,
      admin_note,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    };
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("users").update(updatePayload).eq("id", id).select().single();
        if (!error && data) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await UserModel.findByIdAndUpdate(id, updatePayload, { new: true }).lean();
    }
    const u = memoryStore.users.find(u => String(u.id) === String(id));
    if (u) Object.assign(u, updatePayload);
    return u;
  },

  async stats() {
    const all = await this.findAll();
    return {
      total: all.length,
      pending: all.filter(u => u.status === 'pending').length,
      approved: all.filter(u => u.status === 'approved').length,
      rejected: all.filter(u => u.status === 'rejected').length,
      byRole: {
        manufacturer: all.filter(u => u.role === 'manufacturer').length,
        distributor: all.filter(u => u.role === 'distributor').length,
        wholesaler: all.filter(u => u.role === 'wholesaler').length,
        pharmacist: all.filter(u => u.role === 'pharmacist').length,
        customer: all.filter(u => u.role === 'customer').length,
      }
    };
  }
};

module.exports = UserService;
