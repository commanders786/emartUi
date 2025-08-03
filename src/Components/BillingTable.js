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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isOrderItemsModalOpen, setIsOrderItemsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [newProductSearch, setNewProductSearch] = useState("");
  const [newProduct, setNewProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
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
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
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
        setErrorMessage("Failed to fetch billing records.");
        setIsErrorModalOpen(true);
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
        setErrorMessage("Failed to fetch products.");
        setIsErrorModalOpen(true);
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

  // Generate receipt preview
  useEffect(() => {
    if (selectedItems.length === 0) {
      setReceiptPreview("");
      return;
    }

    const orderId = `ORDER-${Date.now()}`;
    const deliveryCharge = 30;
    const grandTotalWithDelivery =
      selectedItems.reduce((sum, item) => sum + (item.total || 0), 0) +
      deliveryCharge;
    const formattedPhoneNumber = `91${phoneNumber}`;

    const itemLines = selectedItems
      .map((item, index) => {
        const unitPrice = item.price ? item.price.toFixed(2) : "0.00";
        const totalPrice = item.total ? item.total.toFixed(2) : "0.00";
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
🧾 Grand Total: ₹${grandTotalWithDelivery.toFixed(2)}
📍 *Location Links:*
🔗 [Google Maps](${mapLink})
Phone number: ${formattedPhoneNumber}
Special Notes: ${specialNotes}`;

    setReceiptPreview(receipt);
  }, [selectedItems, mapLink, specialNotes, phoneNumber]);

  // Add selected product to the billing list
  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) {
      setErrorMessage("Please select a product and enter a valid quantity.");
      setIsErrorModalOpen(true);
      return;
    }

    const priceString = selectedProduct.sale_price || selectedProduct.price;
    if (!priceString) {
      setErrorMessage("Selected product has no valid price.");
      setIsErrorModalOpen(true);
      return;
    }

    const price = parseFloat(priceString.replace("₹", "").replace(",", ""));
    if (isNaN(price)) {
      setErrorMessage("Invalid product price.");
      setIsErrorModalOpen(true);
      return;
    }

    const itemTotal = price * quantity;

    setSelectedItems([
      ...selectedItems,
      {
        product_id: selectedProduct.id,
        name: selectedProduct.name || "Unknown Product",
        category: selectedProduct.category || "Unknown",
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

  // Open/close order items modal
  const toggleOrderItemsModal = () => {
    setIsOrderItemsModalOpen(!isOrderItemsModalOpen);
    if (!isOrderItemsModalOpen) {
      setNewProductSearch("");
      setNewProduct(null);
      setNewQuantity(1);
    }
  };

  // Open/close confirm modal
  const toggleConfirmModal = () => {
    setIsConfirmModalOpen(!isConfirmModalOpen);
  };

  // Open/close success modal
  const toggleSuccessModal = () => {
    setIsSuccessModalOpen(!isSuccessModalOpen);
  };

  // Fetch order items for a specific order
  const handleViewOrderItems = async (orderId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/order-items/all?order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch order items: HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.status === "success" && Array.isArray(result.data)) {
        const enrichedItems = result.data.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          return {
            ...item,
            name: product ? product.name : item.product_id,
          };
        });
        setOrderItems(enrichedItems);
        setIsOrderItemsModalOpen(true);
      } else {
        throw new Error("Invalid order items data format");
      }
    } catch (error) {
      console.error("Error fetching order items:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  // Update quantity of an existing order item
  const handleUpdateQuantity = async (orderId, productId, newQty) => {
    if (newQty < 1) {
      setErrorMessage("Quantity must be at least 1.");
      setIsErrorModalOpen(true);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    const product = products.find((p) => p.id === productId);
    const vendorPrice = product
      ? product.sale_price
        ? parseFloat(product.sale_price.replace("₹", "").replace(",", ""))
        : parseFloat(product.price.replace("₹", "").replace(",", ""))
      : 0;

    if (isNaN(vendorPrice)) {
      setErrorMessage("Invalid price for the selected product.");
      setIsErrorModalOpen(true);
      return;
    }

    const updateData = {
      order_id: orderId,
      items: [
        {
          product_id: productId,
          action: "update",
          qty: newQty,
          vendor_price: vendorPrice,
        },
      ],
    };

    try {
      const response = await fetch(`${baseUrl}/update-order-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to update order item: HTTP ${response.status}`
        );
      }

      await handleViewOrderItems(orderId);
    } catch (error) {
      console.error("Error updating order item:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  // Delete an order item
  const handleDeleteItem = async (orderId, productId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    const deleteData = {
      order_id: orderId,
      items: [
        {
          product_id: productId,
          action: "delete",
        },
      ],
    };

    try {
      const response = await fetch(`${baseUrl}/update-order-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deleteData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to delete order item: HTTP ${response.status}`
        );
      }

      await handleViewOrderItems(orderId);
    } catch (error) {
      console.error("Error deleting order item:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  // Add a new product to the order
  const handleAddNewItem = async (orderId) => {
    if (!newProduct || newQuantity < 1) {
      setErrorMessage("Please select a product and enter a valid quantity.");
      setIsErrorModalOpen(true);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    const vendorPrice = newProduct.sale_price
      ? parseFloat(newProduct.sale_price.replace("₹", "").replace(",", ""))
      : parseFloat(newProduct.price.replace("₹", "").replace(",", ""));

    if (isNaN(vendorPrice)) {
      setErrorMessage("Invalid price for the selected product.");
      setIsErrorModalOpen(true);
      return;
    }

    const insertData = {
      order_id: orderId,
      items: [
        {
          product_id: newProduct.id,
          action: "insert",
          qty: newQuantity,
          vendor_price: vendorPrice,
        },
      ],
    };

    try {
      const response = await fetch(`${baseUrl}/update-order-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(insertData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to add order item: HTTP ${response.status}`
        );
      }

      await handleViewOrderItems(orderId);
      setNewProduct(null);
      setNewProductSearch("");
      setNewQuantity(1);
    } catch (error) {
      console.error("Error adding order item:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  // Open confirm modal before saving bill
  const handleConfirmSaveBill = () => {
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

    setIsConfirmModalOpen(true);
  };

  // Save bill to the backend
  const handleSaveBill = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrorMessage("No auth token found. Please log in.");
      setIsErrorModalOpen(true);
      return;
    }

    // Validate all items have valid total
    const invalidItems = selectedItems.filter(
      (item) => !item.total || isNaN(item.total)
    );
    if (invalidItems.length > 0) {
      setErrorMessage(
        "Some items have invalid totals. Please review your selection."
      );
      setIsErrorModalOpen(true);
      return;
    }

    const orderId = `ORDER-${Date.now()}`;
    const deliveryCharge = 30;
    const grandTotalWithDelivery =
      selectedItems.reduce((sum, item) => sum + (item.total || 0), 0) +
      deliveryCharge;
    const formattedPhoneNumber = `91${phoneNumber}`;
    const feedback = "5";

    const itemLines = selectedItems
      .map((item, index) => {
        const unitPrice = item.price ? item.price.toFixed(2) : "0.00";
        const totalPrice = item.total ? item.total.toFixed(2) : "0.00";
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
🧾 Grand Total: ₹${grandTotalWithDelivery.toFixed(2)}
📍 *Location Links:*
🔗 [Google Maps](${mapLink})
Phone number: ${formattedPhoneNumber}
Special Notes: ${specialNotes}`;

    const orderData = {
      userid: formattedPhoneNumber,
      bill_amount: grandTotalWithDelivery,
      feedback: feedback,
      receipt: receipt,
      is_offline: true,
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

      // Update order items immediately after order creation
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
          errorData.error ||
            `Failed to update order items: HTTP ${itemsResponse.status}`
        );
      }

      const itemsResult = await itemsResponse.json();
      if (itemsResult.message !== 200) {
        throw new Error("Failed to update order items: Invalid response");
      }

      setBillingData([
        ...billingData,
        { ...orderData, id: orderIdFromResponse },
      ]);
      setSelectedItems([]);
      setReceiptPreview("");
      setPhoneNumber("");
      setMapLink("");
      setSpecialNotes("");
      setIsModalOpen(false);
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error saving bill:", error.message);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
      setIsConfirmModalOpen(false);
    }
  };

  // Filter products by selected category and search term
  const filteredProducts = products.filter(
    (product) =>
      product.availability === "in stock" &&
      (!selectedCategory || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filter products for adding new items in order items modal
  const filteredNewProducts = products.filter(
    (product) =>
      product.availability === "in stock" &&
      product.name.toLowerCase().includes(newProductSearch.toLowerCase())
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
                    <td>₹{item.price ? item.price.toFixed(2) : "0.00"}</td>
                    <td>₹{item.total ? item.total.toFixed(2) : "0.00"}</td>
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
                  selectedItems.reduce(
                    (sum, item) => sum + (item.total || 0),
                    0
                  ) + 30
                ).toFixed(2)}
              </strong>
            </div>
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
            <div className="action-buttons">
              {receiptPreview && (
                <button onClick={toggleModal} className="action-button preview">
                  Preview Receipt
                </button>
              )}
              <button
                onClick={handleConfirmSaveBill}
                className="action-button save"
                disabled={!phoneNumber}>
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

      {/* Confirm Save Bill Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Save Bill</h3>
              <button
                onClick={toggleConfirmModal}
                className="modal-close-button">
                ×
              </button>
            </div>
            <p>Are you sure you want to save this bill?</p>
            <div className="modal-actions">
              <button onClick={toggleConfirmModal} className="action-button">
                Cancel
              </button>
              <button onClick={handleSaveBill} className="action-button save">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Success</h3>
              <button
                onClick={toggleSuccessModal}
                className="modal-close-button">
                ×
              </button>
            </div>
            <p>Bill saved successfully!</p>
            <button onClick={toggleSuccessModal} className="action-button">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Order Items Modal */}
      {isOrderItemsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Items</h3>
              <button
                onClick={toggleOrderItemsModal}
                className="modal-close-button">
                ×
              </button>
            </div>
            <div className="add-item-section">
              <h4>Add New Item</h4>
              <input
                type="text"
                placeholder="Search products to add..."
                value={newProductSearch}
                onChange={(e) => setNewProductSearch(e.target.value)}
                className="search-input"
              />
              {newProductSearch && filteredNewProducts.length > 0 && (
                <ul className="product-dropdown">
                  {filteredNewProducts.map((product) => (
                    <li
                      key={product.id}
                      onClick={() => {
                        setNewProduct(product);
                        setNewProductSearch("");
                      }}
                      className="product-item">
                      {product.name} ({product.category}) -{" "}
                      {product.sale_price || product.price}
                    </li>
                  ))}
                </ul>
              )}
              {newProduct && (
                <div className="selected-product">
                  <p>
                    Selected: {newProduct.name} ({newProduct.category})
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) =>
                      setNewQuantity(parseInt(e.target.value) || 1)
                    }
                    className="quantity-input"
                    placeholder="Enter quantity"
                  />
                  <button
                    onClick={() => handleAddNewItem(orderItems[0]?.order_id)}
                    className="action-button"
                    disabled={!orderItems[0]?.order_id}>
                    Add Item
                  </button>
                </div>
              )}
            </div>
            {orderItems.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.order_id}</td>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.order_id,
                              item.product_id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="quantity-input"
                        />
                      </td>
                      <td>₹{item.total ? item.total.toFixed(2) : "0.00"}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleDeleteItem(item.order_id, item.product_id)
                          }
                          className="action-button remove">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No items in this order.</p>
            )}
            <button onClick={toggleOrderItemsModal} className="action-button">
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
                  bill.id
                    ?.toString()
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>
                      ₹{bill.bill_amount ? bill.bill_amount.toFixed(2) : "0.00"}
                    </td>
                    <td>{bill.status || "N/A"}</td>
                    <td>{bill.is_offline ? "Yes" : "No"}</td>
                    <td>
                      <button
                        onClick={() => handleViewOrderItems(bill.id)}
                        className="action-button">
                        View
                      </button>
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
