import { useState } from "react";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState("products");
  const [orderId, setOrderId] = useState(null);

  const BASE_URL = "http://localhost:4000";

  if (!userId) {
    return <Login onLogin={setUserId} />;
  }

  if (page === "products") {
    return (
      <>
        <Products userId={userId} />
        <button onClick={() => setPage("cart")}>Go to Cart</button>
      </>
    );
  }

  if (page === "cart") {
    return (
      <Cart
        userId={userId}
        onNext={() => setPage("checkout")}
      />
    );
  }

  if (page === "checkout") {
    return (
      <Checkout
        userId={userId}
        onPlaceOrder={async () => {
          // 🔴 FIX: STORE fetch RESPONSE in res
          const res = await fetch(`${BASE_URL}/orders/place`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
          });

          const data = await res.json();   // ✅ res now exists
          setOrderId(data.orderId);        // ✅ save orderId
          setPage("success");              // ✅ navigate
        }}
      />
    );
  }

  if (page === "success") {
    return (
      <OrderSuccess
        orderId={orderId}
        onContinue={() => {
          setOrderId(null);
          setPage("products");
        }}
      />
    );
  }

  return null;
}