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
  const {rows} = await client.query(selectQuery, values)
  return rows[0]
};

const updatePaymentStatus = async ({ referenceId, status }, client = pool) => {
  const query = `
    UPDATE payments SET status = $1 WHERE reference_id = $2 RETURNING id, reference_id, status
  `;
  const { rows } = await client.query(query, [status, referenceId]);
  return rows[0];
};

module.exports = { createPendingPayment, findPaymentByReference, updatePaymentStatus };
