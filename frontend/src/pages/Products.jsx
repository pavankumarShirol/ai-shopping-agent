import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Products({ userId }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");

  const loadProducts = async () => {
    const data = await api.getProducts(query);
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addToCart = async (productId) => {
    await api.addToCart(userId, productId);
    alert("Added to cart");
  };

  return (
    <div>
      <h2>Products</h2>

      <input
        placeholder="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={loadProducts}>Search</button>

      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <b>{p.name}</b>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              {p.description}
            </p> — ₹{p.price}
            <button onClick={() => addToCart(p.id)}>
              Add to Cart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}