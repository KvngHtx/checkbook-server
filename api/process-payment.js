export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Invalid request method" });
  }

  try {
    const { routingNumber, accountNumber, accountType, amount } = req.body;

    if (!routingNumber || !accountNumber || !accountType || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        routingNumber,
        accountNumber,
        accountType,
        amount,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
