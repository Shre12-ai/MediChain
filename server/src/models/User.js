const { isSupabaseConnected, getSupabaseClient, isMongoConnected, memoryStore } = require("../config/db");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  wallet_address: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['manufacturer','distributor','wholesaler','pharmacist','customer'] },
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

if (!memoryStore.users) {
  memoryStore.users = [];
}

const UserService = {
  async create(data) {
    const payload = { ...data, status: 'pending', created_at: new Date().toISOString() };
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
    const doc = { ...payload, id: "usr_" + Date.now() };
    memoryStore.users.push(doc);
    return doc;
  },

  async findByAddress(wallet_address) {
    const addr = wallet_address.toLowerCase();
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
    return memoryStore.users.find(u => u.wallet_address.toLowerCase() === addr) || null;
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
