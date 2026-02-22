export default function OrderSuccess({ orderId, onContinue }) {
  return (
    <div>
      <h2>✅ Order Placed Successfully</h2>

      <p>
        <strong>Order ID:</strong> {orderId}
      </p>

      <p>Thank you for your purchase.</p>

      <button onClick={onContinue}>
        Continue Shopping
      </button>
    </div>
  );
}