import "./App.css";
import "./Components/LoginSignup/LoginSignup";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/Screens/HomePage";

function App() {
  return (
    // <div className="App">
    //   {/* <LoginSignup></LoginSignup> */}
    //   {/* <HomePage></HomePage> */}
    // </div>
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
