import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorsTable.css";

const VendorsTable = ({ search, setSearch }) => {
  const [vendorsData, setVendorsData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [unpaidMarginOrders, setUnpaidMarginOrders] = useState([]);
  const [unpaidPercentageOrders, setUnpaidPercentageOrders] = useState([]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [totalUnpaidMarginAmount, setTotalUnpaidMarginAmount] = useState(0);
  const [totalUnpaidPercentageAmount, setTotalUnpaidPercentageAmount] =
    useState(0);
  const [paidCommission, setPaidCommission] = useState(0);
  const [unpaidMarginCommission, setUnpaidMarginCommission] = useState(0);
  const [unpaidPercentageCommission, setUnpaidPercentageCommission] =
    useState(0);
  const [payableMarginAmount, setPayableMarginAmount] = useState(null);
  const [payablePercentageAmount, setPayablePercentageAmount] = useState(null);
  const [unpaidOrderType, setUnpaidOrderType] = useState("percentage");
  const [isSplitResponse, setIsSplitResponse] = useState(false);
  const [subTab, setSubTab] = useState("products");
  const [accountSubTab, setAccountSubTab] = useState("paid");
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorsPerPage] = useState(5);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isLoadingVendorProducts, setIsLoadingVendorProducts] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    id: "",
    name: "",
    product_type: "multi",
    commission: 15,
  });
  const [payFormData, setPayFormData] = useState({
    transactionId: "",
    description: "",
  });
  const [editProductData, setEditProductData] = useState({
    id: "",
    retailer_id: "",
    vendor_price: "",
    is_percentage: false,
    price: "",
    sale_price: "",
    availability: "",
  });
  const [vendorProductsCache, setVendorProductsCache] = useState({});
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app";
  const navigate = useNavigate();

  // Helper function to sanitize JSON string by replacing NaN with null
  const sanitizeJSON = (jsonString) => {
    return jsonString.replace(/NaN/g, "null");
  };

  // Fetch vendors
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found. Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchVendors = async () => {
      try {
        const response = await fetch(`${baseUrl}/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Vendors data is not an array:", data);
          return;
        }
        setVendorsData(data);
      } catch (error) {
        console.error("Error fetching vendors:", error.message);
      }
    };

    fetchVendors();
    return () => clearInterval();
  }, [baseUrl, navigate]);

  // Fetch vendor products, orders, and all products when a vendor is selected
  useEffect(() => {
    if (!selectedVendor) {
      setVendorProducts([]);
      setPaidOrders([]);
      setUnpaidMarginOrders([]);
      setUnpaidPercentageOrders([]);
      setAllProducts([]);
      setCategories([]);
      setTotalPaidAmount(0);
      setTotalUnpaidMarginAmount(0);
      setTotalUnpaidPercentageAmount(0);
      setPaidCommission(0);
      setUnpaidMarginCommission(0);
      setUnpaidPercentageCommission(0);
      setPayableMarginAmount(null);
      setPayablePercentageAmount(null);
      setIsSplitResponse(false);
      setUnpaidOrderType("percentage");
      setAccountSubTab("paid");
      setIsLoadingVendorProducts(false);
      return;
    }

    const token = localStorage.getItem("authToken");

    const fetchVendorProducts = async () => {
      const vendorId = selectedVendor.phone;
      if (vendorProductsCache[vendorId]) {
        setVendorProducts(vendorProductsCache[vendorId]);
        setIsLoadingVendorProducts(false);
        return;
      }

      setIsLoadingVendorProducts(true);
      try {
        const response = await fetch(`${baseUrl}/vendorsproducts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vendorId }),
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Vendor products data is not an array:", data);
          setVendorProducts([]);
        } else {
          setVendorProducts(data);
          setVendorProductsCache((prev) => ({
            ...prev,
            [vendorId]: data,
          }));
        }
      } catch (error) {
        console.error("Error fetching vendor products:", error.message);
        setVendorProducts([]);
      } finally {
        setIsLoadingVendorProducts(false);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        const categoryNames = Object.keys(data);
        setCategories(categoryNames);
        const products = Object.values(data).flat();
        const productsWithCategory = products.map((product, index) => ({
          ...product,
          category:
            categoryNames[
              Math.floor(index / (products.length / categoryNames.length))
            ],
        }));
        setAllProducts(productsWithCategory);
      } catch (error) {
        console.error("Error fetching all products:", error.message);
      }
    };

    const fetchVendorOrders = async () => {
      try {
        const paidResponse = await fetch(`${baseUrl}/productsNew`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId: selectedVendor.phone,
            type: "paid",
          }),
        });
        if (!paidResponse.ok)
          throw new Error(`HTTP error ${paidResponse.status}`);
        const paidText = await paidResponse.text();
        const paidData = JSON.parse(sanitizeJSON(paidText));
        if (!paidData.transactions || !Array.isArray(paidData.transactions)) {
          console.error("Paid transactions data is not an array:", paidData);
          setPaidOrders([]);
          setTotalPaidAmount(0);
          setPaidCommission(0);
        } else {
          setPaidOrders(paidData.transactions);
          setTotalPaidAmount(paidData.cleared_amount || 0);
          setPaidCommission(0);
        }

        const unpaidResponse = await fetch(`${baseUrl}/productsNew`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId: selectedVendor.phone,
            type: "pending",
          }),
        });
        if (!unpaidResponse.ok)
          throw new Error(`HTTP error ${unpaidResponse.status}`);
        const unpaidText = await unpaidResponse.text();
        const unpaidData = JSON.parse(sanitizeJSON(unpaidText));

        if (unpaidData.margin && unpaidData.percentage) {
          setIsSplitResponse(true);
          setUnpaidMarginOrders(
            (unpaidData.margin.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.sold_amount || 0,
              vendor_price: order.vendor_price ?? "N/A",
            }))
          );
          setUnpaidPercentageOrders(
            (unpaidData.percentage.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.sold_amount || 0,
              vendor_price: "N/A",
            }))
          );
          setTotalUnpaidMarginAmount(unpaidData.margin.total_sale || 0);
          setTotalUnpaidPercentageAmount(unpaidData.percentage.total_sale || 0);
          setUnpaidMarginCommission(unpaidData.margin.commission_amount || 0);
          setUnpaidPercentageCommission(
            unpaidData.percentage.commission_amount || 0
          );
          setPayableMarginAmount(unpaidData.margin.payable || 0);
          setPayablePercentageAmount(unpaidData.percentage.payable || 0);
        } else {
          setIsSplitResponse(false);
          setUnpaidMarginOrders([]);
          setUnpaidPercentageOrders(
            (unpaidData.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.bill_amount || 0,
              vendor_price: "N/A",
            }))
          );
          setTotalUnpaidMarginAmount(0);
          setTotalUnpaidPercentageAmount(unpaidData.total_sale || 0);
          setUnpaidMarginCommission(0);
          setUnpaidPercentageCommission(unpaidData.commission || 0);
          setPayableMarginAmount(null);
          setPayablePercentageAmount(unpaidData.payable || null);
        }
      } catch (error) {
        console.error("Error fetching vendor orders:", error.message);
        setPaidOrders([]);
        setUnpaidMarginOrders([]);
        setUnpaidPercentageOrders([]);
        setTotalPaidAmount(0);
        setTotalUnpaidMarginAmount(0);
        setTotalUnpaidPercentageAmount(0);
        setPaidCommission(0);
        setUnpaidMarginCommission(0);
        setUnpaidPercentageCommission(0);
        setPayableMarginAmount(null);
        setPayablePercentageAmount(null);
        setIsSplitResponse(false);
      }
    };

    fetchVendorProducts();
    fetchAllProducts();
    if (subTab === "accounts") {
      fetchVendorOrders();
    }
  }, [selectedVendor, baseUrl, navigate, subTab, vendorProductsCache]);

  const handleSubTabChange = (tab) => {
    setSubTab(tab);
    if (tab === "accounts") {
      setAccountSubTab("paid");
    }
  };

  const handleAccountSubTabChange = (tab) => {
    setAccountSubTab(tab);
  };

  const handleUnpaidOrderTypeChange = (type) => {
    setUnpaidOrderType(type);
  };

  const filteredVendors = vendorsData.filter((vendor) =>
    vendor.shop_name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstVendor,
    indexOfLastVendor
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleAddProduct = async (product) => {
    const token = localStorage.getItem("authToken");
    const payload = {
      name: product.name,
      vendor_id: selectedVendor.phone,
      category: product.category || "gr",
      percentage_on_category: true,
      vendors_price: null,
      retailer_id: product.retailer_id,
      p_id: product.id || product.retailer_id,
    };

    try {
      const response = await fetch(`${baseUrl}/mapProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (data.message === "Product mapped successfully") {
        setIsLoadingVendorProducts(true);
        const vendorProductsResponse = await fetch(
          `${baseUrl}/vendorsproducts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ vendorId: selectedVendor.phone }),
          }
        );
        const vendorProductsData = await vendorProductsResponse.json();
        setVendorProducts(vendorProductsData);
        setVendorProductsCache((prev) => ({
          ...prev,
          [selectedVendor.phone]: vendorProductsData,
        }));
        setSuccessMessage("Product added successfully!");
      } else {
        setFeedbackMessage("Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error.message);
      setFeedbackMessage("Error adding product: " + error.message);
    } finally {
      setIsLoadingVendorProducts(false);
    }

    setTimeout(() => {
      setFeedbackMessage("");
      setSuccessMessage("");
    }, 3000);
  };

  const handleAddVendor = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${baseUrl}/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: vendorFormData.id,
          name: vendorFormData.name,
          product_type: vendorFormData.product_type,
          commission: parseFloat(vendorFormData.commission),
        }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      if (response.status === 201) {
        setSuccessMessage("Vendor added successfully!");
        const vendorsResponse = await fetch(`${baseUrl}/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vendorsData = await vendorsResponse.json();
        setVendorsData(vendorsData);
        setShowAddVendorModal(false);
        setVendorFormData({
          id: "",
          name: "",
          product_type: "multi",
          commission: 15,
        });
      } else {
        setFeedbackMessage("Failed to add vendor.");
      }
    } catch (error) {
      console.error("Error adding vendor:", error.message);
      setFeedbackMessage("Error adding vendor: " + error.message);
    }

    setTimeout(() => {
      setFeedbackMessage("");
      setSuccessMessage("");
    }, 3000);
  };

  const handlePay = async () => {
    const token = localStorage.getItem("authToken");
    setIsPaying(true);
    try {
      const response = await fetch(`${baseUrl}/clearPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: selectedVendor.phone,
          transactionId: payFormData.transactionId,
          description: payFormData.description,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      if (response.status === 200) {
        setSuccessMessage("Payment recorded and orders updated successfully!");
        const unpaidResponse = await fetch(`${baseUrl}/productsNew`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId: selectedVendor.phone,
            type: "pending",
          }),
        });
        const unpaidText = await unpaidResponse.text();
        const unpaidData = JSON.parse(sanitizeJSON(unpaidText));

        if (unpaidData.margin && unpaidData.percentage) {
          setIsSplitResponse(true);
          setUnpaidMarginOrders(
            (unpaidData.margin.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.sold_amount || 0,
              vendor_price: order.vendor_price ?? "N/A",
            }))
          );
          setUnpaidPercentageOrders(
            (unpaidData.percentage.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.sold_amount || 0,
              vendor_price: "N/A",
            }))
          );
          setTotalUnpaidMarginAmount(unpaidData.margin.total_sale || 0);
          setTotalUnpaidPercentageAmount(unpaidData.percentage.total_sale || 0);
          setUnpaidMarginCommission(unpaidData.margin.commission_amount || 0);
          setUnpaidPercentageCommission(
            unpaidData.percentage.commission_amount || 0
          );
          setPayableMarginAmount(unpaidData.margin.payable || 0);
          setPayablePercentageAmount(unpaidData.percentage.payable || 0);
        } else {
          setIsSplitResponse(false);
          setUnpaidMarginOrders([]);
          setUnpaidPercentageOrders(
            (unpaidData.orders || []).map((order) => ({
              order_id: order.order_id,
              bill_amount: order.bill_amount || 0,
              vendor_price: "N/A",
            }))
          );
          setTotalUnpaidMarginAmount(0);
          setTotalUnpaidPercentageAmount(unpaidData.total_sale || 0);
          setUnpaidMarginCommission(0);
          setUnpaidPercentageCommission(unpaidData.commission || 0);
          setPayableMarginAmount(null);
          setPayablePercentageAmount(unpaidData.payable || null);
        }

        const paidResponse = await fetch(`${baseUrl}/productsNew`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vendorId: selectedVendor.phone,
            type: "paid",
          }),
        });
        const paidText = await paidResponse.text();
        const paidData = JSON.parse(sanitizeJSON(paidText));
        setPaidOrders(paidData.transactions || []);
        setTotalPaidAmount(paidData.cleared_amount || 0);
        setPaidCommission(0);

        setShowPayModal(false);
        setPayFormData({ transactionId: "", description: "" });
      } else {
        setFeedbackMessage("Failed to process payment.");
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
      setFeedbackMessage("Error processing payment: " + error.message);
    } finally {
      setIsPaying(false);
      setTimeout(() => {
        setFeedbackMessage("");
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleEditProduct = (product) => {
    // Ensure price and sale_price are properly formatted (convert from rupees to dollars)
    const priceValue =
      product.price != null && !isNaN(product.price.replace("₹", ""))
        ? parseFloat(product.price.replace("₹", ""))
        : "";
    const salePriceValue =
      product.sale_price != null && !isNaN(product.sale_price)
        ? parseFloat(product.sale_price)
        : "";

    setEditProductData({
      id: product.id || "", // Store id for /update-product-meta
      retailer_id: product.retailer_id || "",
      vendor_price:
        product.vendors_price != null ? product.vendors_price.toString() : "",
      is_percentage: product.is_percentage || false,
      price: priceValue,
      sale_price: salePriceValue,
      availability: product.availability || "",
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async () => {
    const token = localStorage.getItem("authToken");
    setIsUpdatingProduct(true);
    try {
      // Update vendor price and commission type
      const vendorPriceResponse = await fetch(
        `${baseUrl}/update-vendor-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            retailer_id: editProductData.retailer_id,
            vendor_price: editProductData.is_percentage
              ? null
              : parseFloat(editProductData.vendor_price),
            commission: editProductData.is_percentage,
            vendor_id: selectedVendor.phone,
          }),
        }
      );
      if (!vendorPriceResponse.ok)
        throw new Error(`HTTP error ${vendorPriceResponse.status}`);
      const vendorPriceData = await vendorPriceResponse.json();
      if (vendorPriceData.message !== "Vendor price updated successfully") {
        setFeedbackMessage("Failed to update vendor price.");
        setIsUpdatingProduct(false);
        return;
      }

      // Update product meta (price, sale_price, availability)
      const metaPayload = {
        product_id: editProductData.id, // Use id for /update-product-meta
      };
      if (editProductData.availability) {
        metaPayload.availability = editProductData.availability;
      }
      if (editProductData.price) {
        metaPayload.price = parseFloat(editProductData.price).toString();
      }
      if (editProductData.sale_price) {
        metaPayload.sale_price = parseFloat(
          editProductData.sale_price
        ).toString();
      } else {
        metaPayload.sale_price = "";
      }

      if (
        editProductData.availability ||
        editProductData.price ||
        editProductData.sale_price
      ) {
        const metaResponse = await fetch(`${baseUrl}/update-product-meta`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(metaPayload),
        });
        if (!metaResponse.ok)
          throw new Error(`HTTP error ${metaResponse.status}`);
        const metaData = await metaResponse.json();
        if (metaData.message !== "Product details updated successfully") {
          setFeedbackMessage("Failed to update product meta.");
          setIsUpdatingProduct(false);
          return;
        }
      }

      // Refresh vendor products
      setIsLoadingVendorProducts(true);
      const vendorProductsResponse = await fetch(`${baseUrl}/vendorsproducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: selectedVendor.phone }),
      });
      const vendorProductsData = await vendorProductsResponse.json();
      setVendorProducts(vendorProductsData);
      setVendorProductsCache((prev) => ({
        ...prev,
        [selectedVendor.phone]: vendorProductsData,
      }));
      setSuccessMessage("Product updated successfully!");
      setShowEditProductModal(false);
      setEditProductData({
        id: "",
        retailer_id: "",
        vendor_price: "",
        is_percentage: false,
        price: "",
        sale_price: "",
        availability: "",
      });
    } catch (error) {
      console.error("Error updating product:", error.message);
      setFeedbackMessage("Error updating product: " + error.message);
    } finally {
      setIsUpdatingProduct(false);
      setIsLoadingVendorProducts(false);
      setTimeout(() => {
        setFeedbackMessage("");
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleDeleteProduct = async (retailer_id) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${baseUrl}/deMapProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          retailer_id,
          vendor_id: selectedVendor.phone,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (data.message === "Product unmapped successfully") {
        setIsLoadingVendorProducts(true);
        const vendorProductsResponse = await fetch(
          `${baseUrl}/vendorsproducts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ vendorId: selectedVendor.phone }),
          }
        );
        const vendorProductsData = await vendorProductsResponse.json();
        setVendorProducts(vendorProductsData);
        setVendorProductsCache((prev) => ({
          ...prev,
          [selectedVendor.phone]: vendorProductsData,
        }));
        setSuccessMessage("Product deleted successfully!");
      } else {
        setFeedbackMessage("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error.message);
      setFeedbackMessage("Error deleting product: " + error.message);
    } finally {
      setIsLoadingVendorProducts(false);
    }

    setTimeout(() => {
      setFeedbackMessage("");
      setSuccessMessage("");
    }, 3000);
  };

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const totalPayable =
    (payableMarginAmount ?? 0) + (payablePercentageAmount ?? 0);

  return (
    <div className="vendors-container">
      {successMessage && (
        <div className="success-popup" role="alert">
          <svg
            className="green-tick"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"
              fill="#155724"
            />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
      <div className="table-container">
        <div className="table-header">
          <h2>Vendors</h2>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button
              className="action-button"
              onClick={() => setShowAddVendorModal(true)}>
              Add Vendor
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Phone</th>
              <th>Shop Name</th>
              <th>Username</th>
              <th>Commission</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.length > 0 ? (
              currentVendors.map((vendor) => (
                <tr
                  key={vendor.phone}
                  onClick={() => setSelectedVendor(vendor)}
                  className={
                    selectedVendor?.phone === vendor.phone ? "selected" : ""
                  }>
                  <td>{vendor.phone}</td>
                  <td>{vendor.shop_name}</td>
                  <td>{vendor.username}</td>
                  <td>{vendor.commission}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No vendors found</td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredVendors.length > vendorsPerPage && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button">
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-button ${
                  currentPage === number ? "active" : ""
                }`}>
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button">
              Next
            </button>
          </div>
        )}
      </div>

      {showAddVendorModal && (
        <div
          className="modal"
          role="dialog"
          aria-labelledby="vendor-modal-title">
          <div className="modal-content">
            <h4 id="vendor-modal-title">Add New Vendor</h4>
            <button
              className="close-button"
              onClick={() => {
                setShowAddVendorModal(false);
                setFeedbackMessage("");
                setVendorFormData({
                  id: "",
                  name: "",
                  product_type: "multi",
                  commission: 15,
                });
              }}>
              Close
            </button>
            {feedbackMessage && (
              <div
                className={`feedback-message ${
                  feedbackMessage.includes("success") ? "success" : "error"
                }`}>
                {feedbackMessage}
              </div>
            )}
            <div className="modal-form">
              <input
                type="text"
                placeholder="Vendor ID (Phone)"
                value={vendorFormData.id}
                onChange={(e) =>
                  setVendorFormData({ ...vendorFormData, id: e.target.value })
                }
                className="search-input"
              />
              <input
                type="text"
                placeholder="Vendor Name"
                value={vendorFormData.name}
                onChange={(e) =>
                  setVendorFormData({ ...vendorFormData, name: e.target.value })
                }
                className="search-input"
              />
              <select
                value={vendorFormData.product_type}
                onChange={(e) =>
                  setVendorFormData({
                    ...vendorFormData,
                    product_type: e.target.value,
                  })
                }
                className="category-select">
                <option value="multi">Multi</option>
                <option value="single">Single</option>
              </select>
              <input
                type="number"
                placeholder="Commission (%)"
                value={vendorFormData.commission}
                onChange={(e) =>
                  setVendorFormData({
                    ...vendorFormData,
                    commission: e.target.value,
                  })
                }
                className="search-input"
                min="0"
                step="0.1"
              />
              <button className="action-button" onClick={handleAddVendor}>
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVendor && (
        <div className="vendor-details">
          <h3>{selectedVendor.shop_name} Details</h3>
          <div className="sub-tabs">
            <div
              className={`sub-tab ${subTab === "products" ? "active" : ""}`}
              onClick={() => handleSubTabChange("products")}>
              Products
            </div>
            <div
              className={`sub-tab ${subTab === "accounts" ? "active" : ""}`}
              onClick={() => handleSubTabChange("accounts")}>
              Accounts
            </div>
          </div>

          {subTab === "products" && (
            <div className="vendor-products">
              <div className="products-header">
                <h4>Products</h4>
                <button
                  className="action-button"
                  onClick={() => setShowAddProductModal(true)}>
                  Add Product
                </button>
              </div>
              {isLoadingVendorProducts ? (
                <div className="loading-spinner">Loading products...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Retailer ID</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Sale Price</th>
                      <th>Availability</th>
                      <th>Commission</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorProducts.length > 0 ? (
                      vendorProducts.map((product) => (
                        <tr key={product.retailer_id}>
                          <td>{product.retailer_id}</td>
                          <td>{product.name}</td>
                          <td>{product.price}</td>
                          <td>{product.sale_price}</td>
                          <td>{product.availability}</td>
                          <td>{product.is_percentage ? "%" : "$"}</td>
                          <td>
                            <button
                              className="action-button"
                              onClick={() => handleEditProduct(product)}>
                              Edit
                            </button>
                            <button
                              className="action-button"
                              onClick={() =>
                                handleDeleteProduct(product.retailer_id)
                              }>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6">No products found for this vendor</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {showAddProductModal && (
                <div
                  className="modal"
                  role="dialog"
                  aria-labelledby="modal-title">
                  <div className="modal-content">
                    <h4 id="modal-title">Select Products to Add</h4>
                    <button
                      className="close-button"
                      onClick={() => {
                        setShowAddProductModal(false);
                        setFeedbackMessage("");
                      }}>
                      Close
                    </button>
                    {feedbackMessage && (
                      <div
                        className={`feedback-message ${
                          feedbackMessage.includes("success")
                            ? "success"
                            : "error"
                        }`}>
                        {feedbackMessage}
                      </div>
                    )}
                    <div className="modal-filters">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="search-input"
                      />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select">
                        <option value="">All Products</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Retailer ID</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <tr key={product.retailer_id}>
                              <td>{product.retailer_id}</td>
                              <td>{product.name}</td>
                              <td>{product.price}</td>
                              <td>
                                <button
                                  className="action-button"
                                  onClick={() => handleAddProduct(product)}
                                  disabled={vendorProducts.some(
                                    (vp) =>
                                      vp.retailer_id === product.retailer_id
                                  )}>
                                  {vendorProducts.some(
                                    (vp) =>
                                      vp.retailer_id === product.retailer_id
                                  )
                                    ? "Added"
                                    : "Add"}
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4">No products found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showEditProductModal && (
                <div
                  className="modal"
                  role="dialog"
                  aria-labelledby="edit-product-modal-title">
                  <div className="modal-content">
                    <h4 id="edit-product-modal-title">Edit Product</h4>
                    <button
                      className="close-button"
                      onClick={() => {
                        setShowEditProductModal(false);
                        setFeedbackMessage("");
                        setEditProductData({
                          id: "",
                          retailer_id: "",
                          vendor_price: "",
                          is_percentage: false,
                          price: "",
                          sale_price: "",
                          availability: "",
                        });
                      }}
                      disabled={isUpdatingProduct}>
                      Close
                    </button>
                    {feedbackMessage && (
                      <div
                        className={`feedback-message ${
                          feedbackMessage.includes("success")
                            ? "success"
                            : "error"
                        }`}>
                        {feedbackMessage}
                      </div>
                    )}
                    <div className="modal-form">
                      <div className="modal-field">
                        <label>Commission Type</label>
                        <select
                          value={editProductData.is_percentage ? "%" : "$"}
                          onChange={(e) =>
                            setEditProductData({
                              ...editProductData,
                              is_percentage: e.target.value === "%",
                              vendor_price:
                                e.target.value === "%"
                                  ? ""
                                  : editProductData.vendor_price,
                            })
                          }
                          className="category-select"
                          disabled={isUpdatingProduct}>
                          <option value="$">$</option>
                          <option value="%">%</option>
                        </select>
                      </div>
                      <div className="modal-field">
                        <label>Vendor Price</label>
                        <input
                          type="number"
                          placeholder="Vendor Price"
                          value={editProductData.vendor_price}
                          onChange={(e) =>
                            setEditProductData({
                              ...editProductData,
                              vendor_price: e.target.value,
                            })
                          }
                          disabled={
                            editProductData.is_percentage || isUpdatingProduct
                          }
                          className="search-input"
                        />
                      </div>
                      <div className="modal-field">
                        <label>Price</label>
                        <input
                          type="number"
                          placeholder="Price"
                          value={editProductData.price}
                          onChange={(e) =>
                            setEditProductData({
                              ...editProductData,
                              price: e.target.value,
                            })
                          }
                          disabled={isUpdatingProduct}
                          className="search-input"
                          step="0.01"
                        />
                      </div>
                      <div className="modal-field">
                        <label>Sale Price (leave blank to disable)</label>
                        <input
                          type="number"
                          placeholder="Sale Price"
                          value={editProductData.sale_price}
                          onChange={(e) =>
                            setEditProductData({
                              ...editProductData,
                              sale_price: e.target.value,
                            })
                          }
                          disabled={isUpdatingProduct}
                          className="search-input"
                          step="0.01"
                        />
                      </div>
                      <div className="modal-field">
                        <label>Availability</label>
                        <select
                          value={editProductData.availability}
                          onChange={(e) =>
                            setEditProductData({
                              ...editProductData,
                              availability: e.target.value,
                            })
                          }
                          className="category-select"
                          disabled={isUpdatingProduct}>
                          <option value="">Select Availability</option>
                          <option value="in stock">In Stock</option>
                          <option value="out of stock">Out of Stock</option>
                        </select>
                      </div>
                      <button
                        className="action-button"
                        onClick={handleUpdateProduct}
                        disabled={isUpdatingProduct}>
                        {isUpdatingProduct ? "Updating..." : "Update Product"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === "accounts" && (
            <div className="vendor-accounts">
              <h4>Accounts</h4>
              <div className="account-sub-tabs">
                <div
                  className={`sub-tab ${
                    accountSubTab === "paid" ? "active" : ""
                  }`}
                  onClick={() => handleAccountSubTabChange("paid")}>
                  Paid Bills
                </div>
                <div
                  className={`sub-tab ${
                    accountSubTab === "unpaid" ? "active" : ""
                  }`}
                  onClick={() => handleAccountSubTabChange("unpaid")}>
                  Unpaid Bills
                </div>
              </div>
              <div className="accounts-content">
                {accountSubTab === "paid" && (
                  <>
                    <div className="accounts-summary">
                      <h5>Total Cleared Amount: {totalPaidAmount}</h5>
                      <h5>Commission: {paidCommission}</h5>
                      <h5>
                        Payable Amount: {payablePercentageAmount ?? "N/A"}
                      </h5>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Bill Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidOrders.length > 0 ? (
                          paidOrders.map((order) => (
                            <tr key={order.order_id}>
                              <td>{order.order_id}</td>
                              <td>{order.bill_amount}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2">No paid orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
                {accountSubTab === "unpaid" && (
                  <>
                    <div className="accounts-summary">
                      <h5>Total Payable: {totalPayable.toFixed(2)}</h5>
                      <h5>
                        Total Pending Amount:{" "}
                        {unpaidOrderType === "margin"
                          ? totalUnpaidMarginAmount
                          : totalUnpaidPercentageAmount}
                      </h5>
                      <h5>
                        Commission:{" "}
                        {unpaidOrderType === "margin"
                          ? unpaidMarginCommission
                          : unpaidPercentageCommission}
                      </h5>
                      <h5>
                        Payable Amount:{" "}
                        {unpaidOrderType === "margin"
                          ? payableMarginAmount ?? "N/A"
                          : payablePercentageAmount ?? "N/A"}
                      </h5>
                    </div>
                    {isSplitResponse && (
                      <div className="order-type-switch">
                        <label>
                          <input
                            type="radio"
                            value="percentage"
                            checked={unpaidOrderType === "percentage"}
                            onChange={() =>
                              handleUnpaidOrderTypeChange("percentage")
                            }
                          />
                          Percentage Orders
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="margin"
                            checked={unpaidOrderType === "margin"}
                            onChange={() =>
                              handleUnpaidOrderTypeChange("margin")
                            }
                          />
                          Margin Orders
                        </label>
                      </div>
                    )}
                    <button
                      className="action-button"
                      onClick={() => setShowPayModal(true)}
                      disabled={totalPayable <= 0 || isPaying}>
                      {isPaying ? "Processing..." : "Clear/Pay"}
                    </button>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Bill Amount</th>
                          <th>Vendor Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(unpaidOrderType === "margin"
                          ? unpaidMarginOrders
                          : unpaidPercentageOrders
                        ).length > 0 ? (
                          (unpaidOrderType === "margin"
                            ? unpaidMarginOrders
                            : unpaidPercentageOrders
                          ).map((order) => (
                            <tr key={order.order_id}>
                              <td>{order.order_id}</td>
                              <td>{order.bill_amount}</td>
                              <td>{order.vendor_price}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3">No unpaid orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}

          {showPayModal && (
            <div
              className="modal"
              role="dialog"
              aria-labelledby="pay-modal-title">
              <div className="modal-content">
                <h4 id="pay-modal-title">Clear/Pay Pending Amount</h4>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowPayModal(false);
                    setFeedbackMessage("");
                    setPayFormData({ transactionId: "", description: "" });
                  }}
                  disabled={isPaying}>
                  Close
                </button>
                {feedbackMessage && (
                  <div
                    className={`feedback-message ${
                      feedbackMessage.includes("success") ? "success" : "error"
                    }`}>
                    {feedbackMessage}
                  </div>
                )}
                <div className="modal-form">
                  <div className="modal-field">
                    <label>Pay Amount</label>
                    <input
                      type="text"
                      value={totalPayable.toFixed(2)}
                      readOnly
                      className="search-input"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Transaction ID</label>
                    <input
                      type="text"
                      placeholder="Transaction ID"
                      value={payFormData.transactionId}
                      onChange={(e) =>
                        setPayFormData({
                          ...payFormData,
                          transactionId: e.target.value,
                        })
                      }
                      className="search-input"
                      disabled={isPaying}
                    />
                  </div>
                  <div className="modal-field">
                    <label>Description</label>
                    <textarea
                      placeholder="Description"
                      value={payFormData.description}
                      onChange={(e) =>
                        setPayFormData({
                          ...payFormData,
                          description: e.target.value,
                        })
                      }
                      className="search-input"
                      rows="4"
                      disabled={isPaying}
                    />
                  </div>
                  <button
                    className="action-button"
                    onClick={handlePay}
                    disabled={isPaying}>
                    {isPaying ? "Processing..." : "Submit Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorsTable;
