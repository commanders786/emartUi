import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UsersTable from "../UsersTable";
import OrdersTable from "../OrdersTable";
import ProductsTable from "../ProductsTable";
import VendorsTable from "../VendorsTable";
import BillingTable from "../BillingTable";
import Insights from "../Insights"; // Add this import
import "./HomePage.css";

const HomePage = () => {
  const [tab, setTab] = useState("orders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [joinDateSearch, setJoinDateSearch] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [vendorsData, setVendorsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const itemsPerPage = 10;
  const alertSound = useRef(null);
  const userInteracted = useRef(false);
  const newOrderReceived = useRef(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
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

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Users data is not an array:", data);
          return;
        }

        setUsersData(data);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        const allProducts = [
          ...(data.bakeries || []),
          ...(data.fish || []),
          ...(data.food || []),
          ...(data.fruits || []),
          ...(data.general || []),
        ];

        setProductsData(allProducts);
        console.log("Products data:", allProducts);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    const fetchVendors = async () => {
      try {
        const response = await fetch(`${baseUrl}/vendors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
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

    fetchUsers();
    fetchProducts();
    fetchVendors();

    const eventSource = new EventSource(`${baseUrl}/events`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Message:", data);
        if (data.message === "New order created") {
          newOrderReceived.current = true;
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error.message);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [baseUrl, navigate]);

  return (
    <div className="homepage-container">
      <div className="topbar">
        <div className="logo">
          അങ്ങാടി <div className="caption">Market in your chat</div>
        </div>

        <div className="tabs">
          <div
            className={`tab ${tab === "Insights" ? "active" : ""}`}
            onClick={() => setTab("Insights")}>
            Insights
          </div>
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
        {tab === "Insights" && (
          <Insights search={search} setSearch={setSearch} />
        )}
        {tab === "orders" && (
          <OrdersTable
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            itemsPerPage={itemsPerPage}
            ordersData={ordersData}
            setOrders={setOrdersData}
            totalPages={totalPages}
            setTotalPages={setTotalPages}
            totalOrders={totalOrders}
            setTotalOrders={setTotalOrders}
            newOrderReceived={newOrderReceived}
            handlePlaySound={handlePlaySound}
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
