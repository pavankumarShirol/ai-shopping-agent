import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Search, ShoppingCart, User, Package } from "lucide-react";
import ChatWidget from "../components/ChatWidget";

export default function Products({ userId, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (query = "") => {
    setLoading(true);
    try {
      const data = await api.getProducts(query);
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.addToCart(userId, productId);
      alert("Added to cart!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8" />
              <h1 className="text-2xl font-bold">ShopHub</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate("profile")}
                className="flex items-center space-x-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => onNavigate("cart")}
                className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
              </button>
              <button
                onClick={() => onNavigate("orders")}
                className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all font-medium"
              >
                <Package className="w-5 h-5" />
                <span>Orders</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-6 py-4 rounded-full border-2 border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{product.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        )}
        <ChatWidget />
      </main>

    </div>
  );
}
