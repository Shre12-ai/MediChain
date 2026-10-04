const mongoose = require("mongoose");
const { isMongoConnected, isSupabaseConnected, getSupabaseClient, memoryStore } = require("../config/db");

const NodeProfileSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    roleId: { type: Number, required: true },
    licenseNumber: { type: String },
    facilityLocation: { type: String },
    contactEmail: { type: String },
  },
  { timestamps: true }
);

const NodeProfileModel = mongoose.model("NodeProfile", NodeProfileSchema);

const NodeProfileService = {
  async upsert(address, data) {
    const payload = { ...data, address: address.toLowerCase() };
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data: upserted, error } = await supabase.from("node_profiles").upsert([payload], { onConflict: "address" }).select().single();
        if (!error && upserted) return upserted;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await NodeProfileModel.findOneAndUpdate(
        { address: address.toLowerCase() },
        payload,
        { upsert: true, new: true }
      );
    }
    const existing = memoryStore.nodes.get(address.toLowerCase()) || {};
    const updated = { ...existing, ...payload };
    memoryStore.nodes.set(address.toLowerCase(), updated);
    return updated;
  },

  async findOne(filter) {
    const address = filter.address ? filter.address.toLowerCase() : null;
    if (isSupabaseConnected() && address) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("node_profiles").select("*").eq("address", address).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await NodeProfileModel.findOne(filter).lean();
    }
    if (address) return memoryStore.nodes.get(address) || null;
    return null;
  },

  async find() {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("node_profiles").select("*");
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await NodeProfileModel.find().lean();
    }
    return Array.from(memoryStore.nodes.values());
  }
};

module.exports = NodeProfileService;
