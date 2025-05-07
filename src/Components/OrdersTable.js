import React, { useState } from "react";
import "./Screens/HomePage";
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
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const filteredOrders = ordersData
    .filter(
      (order) =>
        (order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.user.toLowerCase().includes(search.toLowerCase())) &&
        (filter ? order.feedback === filter : true)
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      // Update backend
      const response = await fetch(
        `http://python-whatsapp-bot-main-production-3c9c.up.railway.app/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update frontend state
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
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Bill Amount</th>
            <th>Date & Time</th>
            <th>Feedback</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user}</td>
              <td>₹{order.bill_amount}</td>
              <td>{order.created_at}</td>
              <td>{order.feedback || "—"}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="bg-transparent outline-none">
                  <option value="pending">pending</option>
                  <option value="delivered">delivered</option>
                </select>
              </td>
              <td>
                <button onClick={() => openModal(order.receipt)}>
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
        {Array.from({
          length: Math.ceil(filteredOrders.length / itemsPerPage),
        }).map((_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Receipt Text</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
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

      <style>
        {`
          .modal-buttons {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-top: 10px;
          }
          .modal-buttons button {
            padding: 8px 16px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            background-color: rgb(56, 226, 47);
            color: white;
            font-size: 14px;
          }
          .modal-buttons button:hover {
            background-color: rgba(33, 139, 12, 0.89);
          }
          .copy-feedback {
            font-size: 12px;
            color: #28a745;
          }
          .copy-feedback.error {
            color: #dc3545;
          }
          .view-icon {
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin-right: 4px;
          }
          td button {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            background-color: white;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          td button:hover {
            background-color: white;
          }
        `}
      </style>
    </>
  );
};

export default OrdersTable;
