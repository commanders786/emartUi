import React, { useEffect, useState } from "react";

const ProductsTable = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editedPrices, setEditedPrices] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch data from ngrok URL
  useEffect(() => {
    fetch("http://127.0.0.1:8000/products")
      .then((res) => res.json())
      .then((data) => {
        setProductsByCategory(data);
      })
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  // Get selected category or all
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

  const handlePriceChange = (id, newPrice) => {
    setEditedPrices((prev) => ({ ...prev, [id]: newPrice }));
  };

  const handleUpdate = async (product) => {
    const newPrice = editedPrices[product.id];
    const numericPrice = parseFloat(newPrice.replace(/[^\d.]/g, ""));
    const updatedPrice = String(numericPrice * 100); // add 2 trailing zeros

    try {
      const response = await fetch(
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

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      // Update local state
      const updatedProducts = { ...productsByCategory };
      for (const category in updatedProducts) {
        updatedProducts[category] = updatedProducts[category].map((p) =>
          p.id === product.id ? { ...p, price: `₹${numericPrice}` } : p
        );
      }
      setProductsByCategory(updatedProducts);
      setEditedPrices((prev) => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });
      setSuccessMsg("Price updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update price.");
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div>
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

      <table className="products-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Price (₹)</th>
            {/* <th>Category</th> */}
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
                {/* <td>
                  {
                    Object.entries(productsByCategory).find(([cat, items]) =>
                      items.some((item) => item.id === product.id)
                    )?.[0]
                  }
                </td> */}
                <td>
                  {editedPrice !== originalPrice && (
                    <button onClick={() => handleUpdate(product)}>
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
