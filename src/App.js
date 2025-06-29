import "./App.css";
import "./Components/LoginSignup/LoginSignup.css";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/Screens/HomePage";
import ProtectedRoute from "./Components/ProtectedRoute"; // Import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
