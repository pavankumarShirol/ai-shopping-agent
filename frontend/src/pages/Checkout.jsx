import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MapPin, CreditCard, ArrowLeft, CheckCircle, Lock } from "lucide-react";

export default function Checkout({ userId, onPlaceOrder, onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, [userId]);

  const loadCheckoutData = async () => {
    try {
      const [addressData, paymentData] = await Promise.all([
        api.getAddresses(userId),
        api.getPaymentMethods(userId)
      ]);
      setAddresses(addressData || []);
      setPayments(paymentData || []);
    } catch (error) {
      console.error("Failed to load checkout data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (id) => {
    try {
      await api.selectAddress(userId, id);
      setSelectedAddress(id);
    } catch (error) {
      console.error("Failed to select address:", error);
    }
  };

  const handleSelectPayment = async (id) => {
    if (!cvv) {
      alert("Please enter CVV");
      return;
    }
    try {
      await api.selectPayment(userId, id, cvv);
      setSelectedPayment(id);
    } catch (error) {
      console.error("Failed to select payment:", error);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await onPlaceOrder();
    } catch (error) {
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
              </div>
            </div>

            <div className="p-6">
              {addresses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No addresses available</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => handleSelectAddress(address.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === address.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            {address.label}
                          </p>
                          <p className="text-gray-600">
                            {address.area}, {address.city}
                          </p>
                        </div>
                        {selectedAddress === address.id && (
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative max-w-xs">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payment methods available</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      onClick={() => handleSelectPayment(payment.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPayment === payment.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            {payment.type}
                          </p>
                          <p className="text-gray-600">
                            ****{payment.last4} • Exp {payment.expiryMonth}
                          </p>
                        </div>
                        {selectedPayment === payment.id && (
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedAddress && selectedPayment && (
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
