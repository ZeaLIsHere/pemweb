import express from "express";
import midtransClient from "midtrans-client";
import bodyParser from "body-parser";
import cors from "cors";
import 'dotenv/config';

const app = express();

// Flexible CORS: support comma-separated origins and common localhost variants in dev
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const allowedOrigins = ALLOWED_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGIN === '*' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow common localhost variants for dev if one of them is configured
    const devOrigins = new Set([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]);
    if (allowedOrigins.some(o => devOrigins.has(o)) && devOrigins.has(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Midtrans configuration via environment
const MIDTRANS_SERVER_KEY = (process.env.MIDTRANS_SERVER_KEY || '').trim();
let MIDTRANS_IS_PRODUCTION = String(process.env.MIDTRANS_IS_PRODUCTION || "false") === "true";

// Safety: auto-switch mode by key prefix
if (MIDTRANS_SERVER_KEY) {
  const isSandboxKey = MIDTRANS_SERVER_KEY.startsWith('SB-');
  const isLiveKey = MIDTRANS_SERVER_KEY.startsWith('Mid-') || MIDTRANS_SERVER_KEY.startsWith('MI');
  if (isSandboxKey && MIDTRANS_IS_PRODUCTION) {
    console.warn('[WARN] Sandbox key detected with MIDTRANS_IS_PRODUCTION=true. Forcing sandbox mode.');
    MIDTRANS_IS_PRODUCTION = false;
  }
  if (isLiveKey && !MIDTRANS_IS_PRODUCTION) {
    console.warn('[WARN] Live key detected with MIDTRANS_IS_PRODUCTION=false. Forcing production mode.');
    MIDTRANS_IS_PRODUCTION = true;
  }
}

if (!MIDTRANS_SERVER_KEY) {
  console.warn("[WARN] MIDTRANS_SERVER_KEY not set. Set it in environment variables.");
}

const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY || "",
});

console.log(`[Midtrans] mode=${MIDTRANS_IS_PRODUCTION ? 'production' : 'sandbox'}, keyPrefix=${MIDTRANS_SERVER_KEY.slice(0, 12)}`);

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Create transaction
app.post("/create-transaction", async (req, res) => {
  try {
    if (!MIDTRANS_SERVER_KEY) {
      return res.status(500).json({ error: "Server misconfigured: MIDTRANS_SERVER_KEY missing" });
    }

    const amount = Math.round(Number(req.body?.amount || 0));
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const name = req.body?.name || "Customer";
    const email = req.body?.email || "customer@example.com";

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        gross_amount: amount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: name,
        email,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    console.error("Create transaction error:", err?.response?.data || err.message || err);
    // If Midtrans returns an error response with status and data
    const status = err?.httpStatusCode || err?.response?.status || 500;
    const data = err?.response?.data || {};
    const message = data?.message || err.message || 'Unknown error';
    const error_messages = data?.error_messages || (data?.validation_messages ? [data?.validation_messages] : undefined);
    res.status(status).json({ 
      error: "Failed to create transaction", 
      message, 
      error_messages,
      mode: MIDTRANS_IS_PRODUCTION ? 'production' : 'sandbox'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
