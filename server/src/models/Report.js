const mongoose = require("mongoose");
const { isMongoConnected, isSupabaseConnected, getSupabaseClient, memoryStore } = require("../config/db");

const ReportSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true },
    reporterAddress: { type: String, required: true },
    reporterRole: { type: String, default: "Customer" },
    attributedNode: { type: String, required: true },
    reason: { type: String, required: true },
    evidenceImages: [{ type: String }],
    location: { type: String },
    txHash: { type: String },
  },
  { timestamps: true }
);

const ReportModel = mongoose.model("Report", ReportSchema);

const ReportService = {
  async create(data) {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        const { data: inserted, error } = await supabase.from("reports").insert([data]).select().single();
        if (!error && inserted) return inserted;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await ReportModel.create(data);
    }
    const doc = { ...data, _id: "rep_" + Date.now(), createdAt: new Date() };
    memoryStore.reports.push(doc);
    return doc;
  },

  async find(filter = {}) {
    if (isSupabaseConnected()) {
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from("reports").select("*");
        for (const [k, v] of Object.entries(filter)) {
          query = query.eq(k, v);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    if (isMongoConnected()) {
      return await ReportModel.find(filter).lean();
    }
    return memoryStore.reports.filter((r) => {
      for (const [k, v] of Object.entries(filter)) {
        if (r[k] !== v) return false;
      }
      return true;
    });
  }
};

module.exports = ReportService;
