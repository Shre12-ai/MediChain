const mongoose = require("mongoose");
const { isMongoConnected, isSupabaseConnected, getSupabaseClient, memoryStore } = require("../config/db");

const BatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, unique: true },
    medicineName: { type: String, required: true },
    composition: { type: String },
    dosage: { type: String },
    manufacturerName: { type: String, required: true },
    mfgDate: { type: Date, required: true },
    expDate: { type: Date, required: true },
    storageTemperature: { type: String, default: "15°C - 25°C" },
    packageType: { type: String, default: "Blister Pack (10x10)" },
    qrCodeDataUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const BatchModel = mongoose.model("Batch", BatchSchema);

const BatchService = {
  async create(data) {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data: inserted, error } = await supabase.from("batches").insert([data]).select().single();
        if (!error && inserted) return inserted;
        if (error) console.warn("Supabase insert notice:", error.message);
      } catch (e) {
        console.warn("Supabase error:", e.message);
      }
    }
    if (isMongoConnected()) {
      return await BatchModel.create(data);
    }
    const doc = { ...data, _id: "mem_" + Date.now(), createdAt: new Date() };
    memoryStore.batches.set(data.batchNumber, doc);
    return doc;
  },

  async findOne(filter) {
    if (isSupabaseConnected() && filter.batchNumber) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("batches").select("*").eq("batchNumber", filter.batchNumber).single();
        if (!error && data) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await BatchModel.findOne(filter).lean();
    }
    if (filter.batchNumber) {
      return memoryStore.batches.get(filter.batchNumber) || null;
    }
    for (const batch of memoryStore.batches.values()) {
      let match = true;
      for (const [k, v] of Object.entries(filter)) {
        if (batch[k] !== v) match = false;
      }
      if (match) return batch;
    }
    return null;
  },

  async find(filter = {}) {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.from("batches").select("*");
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await BatchModel.find(filter).lean();
    }
    return Array.from(memoryStore.batches.values());
  },

  async updateOne(filter, update) {
    if (isSupabaseConnected() && filter.batchNumber) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("batches").update(update.$set || update).eq("batchNumber", filter.batchNumber);
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await BatchModel.updateOne(filter, update);
    }
    const existing = await this.findOne(filter);
    if (existing) {
      Object.assign(existing, update.$set || update);
      memoryStore.batches.set(existing.batchNumber, existing);
    }
    return { modifiedCount: existing ? 1 : 0 };
  }
};

module.exports = BatchService;
