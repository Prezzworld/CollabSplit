const crypto = require("crypto")
const pool = require("../config/db");
const {
  findPaymentByReference,
  updatePaymentSuccess,
  createPayout
} = require("../repositories/payment.repository");
const {findLinkById} = require("../repositories/paymentLink.repository")
const {assertProjectPayable, calculateSplits} = require("../utils/helperFunctions")

const processChargeSuccess = async (data) => {
  const payment = await findPaymentByReference(data.reference)
  if(!payment) {
    console.log("No payment found for this reference")
    return
  }
  if(payment.status !== "pending") {
    console.log("Payment already processed")
    return
  }

  const expectedKobo = Math.round(Number(payment.amount) * 100)
  if(data.amount !== expectedKobo || data.currency !== payment.currency) {
    console.error("Amount or currency mismatch", data.reference)
    return
  }

  const feeKobo = Number(data.fees || 0)
  const netNaira = (expectedKobo - feeKobo) / 100;
  const payerName = [data.customer?.first_name, data.customer?.last_name].filter(Boolean).join(" ") || data.customer?.email || payment.payer_email

  const client  = await pool.connect();
  try {
    await client.query("BEGIN");

    const updated = await updatePaymentSuccess({
      referenceId: payment.reference_id,
      payerName,
      feesAmount: feeKobo / 100
    }, client)
    if(!updated) {
      await client.query("ROLLBACK")
      return
    }

    const link = await findLinkById(payment.payment_link_id, client)
    const members = await assertProjectPayable(link.project_id)

    const splits = await calculateSplits(netNaira, members)
    const payouts = splits.map(s => ({
      ...s,
      paymentId: payment.id,
      currency: payment.currency,
      referenceId: `po_${crypto.randomBytes(12).toString("hex")}`
    }))
    await createPayout(payouts, client)

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
};

module.exports = { processChargeSuccess };
