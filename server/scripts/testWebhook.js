require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

const [reference, amountNaira] = process.argv.slice(2);
const body = JSON.stringify({
  event: "charge.success",
  data: {
    reference,
    amount: Math.round(Number(amountNaira) * 100),
    currency: "NGN",
    fees: 150,
    customer: {
      email: "payer@test.com",
      first_name: "Test",
      last_name: "Payer",
    },
  },
});
const signature = crypto
  .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
  .update(body)
  .digest("hex");

axios
  .post("http://localhost:5000/api/v1/webhooks/paystack", body, {
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": signature,
    },
  })
  .then((r) => console.log(r.status, r.data))
  .catch((e) => console.log(e.response?.status, e.response?.data || e.message));
