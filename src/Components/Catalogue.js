import React, { useEffect, useState } from "react";
import "./Catalogue.css";
import { FaEdit, FaPlus, FaSearch } from "react-icons/fa";

const Catalogue = () => {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [addProduct, setAddProduct] = useState(false);
  const [stockToggle, setStockToggle] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [successPopup, setSuccessPopup] = useState(false);

  // ✅ Fetch category-wise data
  useEffect(() => {
    fetch("http://localhost:8000/products/")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const firstCategory = Object.keys(data)[0];
        setSelectedCategory(firstCategory);

        // Set initial toggle state
        const toggles = {};
        Object.values(data).forEach((categoryProducts) => {
          categoryProducts.forEach((p) => {
            toggles[p.retailer_id] = p.availability === "in stock";
          });
        });
        setStockToggle(toggles);
      })
      .catch((err) => console.error("❌ Error loading products:", err));
  }, []);

  const handleEditClick = (product) => setEditProduct(product);
  const handleCardClick = (product) => setSelectedProduct(product);
  const handleToggle = (id) => {
    setStockToggle((prev) => ({ ...prev, [id]: !prev[id] }));
    // TODO: Add API call later
  };

  const closePopup = () => {
    setSelectedProduct(null);
    setEditProduct(null);
    setAddProduct(false);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    console.log("🆕 New Product Added:", productData);

    setAddProduct(false);
    setImagePreview(null);
    setSuccessPopup(true);
    setTimeout(() => setSuccessPopup(false), 2000);
  };

  // ✅ Filter products by search term
  const filteredProducts =
    categories[selectedCategory]?.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.retailer_id.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div className="category-tabs-container">
      <div className="catalogue-header">
        <h2>Catalogue</h2>
        <button className="add-btn" onClick={() => setAddProduct(true)}>
          <FaPlus /> Add Product
        </button>
      </div>

      {/* ✅ Category Tabs */}
      <div className="category-tab">
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${
              selectedCategory === cat ? "active-tab" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}>
            {cat.replace(/_/g, " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* ✅ Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or retailer ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ✅ Product List for Selected Category */}
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <p className="empty-category">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.retailer_id}>
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
                onClick={() => handleCardClick(product)}
              />
              <div
                className="product-info"
                onClick={() => handleCardClick(product)}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                {/* ✅ Price Display Logic */}
                <div className="price-row">
                  {Number(product.sale_price) > 0 ? (
                    <>
                      <span className="sale-price">
                        ₹{Number(product.sale_price) / 100}
                      </span>
                      <span className="price original-price">
                        ₹{Number(product.price) / 100}
                      </span>
                    </>
                  ) : (
                    <span className="price no-discount">
                      ₹{Number(product.price) / 100}
                    </span>
                  )}
                </div>
              </div>
              <div className="product-actions product-actions-spaced">
                <FaEdit
                  className="edit-icon"
                  onClick={() => handleEditClick(product)}
                />
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={stockToggle[product.retailer_id] || false}
                    onChange={() => handleToggle(product.retailer_id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Details Popup */}
      {selectedProduct && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="popup-image"
            />
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p>
              <b>Brand:</b> {selectedProduct.brand}
            </p>
            <p>
              <b>Pattern:</b> {selectedProduct.pattern}
            </p>
            <p>
              <b>Size:</b> {selectedProduct.size}
            </p>
            <p>
              <b>Price:</b> ₹{Number(selectedProduct.price) / 100}
            </p>
            {Number(selectedProduct.sale_price) > 0 && (
              <p>
                <b>Sale Price:</b> ₹{Number(selectedProduct.sale_price) / 100}
              </p>
            )}
            <p>
              <b>Availability:</b> {selectedProduct.availability}
            </p>
            <p>
              <b>Visibility:</b> {selectedProduct.visibility}
            </p>
            <p>
              <b>Updated At:</b> {selectedProduct.updated_at}
            </p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Product Popup */}
      {editProduct && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup popup-scrollable"
            onClick={(e) => e.stopPropagation()}>
            <h2>Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedProduct = Object.fromEntries(formData.entries());

                // multiply back by 100 before sending to backend
                updatedProduct.price = Number(updatedProduct.price) * 100;
                updatedProduct.sale_price =
                  Number(updatedProduct.sale_price) * 100;

                console.log("📝 Updated Product:", updatedProduct);

                // TODO: Replace console.log with API call
                setEditProduct(null);
                setSuccessPopup(true);
                setTimeout(() => setSuccessPopup(false), 2000);
              }}>
              <label>Name</label>
              <input name="name" defaultValue={editProduct.name} />

              <label>Description</label>
              <input
                name="description"
                defaultValue={editProduct.description}
              />

              <label>Brand</label>
              <input name="brand" defaultValue={editProduct.brand} />

              <label>Pattern</label>
              <input name="pattern" defaultValue={editProduct.pattern} />

              <label>Size</label>
              <input name="size" defaultValue={editProduct.size} />

              <label>Price</label>
              <input
                name="price"
                type="number"
                defaultValue={Number(editProduct.price) / 100}
              />

              <label>Sale Price</label>
              <input
                name="sale_price"
                type="number"
                defaultValue={Number(editProduct.sale_price) / 100}
              />

              <label>Availability</label>
              <input
                name="availability"
                defaultValue={editProduct.availability}
              />

              <label>Visibility</label>
              <input name="visibility" defaultValue={editProduct.visibility} />

              <label>Image URL</label>
              <input name="image_url" defaultValue={editProduct.image_url} />

              <label>Updated At</label>
              <input name="updated_at" defaultValue={editProduct.updated_at} />

              <div style={{ marginTop: "16px" }}>
                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={closePopup}
                  style={{ marginLeft: "10px" }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Popup */}
      {addProduct && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup popup-scrollable"
            onClick={(e) => e.stopPropagation()}>
            <h2>Add Product</h2>
            <form onSubmit={handleAddProductSubmit}>
              <label>Name</label>
              <input name="name" placeholder="Enter product name" required />
              <label>Description</label>
              <input name="description" placeholder="Enter description" />
              <label>Brand</label>
              <input name="brand" placeholder="Enter brand" />
              <label>Pattern</label>
              <input name="pattern" placeholder="Enter pattern" />
              <label>Size</label>
              <input name="size" placeholder="Enter size" />
              <label>Price</label>
              <input
                name="price"
                type="number"
                placeholder="Enter price"
                required
              />
              <label>Sale Price</label>
              <input
                name="sale_price"
                type="number"
                placeholder="Enter sale price"
              />
              <label>Availability</label>
              <input
                name="availability"
                placeholder="in stock / out of stock"
              />
              <label>Visibility</label>
              <input name="visibility" placeholder="visible / hidden" />
              <label>Upload Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    marginTop: "10px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              )}
              <div style={{ marginTop: "16px" }}>
                <button type="submit">Submit</button>
                <button
                  type="button"
                  onClick={closePopup}
                  style={{ marginLeft: "10px" }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {successPopup && (
        <div className="popup-overlay" onClick={() => setSuccessPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Action Completed Successfully!</h2>
            <button onClick={() => setSuccessPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogue;
