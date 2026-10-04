const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");

let isMongoConnected = false;
let supabaseClient = null;

// In-memory store fallback
const memoryStore = {
  batches: new Map(),
  nodes: new Map(),
  reports: [],
};

const initSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      console.log("✓ Connected to Supabase Cloud Database at:", url);
      return supabaseClient;
    } catch (err) {
      console.warn("⚠️ Failed to initialize Supabase client:", err.message);
    }
  }
  return null;
};

const connectDB = async () => {
  // 1. Try Supabase first if configured
  if (initSupabase()) {
    return;
  }

  // 2. Try MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medchain";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log("✓ Connected to MongoDB at:", mongoUri);
  } catch (err) {
    isMongoConnected = false;
    console.warn("⚠️ Database offline. Running with in-memory persistence fallback.");
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getSupabaseClient: () => supabaseClient,
  isSupabaseConnected: () => !!supabaseClient,
  memoryStore,
};
