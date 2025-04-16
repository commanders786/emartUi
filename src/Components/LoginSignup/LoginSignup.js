import React, { useState } from "react";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import "./LoginSignup.css";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [action, setAction] = useState("Signup");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Dummy credentials validation
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if (email && password) {
      console.log("Logged in with:", email);
      navigate("/home"); // navigate to homepage
    } else {
      alert("Please enter credentials");
    }
  };

  // const handleGoogleSignIn = () => {
  //   // Stub for Google Sign-In integration
  //   alert("Google Sign-In clicked!");
  //   // You can integrate Firebase Auth or Google API here
  //   navigate("/home");
  // };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {action === "Login" ? (
          <div></div>
        ) : (
          <div className="input">
            <img src={user_icon} alt="" />
            <input type="text" placeholder="username" />
          </div>
        )}
        <div className="input">
          <img src={email_icon} alt="" />
          <input type="email" placeholder="email" />
        </div>
        <div className="input">
          <img src={password_icon} alt="" />
          <input type="password" placeholder="password" />
        </div>
      </div>

      {action === "Login" ? (
        <div className="forgot-password">
          forgot password? <span>click here</span>
        </div>
      ) : (
        <div></div>
      )}
      <div className="submit-container">
        <div
          className={action === "Signup" ? "submit" : "submit gray"}
          onClick={() => {
            setAction("Signup");
          }}>
          sign up
        </div>
        <div
          className={action === "Login" ? "submit" : "submit gray"}
          onClick={() => {
            if (action === "Login") {
              handleLogin(); // login and redirect
            } else {
              setAction("Login");
            }
          }}>
          Login
        </div>
      </div>
      {/* <div className="or">OR</div>

      <div className="google-btn" onClick={handleGoogleSignIn}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
          alt="Google"
          className="google-icon"
        />
        <span>Sign in with Google</span>
      </div> */}
    </div>
  );
};

export default LoginSignup;
