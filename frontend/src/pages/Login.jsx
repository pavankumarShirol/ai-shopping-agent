import { useState } from "react";
import { api } from "../api/client";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("user@gmail.com");
  const [password, setPassword] = useState("123456");

  const handleLogin = async () => {
    const res = await api.login(email, password);

    if (res.userId) {
      onLogin(res.userId);   // 🔥 THIS TRIGGERS PRODUCTS PAGE
    } else {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <br />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}