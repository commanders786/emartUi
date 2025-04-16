import React, { useState } from "react";
import "./HomePage.css";

const ordersData = [
  { id: "ORD001", customer: "Alice", date: "2025-04-01", status: "Delivered" },
  { id: "ORD002", customer: "Bob", date: "2025-04-02", status: "Pending" },
  { id: "ORD003", customer: "Charlie", date: "2025-04-03", status: "Shipped" },
  // Add more as needed
];

const usersData = [
  {
    id: "USR001",
    name: "Alice",
    email: "alice@example.com",
    phone: "9645846341",
    joinDate: "2025-04-01",
  },
  {
    id: "USR002",
    name: "Bob",
    email: "bob@example.com",
    phone: "9645846341",
    joinDate: "2025-04-02",
  },
  {
    id: "USR003",
    name: "Charlie",
    email: "charlie@example.com",
    phone: "9645846340",
    joinDate: "2025-04-03",
  },
  // Add more users
];

const HomePage = () => {
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [joinDateSearch, setJoinDateSearch] = useState("");
  const itemsPerPage = 10;

  const filteredOrders = ordersData.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? order.status === filter : true)
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderOrdersTable = () => (
    <>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="">All</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>{order.status}</td>
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
    </>
  );

  const renderUsersTable = () => (
    <>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by phone number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <input
          type="date"
          value={joinDateSearch}
          onChange={(e) => setJoinDateSearch(e.target.value)}
          className="search-input"
          style={{ marginLeft: "10px" }}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          {usersData
            .filter(
              (user) =>
                user.phone.includes(search) &&
                (joinDateSearch ? user.joinDate === joinDateSearch : true)
            )
            .map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.joinDate}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="homepage-container">
      <div className="topbar">
        <div className="logo">eMart</div>
        <div className="tabs">
          <div
            className={`tab ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}>
            Orders
          </div>
          <div
            className={`tab ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}>
            Users
          </div>
        </div>
      </div>
      <div className="content">
        {tab === "orders" ? renderOrdersTable() : renderUsersTable()}
      </div>
    </div>
  );
};

export default HomePage;
