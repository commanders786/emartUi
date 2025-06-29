import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("authToken");
  console.log("ProtectedRoute: Token exists?", !!token); // Debug

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
