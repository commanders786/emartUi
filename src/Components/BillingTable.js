import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BillingTable.css";

const BillingTable = ({ search, setSearch }) => {
  const [billingData, setBillingData] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State for error modal
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [mapLink, setMapLink] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState(""); // State for phone number validation error
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app";
  const productsUrl =
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app/products";
  const navigate = useNavigate();

  // Fetch existing billing records
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No auth token found. Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchBilling = async () => {
      try {
        const response = await fetch(`${baseUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Billing data is not an array:", data);
          return;
        }

        setBillingData(data);
      } catch (error) {
        console.error("Error fetching billing:", error.message);
      }
    };

    fetchBilling();
    const interval = setInterval(fetchBilling, 60000);
    return () => clearInterval(interval);
  }, [baseUrl, navigate]);

  // Fetch products and extract categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(productsUrl);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        const allProducts = [];
        const categoryList = [];

        Object.keys(data).forEach((category) => {
          if (Array.isArray(data[category])) {
            categoryList.push(category);
            data[category].forEach((product) => {
              allProducts.push({ ...product, category });
            });
          }
        });

        setProducts(allProducts);
        setCategories(categoryList);
        setSelectedCategory("");
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    fetchProducts();
  }, []);

  // Validate phone number
  useEffect(() => {
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
    } else {
      setPhoneError("");
    }
  }, [phoneNumber]);

  // Generate receipt preview when selectedItems, mapLink, specialNotes, or phoneNumber change
  useEffect(() => {
    if (selectedItems.length === 0) {
      setReceiptPreview("");
      return;
    }

    const orderId = `ORDER-${Date.now()}`;
    const deliveryCharge = 30;
    const grandTotalWithDelivery =
      selectedItems.reduce((sum, item) => sum + item.total, 0) + deliveryCharge;
    const formattedPhoneNumber = `91${phoneNumber}`; // Prepend "91" for receipt

    const itemLines = selectedItems
      .map((item, index) => {
        const unitPrice = item.price.toFixed(2);
        const totalPrice = item.total.toFixed(2);
        return `${(index + 1).toString().padStart(2)}  ${item.name.padEnd(
          22,
          " "
        )} ${item.quantity.toString().padStart(3)}  ₹${unitPrice.padEnd(
          6
        )} ₹${totalPrice}`;
      })
      .join("\n");

    const receipt = `Receipt Text
Order No: ${orderId}
🛒 *eMart - PO*

No  Item                   Qty  Unit  Total
${itemLines}

🛵 Delivery Charge: ₹${deliveryCharge}
🧾 Grand Total: ₹${grandTotalWithDelivery}
📍 *Location Links:*
🔗 [Google Maps](${mapLink})
Phone number: ${formattedPhoneNumber}
Special Notes: ${specialNotes}`;

    setReceiptPreview(receipt);
  }, [selectedItems, mapLink, specialNotes, phoneNumber]);

  // Add selected product to the billing list
  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const price = selectedProduct.sale_price
      ? parseFloat(selectedProduct.sale_price.replace("₹", "").replace(",", ""))
      : parseFloat(selectedProduct.price.replace("₹", "").replace(",", ""));
    const itemTotal = price * quantity;

    setSelectedItems([
      ...selectedItems,
      {
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        quantity,
        price,
        total: itemTotal,
      },
    ]);

    setSelectedProduct(null);
    setProductSearch("");
    setQuantity(1);
  };

  // Remove item from the billing list
  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Open/close receipt preview modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Open/close error modal
  const toggleErrorModal = () => {
    setIsErrorModalOpen(!isErrorModalOpen);
  };

  // Save bill to the backend
  const handleSaveBill = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    if (selectedItems.length === 0) {
      setErrorMessage("No items to save.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!phoneNumber) {
      setErrorMessage("Phone number is required.");
      setIsErrorModalOpen(true);
      return;
    }

    const orderId = `ORDER-${Date.now()}`;
    const deliveryCharge = 30;
    const grandTotalWithDelivery =
      selectedItems.reduce((sum, item) => sum + item.total, 0) + deliveryCharge;
    const formattedPhoneNumber = `91${phoneNumber}`; // Prepend "91" for API
    const feedback = "5";

    const itemLines = selectedItems
      .map((item, index) => {
        const unitPrice = item.price.toFixed(2);
        const totalPrice = item.total.toFixed(2);
        return `${(index + 1).toString().padStart(2)}  ${item.name.padEnd(
          22,
          " "
        )} ${item.quantity.toString().padStart(3)}  ₹${unitPrice.padEnd(
          6
        )} ₹${totalPrice}`;
      })
      .join("\n");

    const receipt = `Receipt Text
Order No: ${orderId}
🛒 *eMart - PO*

No  Item                   Qty  Unit  Total
${itemLines}

🛵 Delivery Charge: ₹${deliveryCharge}
🧾 Grand Total: ₹${grandTotalWithDelivery}
📍 *Location Links:*
🔗 [Google Maps](${mapLink})
Phone number: ${formattedPhoneNumber}
Special Notes: ${specialNotes}`;

    // First API call: Create order
    const orderData = {
      userid: formattedPhoneNumber, // Use phoneNumber with "91" prepended
      bill_amount: grandTotalWithDelivery,
      feedback: feedback,
      receipt: receipt,
    };

    try {
      const orderResponse = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create order: HTTP ${orderResponse.status}`
        );
      }
      const orderResult = await orderResponse.json();
      const orderIdFromResponse = orderResult.order_id;

      // Second API call: Update order items
      const orderItemsData = {
        order_id: orderIdFromResponse,
        items: selectedItems.map((item) => ({
          product_retailer_id: item.product_id,
          quantity: item.quantity,
          item_price: item.price,
        })),
      };

      const itemsResponse = await fetch(`${baseUrl}/order-items/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderItemsData),
      });

      if (!itemsResponse.ok) {
        const errorData = await itemsResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update order items: HTTP ${itemsResponse.status}`
        );
      }

      // Update billing data and reset UI
      setBillingData([
        ...billingData,
        { ...orderData, id: orderIdFromResponse },
      ]);
      setSelectedItems([]);
      setReceiptPreview("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving bill:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  // Filter products by selected category and search term
  const filteredProducts = products.filter(
    (product) =>
      product.availability === "in stock" &&
      (!selectedCategory || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="billing-container">
      {/* Add New Bill Section */}
      <div className="add-bill-section">
        <h2>Add New Bill</h2>
        <div className="product-selection">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select">
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="search-input"
          />
          {productSearch && filteredProducts.length > 0 && (
            <ul className="product-dropdown">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setProductSearch("");
                  }}
                  className="product-item">
                  {product.name} ({product.category}) -{" "}
                  {product.sale_price || product.price}
                </li>
              ))}
            </ul>
          )}
          {selectedProduct && (
            <div className="selected-product">
              <p>
                Selected: {selectedProduct.name} ({selectedProduct.category})
              </p>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="quantity-input"
                placeholder="Enter quantity"
              />
              <button onClick={handleAddItem} className="action-button">
                Add Item
              </button>
            </div>
          )}
        </div>
        {/* Selected Items Table */}
        {selectedItems.length > 0 && (
          <div className="selected-items">
            <h3>Selected Items</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{item.total.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="action-button remove">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grand-total">
              <strong>
                Grand Total: ₹
                {(
                  selectedItems.reduce((sum, item) => sum + item.total, 0) + 30
                ).toFixed(2)}
              </strong>
            </div>
            {/* Input Fields for Phone Number, Map Link, and Special Notes */}
            <div className="additional-inputs">
              <div>
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="input-field"
                />
                {phoneError && (
                  <span className="error-message">{phoneError}</span>
                )}
              </div>
              <div>
                <label>Google Maps Link:</label>
                <input
                  type="text"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="Enter Google Maps URL"
                  className="input-field"
                />
              </div>
              <div>
                <label>Special Notes:</label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Enter special notes"
                  className="input-field"
                  rows="3"
                />
              </div>
            </div>
            {/* Preview and Save Buttons */}
            <div className="action-buttons">
              {receiptPreview && (
                <button onClick={toggleModal} className="action-button preview">
                  Preview Receipt
                </button>
              )}
              <button
                onClick={handleSaveBill}
                className="action-button save"
                disabled={!phoneNumber} // Disable button if phoneNumber is empty
              >
                Save Bill
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {isModalOpen && receiptPreview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Receipt Preview</h3>
              <button onClick={toggleModal} className="modal-close-button">
                ×
              </button>
            </div>
            <pre className="receipt-text">{receiptPreview}</pre>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && errorMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Error</h3>
              <button onClick={toggleErrorModal} className="modal-close-button">
                ×
              </button>
            </div>
            <p className="error-message">{errorMessage}</p>
            <button onClick={toggleErrorModal} className="action-button">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Existing Billing Records */}
      <div className="billing-records">
        <div className="table-header">
          <h2>Billing Records</h2>
          <input
            type="text"
            placeholder="Search billing records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Billing ID</th>
              {/* <th>Order ID</th> */}
              <th>Amount</th>
              <th>Status</th>
              <th>Offline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingData.length > 0 ? (
              billingData
                .filter((bill) =>
                  bill.id?.toString().includes(search.toLowerCase())
                )
                .map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    {/* <td>{bill.order_id}</td> */}
                    <td>₹{bill.bill_amount.toFixed(2)}</td>
                    <td>{bill.status}</td>
                    <td>{bill.is_offline}</td>
                    <td>
                      <button className="action-button">View</button>
                      <button className="action-button">Refund</button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5">No billing records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingTable;
