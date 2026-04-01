import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Package } from "lucide-react";

export default function Orders({ userId, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders(userId);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  if (loading) {
    return <div className="text-center py-20">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 font-medium"
      >
        ← Back to Products
      </button>

      <h2 className="text-3xl font-bold mb-6">My Orders</h2>

      {orders.length === 0 && (
        <div className="text-center text-gray-500 py-20">
          No orders found.
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white shadow-lg rounded-2xl p-6 border"
          >
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Order ID: {order.orderId}
                </h3>
                <p className="text-sm text-gray-500">
                  Placed on: {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{order.totalAmount}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm text-gray-700 mb-1"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold mb-1">Delivery Address</h4>
                <p>{order.address.label}</p>
                <p>{order.address.area}</p>
                <p>
                  {order.address.city} - {order.address.pincode}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Payment</h4>
                <p>
                  {order.payment.type} ending in {order.payment.last4}
                </p>
                <p>Expiry: {order.payment.expiryMonth}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}