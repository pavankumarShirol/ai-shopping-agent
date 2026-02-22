const BASE_URL = "http://localhost:4000";

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
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
}

};