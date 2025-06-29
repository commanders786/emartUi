import React, { useState } from "react";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import "./LoginSignup.css";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [action, setAction] = useState("Login");
  const navigate = useNavigate();
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    "https://python-whatsapp-bot-main-production-3c9c.up.railway.app";
  console.log("API Base URL:", baseUrl); // Debug

  const handleLogin = async () => {
    try {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');

      if (!emailInput || !passwordInput) {
        console.error("Input elements not found");
        alert("Input fields not found. Please check the form.");
        return;
      }

      const email = emailInput.value;
      const password = passwordInput.value;

      if (!email || !password) {
        console.log("Empty email or password");
        alert("Please enter both email and password");
        return;
      }

      const loginUrl = `${baseUrl}/login`;
      console.log("Constructed login URL:", loginUrl); // Debug
      console.log("Request body:", { email, password }); // Debug

      // Validate URL
      new URL(loginUrl); // Throws if invalid

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data, "Status:", response.status); // Debug

      if (response.ok && data.status === 200 && data.token) {
        console.log("Login successful:", data.message);
        localStorage.setItem("authToken", data.token);
        navigate("/home");
      } else {
        alert(data.message || `Login failed (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Login error:", error.name, error.message, error.stack); // Detailed debug
      alert(
        `Login error: ${error.message}. Please check the server and try again.`
      );
    }
  };

  const handleSignup = async () => {
    try {
      const usernameInput = document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');

      if (!usernameInput || !emailInput || !passwordInput) {
        console.error("Input elements not found for signup");
        alert("Input fields not found. Please check the form.");
        return;
      }

      const username = usernameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;

      if (!username || !email || !password) {
        console.log("Empty fields for signup");
        alert("Please enter all fields");
        return;
      }

      const signupUrl = `${baseUrl}/signup`;
      console.log("Constructed signup URL:", signupUrl); // Debug
      console.log("Request body:", { username, email, password }); // Debug

      // Validate URL
      new URL(signupUrl);

      const response = await fetch(signupUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      console.log("Signup response:", data, "Status:", response.status); // Debug

      if (response.ok && data.status === 200) {
        console.log("Signup successful:", data.message);
        setAction("Login");
      } else {
        alert(data.message || `Signup failed (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Signup error:", error.name, error.message, error.stack); // Detailed debug
      alert(
        `Signup error: ${error.message}. Please check the server and try again.`
      );
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {action === "Login" ? null : (
          <div className="input">
            <img src={user_icon} alt="Username" />
            <input type="text" placeholder="username" />
          </div>
        )}
        <div className="input">
          <img src={email_icon} alt="Email" />
          <input type="email" placeholder="email" />
        </div>
        <div className="input">
          <img src={password_icon} alt="Password" />
          <input type="password" placeholder="password" />
        </div>
      </div>

      {action === "Login" ? (
        <div className="forgot-password">
          Forgot password? <span>Click here</span>
        </div>
      ) : null}

      <div className="submit-container">
        <div
          className={action === "Signup" ? "submit" : "submit gray"}
          onClick={() => {
            if (action === "Signup") {
              handleSignup();
            } else {
              setAction("Signup");
            }
          }}>
          Sign up
        </div>
        <div
          className={action === "Login" ? "submit" : "submit gray"}
          onClick={() => {
            if (action === "Login") {
              handleLogin();
            } else {
              setAction("Login");
            }
          }}>
          Login
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
