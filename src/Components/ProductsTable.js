import React, { useEffect, useState } from "react";

// Loading Popup Component
const LoadingPopup = () => {
  console.log("LoadingPopup displayed at", new Date().toISOString());
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        <div
          style={{
            border: "5px solid #e0e0e0",
            borderTop: "5px solid #007bff",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            animation: "spin 0.8s linear infinite",
            willChange: "transform",
          }}></div>
        <p style={{ marginTop: "12px", fontSize: "16px", color: "#333" }}>
          Updating...
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

const ProductsTable = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editedPrices, setEditedPrices] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    console.log("Fetching products at", new Date().toISOString());
    try {
      const response = await fetch(
        "https://python-whatsapp-bot-main-production-3c9c.up.railway.app/products"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProductsByCategory(data);
    } catch (err) {
      console.error("Failed to fetch /products:", err);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array ensures it runs only once on mount

  // Filter products by category and search
  const getFilteredProducts = () => {
    let all = [];
    for (const [cat, items] of Object.entries(productsByCategory)) {
      if (categoryFilter === "all" || categoryFilter === cat) {
        all = all.concat(items);
      }
    }
    return all.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Handle price input changes
  const handlePriceChange = (id, newPrice) => {
    setEditedPrices((prev) => ({ ...prev, [id]: newPrice }));
  };

  // Update price via Facebook Graph API and refresh data
  const handleUpdatePrice = async (product) => {
    setLoading(true);
    const newPrice = editedPrices[product.id];
    const numericPrice = parseFloat(newPrice.replace(/[^\d.]/g, ""));
    const updatedPrice = String(numericPrice * 100);

    try {
      console.log("Starting price update at", new Date().toISOString());
      // Update price
      const priceResponse = await fetch(
        `https://graph.facebook.com/v22.0/${product.id}`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer EAAQKF56ZAbJQBO3eHvyzD8AERlnLM7hAvtAIZCcSYubLA7JqPq7iv2NGlzlgDfX1DnJ9CJl9ZANyHdiHYNztdvAjf2C4XKWXFMBCjqTagNJDV4VYV59VhzLQ76kZBjrVP3XDsa2UeqBmT9lr01zgImVXPcmeDsyf6KXOaDk61yFzMKS5BkFZBhDX4tsMfuJ4ZA5QZDZD",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ price: updatedPrice }),
        }
      );

      if (!priceResponse.ok) {
        throw new Error("Failed to update price");
      }
      console.log("Price update completed at", new Date().toISOString());

      // Fire /categorized and /products sequentially in the background
      fetch(
        "https://python-whatsapp-bot-main-production-3c9c.up.railway.app/products/categorized",
        { method: "GET" }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Failed to call /categorized");
          return fetchProducts();
        })
        .catch((err) => {
          console.error("Error in /categorized or /products:", err);
        });

      // Update local state for immediate feedback
      setEditedPrices((prev) => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });
      setSuccessMsg("Price updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Price update error:", err);
      setErrorMsg("Failed to update price.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
      console.log("LoadingPopup hidden at", new Date().toISOString());
    }
  };

  // Toggle stock status via API and refresh data
  const handleToggleStock = async (product) => {
    setLoading(true);
    const newAvailability =
      product.availability === "in stock" ? "out of stock" : "in stock";

    try {
      console.log("Starting stock update at", new Date().toISOString());
      // Update stock
      const stockResponse = await fetch(
        "https://python-whatsapp-bot-main-production-3c9c.up.railway.app/updateStock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
            availability: newAvailability,
          }),
        }
      );

      if (!stockResponse.ok) {
        throw new Error("Failed to update stock");
      }
      console.log("Stock update completed at", new Date().toISOString());

      // Update local state immediately for UI feedback
      setProductsByCategory((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)); // Deep clone
        for (const category in updated) {
          updated[category] = updated[category].map((p) =>
            p.id === product.id ? { ...p, availability: newAvailability } : p
          );
        }
        console.log(
          "Updated stock status locally for product",
          product.id,
          "to",
          newAvailability
        );
        return updated;
      });

      // Fire /categorized and /products sequentially in the background
      fetch(
        "https://python-whatsapp-bot-main-production-3c9c.up.railway.app/products/categorized",
        { method: "GET" }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Failed to call /categorized");
          console.log("Categorized completed at", new Date().toISOString());
          return fetchProducts();
        })
        .catch((err) => {
          console.error("Error in /categorized or /products:", err);
        });

      setSuccessMsg(`Stock updated to ${newAvailability}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Stock update error:", err);
      setErrorMsg("Failed to update stock.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
      console.log("LoadingPopup hidden at", new Date().toISOString());
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div>
      {loading && <LoadingPopup />}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search Products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="product-search"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ marginLeft: "1rem" }}>
          <option value="all">All Categories</option>
          {Object.keys(productsByCategory).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {successMsg && <div style={{ color: "green" }}>{successMsg}</div>}
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

      <table className="products-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Price (₹)</th>
            <th>Availability</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => {
            const originalPrice = product.price.replace(/[^\d.]/g, "");
            const editedPrice = editedPrices[product.id] ?? originalPrice;

            return (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>
                  <input
                    type="text"
                    value={editedPrice}
                    onChange={(e) =>
                      handlePriceChange(product.id, e.target.value)
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStock(product)}
                    disabled={loading}
                    style={{
                      backgroundColor:
                        product.availability === "in stock"
                          ? "#28a745"
                          : "#dc3545",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      opacity: loading ? 0.6 : 1,
                    }}>
                    {product.availability === "in stock"
                      ? "In Stock"
                      : "Out of Stock"}
                  </button>
                </td>
                <td>
                  {editedPrice !== originalPrice && (
                    <button
                      onClick={() => handleUpdatePrice(product)}
                      disabled={loading}
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        opacity: loading ? 0.6 : 1,
                      }}>
                      Update
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
