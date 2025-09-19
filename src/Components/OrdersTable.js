import React, { useState, useEffect } from "react";
import "./OrderTable.css";

const OrdersTable = ({
  search,
  setSearch,
  filter,
  setFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  ordersData,
  setOrders,
  totalPages,
  setTotalPages,
  totalOrders,
  setTotalOrders,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  // Convert UTC to IST
  const convertToIST = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // 🔥 Fetch orders from backend with pagination and filtering
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          per_page: itemsPerPage,
          ...(search && { search }),
          ...(filter && { feedback: filter }),
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        });

        console.log("Query Params:", queryParams.toString()); // Debug: Log query params

        const response = await fetch(
          `${baseUrl}/orders?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch orders: ${response.status}`);

        const data = await response.json();
        console.log("API Response:", data); // Debug: Log API response

        if (!Array.isArray(data.data)) {
          throw new Error("Orders data is not an array");
        }

        setOrders(data.data);
        setTotalPages(data.total_pages || 1);
        setTotalOrders(data.total || 0);
        setTotalSales(data.total_sales || 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [
    baseUrl,
    currentPage,
    itemsPerPage,
    search,
    filter,
    startDate,
    endDate,
    setOrders,
    setTotalPages,
    setTotalOrders,
  ]);

  const openModal = (receiptText) => {
    setSelectedReceipt(receiptText);
    setShowModal(true);
    setCopyFeedback("");
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = selectedReceipt.replace(/\\n/g, "\n");
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${baseUrl}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status");
    }
  };

  // Pagination controls
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Generate page numbers (show limited range around current page)
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  // Validate and format date inputs
  const handleDateChange = (setter) => (e) => {
    const value = e.target.value;
    console.log(`Date changed: ${setter.name} = ${value}`); // Debug: Log date changes
    setter(value);
  };

  return (
    <>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Order ID or User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Feedback</option>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
        </select>
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={handleDateChange(setStartDate)}
        />
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={handleDateChange(setEndDate)}
        />
      </div>

      {isLoading && <p>Loading orders...</p>}
      {error && <p className="error">{error}</p>}
      <div className="order-stats">
        <p className="order-count">Total Orders: {totalOrders}</p>
        <p className="order-sales">Total Sales: ₹{totalSales.toFixed(2)}</p>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Phone</th>
            <th>Bill Amount</th>
            <th>Date & Time</th>
            <th>Feedback</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {ordersData.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user}</td>
              <td>{order.phone || "—"}</td>
              <td>₹{order.bill_amount}</td>
              <td>{convertToIST(order.created_at)}</td>
              <td>{order.feedback || "—"}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="status-dropdown">
                  <option value="pending">pending</option>
                  <option value="delivered">delivered</option>
                  <option value="picked up">picked up</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => openModal(order.receipt)}
                  className="view-btn">
                  <img
                    src="/assets/show.png"
                    alt="View Receipt"
                    className="view-icon"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={currentPage === page ? "active" : ""}>
            {page}
          </button>
        ))}
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Receipt Text</h3>
            <pre className="receipt-text">
              {selectedReceipt.replace(/\\n/g, "\n")}
            </pre>
            <div className="modal-buttons">
              <button onClick={copyToClipboard}>Copy</button>
              <button onClick={() => setShowModal(false)}>Close</button>
              {copyFeedback && (
                <span className="copy-feedback">{copyFeedback}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersTable;
