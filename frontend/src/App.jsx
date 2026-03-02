import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import { api } from "./api/client";

export default function App() {
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState("login");
  const [orderId, setOrderId] = useState(null);

  if (page === "login") {
    return (
      <Login
        onLogin={(id) => {
          setUserId(id);
          setPage("products");
        }}
        onSwitchToRegister={() => setPage("register")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onRegister={(id) => {
          setUserId(id);
          setPage("products");
        }}
        onSwitchToLogin={() => setPage("login")}
      />
    );
  }

  if (page === "products") {
    return (
      <Products
        userId={userId}
        onNavigate={(destination) => setPage(destination)}
      />
    );
  }

  if (page === "profile") {
    return (
      <Profile
        userId={userId}
        onNavigate={(destination) => setPage(destination)}
        onLogout={() => {
          setUserId(null);
          setPage("login");
        }}
      />
    );
  }

  if (page === "cart") {
    return (
      <Cart
        userId={userId}
        onNext={() => setPage("checkout")}
        onBack={() => setPage("products")}
      />
    );
  }

  if (page === "checkout") {
    return (
      <Checkout
        userId={userId}
        onPlaceOrder={async () => {
          const data = await api.placeOrder(userId);
          setOrderId(data.orderId);
          setPage("success");
        }}
        onBack={() => setPage("cart")}
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