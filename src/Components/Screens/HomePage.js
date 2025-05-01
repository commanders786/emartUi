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

  // ✅ Setup sound & user interaction flags
  const alertSound = useRef(null);
  const userInteracted = useRef(false);

  // ✅ Track first user interaction to allow audio
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

  // ✅ Initialize and load audio when the component mounts
  useEffect(() => {
    alertSound.current = new Audio("/assets/error_sound-221445.mp3"); // Ensure the path is correct
    alertSound.current.load();

    alertSound.current.onerror = (err) => {
      console.error("❌ Audio load error:", err);
    };

    alertSound.current.onloadeddata = () => {
      console.log("✅ Audio loaded successfully");
    };
  }, []);

  // ✅ Handle audio play when new data is fetched
  const handlePlaySound = () => {
    if (userInteracted.current) {
      alertSound.current.play().catch((err) => {
        console.warn("❌ Audio play error:", err.message);
      });
    } else {
      console.log("❌ User interaction required for sound");
    }
  };

  // Fetch orders and users data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "https://dc95-171-76-84-29.ngrok-free.app/orders"
        );
        const data = await response.json();

        if (data.length !== ordersData.length && userInteracted.current) {
          handlePlaySound(); // Play sound if new orders are fetched
        }

        setOrdersData((prev) => {
          const newOrders = data.filter(
            (order) => !prev.some((o) => o.id === order.id)
          );
          return [...newOrders, ...prev];
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://dc95-171-76-84-29.ngrok-free.app/users"
        );
        const data = await response.json();
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

    // Initial fetch
    fetchOrders();
    fetchUsers();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchOrders();
      fetchUsers();
    }, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [ordersData.length]);

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
