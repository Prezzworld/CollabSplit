const pool = require("../config/db");

const createPendingPayment = async (
  { paymentLinkId, amount, currency, payerEmail, referenceId },
  client = pool,
) => {
  const insertQuery = `
    INSERT INTO payments (payment_link_id, amount, currency, payer_email, reference_id, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id, payment_link_id, amount, currency, payer_email, reference_id, status, created_at
  `;
  const values = [paymentLinkId, amount, currency, payerEmail, referenceId];
  const { rows } = await client.query(insertQuery, values);
  return rows[0];
};

const findPaymentByReference = async (referenceId, client = pool) => {
  const selectQuery = `
    SELECT id, payment_link_id, amount, currency, payer_email, reference_id, status, created_at
    FROM payments
    WHERE reference_id = $1
  `;
  const values = [referenceId];
  const { rows } = await client.query(selectQuery, values);
  return rows[0];
};

const updatePaymentStatus = async ({ referenceId, status }, client = pool) => {
  const query = `
    UPDATE payments SET status = $1 WHERE reference_id = $2 RETURNING id, reference_id, status
  `;
  const { rows } = await client.query(query, [status, referenceId]);
  return rows[0];
};

const updatePaymentSuccess = async (
  { referenceId, payerName, feeAmount },
  client = pool,
) => {
  const updateQuery = `
    UPDATE payments
    SET status = 'successful', payer_name = $1, fees_amount = $2
    WHERE reference_id = $3
    RETURNING id, payment_link_id, amount, currency, payer_email, payer_name, reference_id, status, created_at
  `;
  const values = [referenceId, payerName, feeAmount];
  const { rows } = await client.query(updateQuery, values);
  return rows[0];
};

const createPayout = async (payouts, client = pool) => {
  const insertQuery = `
    INSERT INTO payouts (
      payment_id, user_id, amount, percentage, bank_name, bank_code,
      account_number, currency, country, reference_id, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
    RETURNING id, payment_id, user_id, amount, reference_id, status
  `;
  const results = [];
  for (const p of payouts) {
    const values = [p.paymentId, p.userId, p.amount, p.percentage, p.bankName, p.bankCode, p.accountNumber, p.currency, p.country, p.referenceId];
    const { rows } = await client.query(insertQuery, values);
    results.push(rows[0]);
  }
  return results;
}

module.exports = {
  createPendingPayment,
  findPaymentByReference,
  updatePaymentStatus,
  updatePaymentSuccess,
  createPayout
};
