import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorsTable.css";

const VendorsTable = ({ search, setSearch }) => {
  const [vendorsData, setVendorsData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorAccounts, setVendorAccounts] = useState([]);
  const [subTab, setSubTab] = useState("products");
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app";
  const navigate = useNavigate();

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    const interval = setInterval(fetchVendors, 60000);
    return () => clearInterval(interval);
  }, [baseUrl, navigate]);

  // Fetch vendor products and accounts when a vendor is selected
  useEffect(() => {
    if (!selectedVendor) {
      setVendorProducts([]);
      setVendorAccounts([]);
      return;
    }

    const token = localStorage.getItem("authToken");

    const fetchVendorProducts = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/vendors/${selectedVendor.phone}/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Vendor products data is not an array:", data);
          return;
        }

        setVendorProducts(data);
      } catch (error) {
        console.error("Error fetching vendor products:", error.message);
      }
    };

    const fetchVendorAccounts = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/vendors/${selectedVendor.phone}/accounts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Vendor accounts data is not an array:", data);
          return;
        }

        setVendorAccounts(data);
      } catch (error) {
        console.error("Error fetching vendor accounts:", error.message);
      }
    };

    fetchVendorProducts();
    fetchVendorAccounts();
  }, [selectedVendor, baseUrl, navigate]);

  return (
    <div className="vendors-container">
      <div className="table-container">
        <div className="table-header">
          <h2>Vendors</h2>
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Phone</th>
              <th>Shop Name</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorsData.length > 0 ? (
              vendorsData
                .filter((vendor) =>
                  vendor.shop_name?.toLowerCase().includes(search.toLowerCase())
                )
                .map((vendor) => (
                  <tr
                    key={vendor.phone}
                    onClick={() => setSelectedVendor(vendor)}
                    className={
                      selectedVendor?.phone === vendor.phone ? "selected" : ""
                    }>
                    <td>{vendor.phone}</td>
                    <td>{vendor.shop_name}</td>
                    <td>{vendor.username}</td>
                    <td>
                      <button className="action-button">Edit</button>
                      <button className="action-button">Delete</button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4">No vendors found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedVendor && (
        <div className="vendor-details">
          <h3>{selectedVendor.shop_name} Details</h3>
          <div className="sub-tabs">
            <div
              className={`sub-tab ${subTab === "products" ? "active" : ""}`}
              onClick={() => setSubTab("products")}>
              Products
            </div>
            <div
              className={`sub-tab ${subTab === "accounts" ? "active" : ""}`}
              onClick={() => setSubTab("accounts")}>
              Accounts
            </div>
          </div>

          {subTab === "products" && (
            <div className="vendor-products">
              <h4>Products</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Retailer ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Sale Price</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorProducts.length > 0 ? (
                    vendorProducts.map((product) => (
                      <tr key={product.retailerid}>
                        <td>{product.retailerid}</td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.sale_price || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No products found for this vendor</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {subTab === "accounts" && (
            <div className="vendor-accounts">
              <h4>Accounts</h4>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Pending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorAccounts.length > 0 ? (
                    vendorAccounts.map((account) => (
                      <tr key={account.order_id}>
                        <td>{account.order_id}</td>
                        <td>{account.pending_amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No accounts found for this vendor</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorsTable;
