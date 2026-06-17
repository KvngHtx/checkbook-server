export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Invalid request method" });
  }

  try {
    const {
      provider,        // "checkbook" or "stripe"
      method,          // "ach" or "card" (for checkbook)
      routingNumber,
      accountNumber,
      accountType,
      cardNumber,
      expiry,          // "MM/YY"
      cvv,
      amount
    } = req.body;

    if (!provider || !amount) {
      return res.status(400).json({ success: false, error: "Missing provider or amount" });
    }

    // ---------------- CHECKBOOK ----------------
    if (provider === "checkbook") {
      const CHECKBOOK_SECRET = process.env.CHECKBOOK_SECRET || "YOUR_CHECKBOOK_SECRET_KEY";

      if (method === "ach") {
        if (!routingNumber || !accountNumber || !accountType) {
          return res.status(400).json({ success: false, error: "Missing ACH fields" });
        }
      }

      if (method === "card") {
        if (!cardNumber || !expiry || !cvv) {
          return res.status(400).json({ success: false, error: "Missing card fields" });
        }
      }

      let payload = { amount };

      if (method === "ach") {
        payload = {
          type: "ach",
          routing_number: routingNumber,
          account_number: accountNumber,
          account_type: accountType,
          amount
        };
      } else if (method === "card") {
        payload = {
          type: "card",
          card_number: cardNumber.replace(/\s+/g, ""),
          expiry,
          cvv,
          amount
        };
      } else {
        return res.status(400).json({ success: false, error: "Unknown payment method" });
      }

      const response = await fetch("https://api.checkbook.io/v3/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHECKBOOK_SECRET}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: data.error || "Checkbook payment failed",
          raw: data
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment processed via Checkbook",
        data
      });
    }
