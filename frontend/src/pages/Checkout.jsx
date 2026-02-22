import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Checkout({ userId, onPlaceOrder }) {
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    api.getAddresses(userId).then(setAddresses);
    api.getPaymentMethods(userId).then(setPayments);
  }, [userId]);

  const handleSelectAddress = async (id) => {
    await api.selectAddress(userId, id);
    setSelectedAddress(id);
  };

  const handleSelectPayment = async (id) => {
    await api.selectPayment(userId, id, cvv);
    setSelectedPayment(id);
  };

  return (
    <div>
      <h2>Checkout</h2>

      <h3>Select Address</h3>
      <ul>
        {addresses.map((a) => (
          <li key={a.id}>
            {a.label} — {a.area}, {a.city}
            <button onClick={() => handleSelectAddress(a.id)}>
              Select
            </button>
          </li>
        ))}
      </ul>

      <h3>Select Payment</h3>
      <input
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
      />
      <ul>
        {payments.map((p) => (
          <li key={p.id}>
            {p.type} ****{p.last4} (exp {p.expiryMonth})
            <button onClick={() => handleSelectPayment(p.id)}>
              Select
            </button>
          </li>
        ))}
      </ul>

      {selectedAddress && selectedPayment && (
        <button onClick={onPlaceOrder}>
          Place Order
        </button>
      )}
    </div>
  );
}