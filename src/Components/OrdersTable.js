import React, { useState } from "react";
import "./Screens/HomePage"; // Add minimal styling for modal & table
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
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState("");

  const filteredOrders = ordersData.filter(
    (order) =>
      (order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.user.toLowerCase().includes(search.toLowerCase())) &&
      (filter ? order.feedback === filter : true)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (receiptText) => {
    setSelectedReceipt(receiptText);
    setShowModal(true);
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
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.user}</td>
              <td>₹{order.bill_amount}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{order.feedback || "—"}</td>
              <td>
                <button onClick={() => openModal(order.receipt)}>
                  👁️ View
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
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersTable;
