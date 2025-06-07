
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import MyContext from "./context/MyContext";
import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/UserDashboard";
import StaffDashboard from "./Components/StaffDashboard";

const values = {}; // Your context values

function App() {
  const location = window.location.pathname;
  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
        </Routes>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
