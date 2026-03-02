const BASE_URL = "https://ai-shopping-agent-el0o.onrender.com";

export const api = {
  register: async (email, password, name) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name })
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  getUserProfile: async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}`);
    return res.json();
  },

  getProducts: async (query = "") => {
    const res = await fetch(
      `${BASE_URL}/products/search?q=${query}`
    );
    return res.json();
  },

  addToCart: async (userId, productId) => {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        productId,
        quantity: 1
      })
    });
    return res.json();
  },

  getCartSummary: async (userId) => {
    const res = await fetch(
      `${BASE_URL}/cart/summary/${userId}`
    );
    return res.json();
  },

  getAddresses: async (userId) => {
    const res = await fetch(
      `${BASE_URL}/addresses/${userId}`
    );
    return res.json();
  },

  selectAddress: async (userId, addressId) => {
    const res = await fetch(
      `${BASE_URL}/checkout/select-address`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, addressId })
      }
    );
    return res.json();
  },

  getPaymentMethods: async (userId) => {
    const res = await fetch(
      `${BASE_URL}/payment-methods/${userId}`
    );
    return res.json();
  },

  selectPayment: async (userId, paymentMethodId, cvv) => {
    const res = await fetch(
      `${BASE_URL}/checkout/select-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, paymentMethodId, cvv })
      }
    );
    return res.json();
  },

  placeOrder: async (userId) => {
    const res = await fetch(`${BASE_URL}/orders/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return res.json();
  }
};

// client.js
export const streamChat = async (message, sessionId, onChunk) => {
  const res = await fetch("http://127.0.0.1:8000/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, session_id: sessionId })
  });

  if (!res.body) {
    throw new Error("Streaming not supported");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // FastAPI streams JSON lines
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      onChunk(line);
    }
  }
};