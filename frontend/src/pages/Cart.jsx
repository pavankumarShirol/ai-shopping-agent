import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Cart({ userId, onNext }) {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    api.getCartSummary(userId).then(setCart);
  }, [userId]);

  if (!cart) return <div>Loading cart...</div>;

  return (
    <div>
      <h2>Your Cart</h2>

      <ul>
        {cart.items.map((item) => (
          <li key={item.productId}>
            <b>{item.name}</b> — ₹{item.price} × {item.quantity}
            = ₹{item.itemTotal}
          </li>
        ))}
      </ul>

      <h3>Total: ₹{cart.cartTotal}</h3>

      <button onClick={onNext}>Proceed to Checkout</button>
    </div>
  );
}