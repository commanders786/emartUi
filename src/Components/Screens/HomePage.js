import React, { useState, useEffect, useRef } from "react";
import UsersTable from "../UsersTable";
import OrdersTable from "../OrdersTable";
import "./HomePage.css";

const HomePage = () => {
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [joinDateSearch, setJoinDateSearch] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const itemsPerPage = 10;

  const alertSound = useRef(null);
  const userInteracted = useRef(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      userInteracted.current = true;
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    alertSound.current = new Audio("/assets/error_sound-221445.mp3");
    alertSound.current.load();

    alertSound.current.onerror = (err) => {
      console.error("❌ Audio load error:", err);
    };

    alertSound.current.onloadeddata = () => {
      console.log("✅ Audio loaded successfully");
    };
  }, []);

  const handlePlaySound = () => {
    if (userInteracted.current) {
      alertSound.current.play().catch((err) => {
        console.warn("❌ Audio play error:", err.message);
      });
    } else {
      console.log("❌ User interaction required for sound");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://python-whatsapp-bot-main-production-3c9c.up.railway.app/orders"
        );
        const data = await response.json();

        // Debug: Log the response
        console.log("Orders response:", data);

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("Orders data is not an array:", data);
          return;
        }

        if (data.length !== ordersData.length && userInteracted.current) {
          handlePlaySound();
        }

        setOrdersData((prev) => {
          const newOrders = data.filter(
            (order) => !prev.some((o) => o.id === order.id)
          );
          const combined = [...newOrders, ...prev];
          combined.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          return combined;
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://python-whatsapp-bot-main-production-3c9c.up.railway.app/users"
        );
        const data = await response.json();

        // Debug: Log the response
        console.log("Users response:", data);

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("Users data is not an array:", data);
          return;
        }

        setUsersData((prev) => {
          const newUsers = data.filter(
            (user) => !prev.some((u) => u.id === user.id)
          );
          return [...newUsers, ...prev];
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchOrders();
    fetchUsers();

    const interval = setInterval(() => {
      fetchOrders();
      fetchUsers();
    }, 10000);

    return () => clearInterval(interval);
  }, [ordersData.length]);

  return (
    <div className="homepage-container">
      <div className="topbar">
        <div className="logo">
          അങ്ങാടി <div className="caption">Market is in your chat</div>
        </div>

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
        {tab === "orders" ? (
          <OrdersTable
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            ordersData={ordersData}
            setOrders={setOrdersData}
          />
        ) : (
          <UsersTable
            usersData={usersData}
            search={search}
            setSearch={setSearch}
            joinDateSearch={joinDateSearch}
            setJoinDateSearch={setJoinDateSearch}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
