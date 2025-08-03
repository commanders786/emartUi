import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UsersTable from "../UsersTable";
import OrdersTable from "../OrdersTable";
import ProductsTable from "../ProductsTable";
import VendorsTable from "../VendorsTable";
import BillingTable from "../BillingTable";
import "./HomePage.css";

const HomePage = () => {
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [joinDateSearch, setJoinDateSearch] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [vendorsData, setVendorsData] = useState([]);

  const itemsPerPage = 10;
  const alertSound = useRef(null);
  const userInteracted = useRef(false);
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app";
  const navigate = useNavigate();

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
    if (!process.env.REACT_APP_API_BASE_URL) {
      console.warn(
        "⚠️ REACT_APP_API_BASE_URL not defined in .env, using fallback:",
        baseUrl
      );
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No auth token found. Redirecting to login.");
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${baseUrl}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

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
        console.error("Error fetching orders:", error.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

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
        console.error("Error fetching users:", error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Products data is not an array:", data);
          return;
        }

        setProductsData(data);
        console.log("Products data:", data);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

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

    // Initial data fetch
    fetchOrders();
    fetchUsers();
    fetchProducts();
    fetchVendors();

    // Set up SSE
    const eventSource = new EventSource(`${baseUrl}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Message:", data);
        if (data.message === "New order created") {
          fetchOrders();
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error.message);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    // Cleanup SSE connection
    return () => {
      eventSource.close();
    };
  }, [baseUrl, navigate, ordersData.length]);

  return (
    <div className="homepage-container">
      <div className="topbar">
        <div className="logo">
          അങ്ങാടി <div className="caption">Market in your chat</div>
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
          <div
            className={`tab ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}>
            Products
          </div>
          <div
            className={`tab ${tab === "vendors" ? "active" : ""}`}
            onClick={() => setTab("vendors")}>
            Vendors
          </div>
          <div
            className={`tab ${tab === "billing" ? "active" : ""}`}
            onClick={() => setTab("billing")}>
            Billing
          </div>
        </div>
      </div>

      <div className="content">
        {tab === "orders" && (
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
        )}

        {tab === "users" && (
          <UsersTable
            usersData={usersData}
            search={search}
            setSearch={setSearch}
            joinDateSearch={joinDateSearch}
            setJoinDateSearch={setJoinDateSearch}
          />
        )}

        {tab === "products" && (
          <ProductsTable
            productsData={productsData}
            search={search}
            setSearch={setSearch}
          />
        )}

        {tab === "vendors" && (
          <VendorsTable
            vendorsData={vendorsData}
            search={search}
            setSearch={setSearch}
          />
        )}

        {tab === "billing" && (
          <BillingTable search={search} setSearch={setSearch} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
