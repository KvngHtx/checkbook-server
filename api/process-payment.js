export default async function handler(req, res) {
  try {
    // Allow only POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Basic CORS (optional)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const { name, amount, accountNumber, routingNumber } = req.body || {};

    // Validate required fields
    if (!name || !amount || !accountNumber || !routingNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Validate account number (basic)
    if (!/^\d{6,17}$/.test(accountNumber)) {
      return res.status(400).json({ error: "Invalid account number" });
    }

    // Validate routing number (basic ABA)
    if (!/^\d{9}$/.test(routingNumber)) {
      return res.status(400).json({ error: "Invalid routing number" });
    }

    // --- PLACE YOUR PAYMENT LOGIC HERE ---
    // Example:
    // const response = await checkbook.sendPayment({ ... });

    // Simulated success
    return res.status(200).json({
      success: true,
      message: "Payment processed successfully"
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
