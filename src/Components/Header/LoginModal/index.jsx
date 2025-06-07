import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { MdOutlineClose } from "react-icons/md";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../../../App";

const LoginModal = ({ show, onClose, showRegisterModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [uniqueId, setUniqueId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Check role and unique ID for staff/admin
      if (role === "staff" && uniqueId !== "JH2025STAFF") {
        alert("Invalid Staff ID");
        return;
      }
      if (role === "admin" && uniqueId !== "JH2025ADMIN") {
        alert("Invalid Admin ID");
        return;
      }

      // Check if email exists in Firestore with a different role than selected
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        let roleMatched = false;
        querySnapshot.forEach((doc) => {
          if (doc.data().role === role) {
            roleMatched = true;
          }
        });
        if (!roleMatched) {
          alert(
            `This email is registered as a different role. Please login using the correct role.`
          );
          return;
        }
      } else {
        alert("No user found with this email.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        alert("Please verify your email before logging in. Check your inbox.");
        await signOut(auth);
        return;
      }

      // Redirect based on role
      if (role === "user") navigate("/user-dashboard");
      else if (role === "staff") navigate("/staff-dashboard");
      else if (role === "admin") navigate("/admin-dashboard");

      onClose();
      setEmail("");
      setPassword("");
      setUniqueId("");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <form onSubmit={handleLogin} className="modal-content">
        <h2 className="login-title">
          Login{" "}
          <span className="popout" onClick={onClose} style={{ cursor: "pointer" }}>
            <MdOutlineClose />
          </span>
        </h2>

        <label className="mt-3">Login as:</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option className="f-select" value="user">User</option>
          <option className="f-select" value="staff">Staff</option>
          <option className="f-select" value="admin">Admin</option>
        </select>

        {/* Show unique ID input only for staff and admin */}
        {(role === "staff" || role === "admin") && (
          <>
            <label>Enter Unique ID:</label>
            <input
              type="text"
              className="form-control"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
            />
          </>
        )}

        <label>Email:</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <div className="password-input-container" style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="btn btn-primary login-btn">
          Login
        </button>

        <p className="mt-3 text-center">
          Don’t have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              showRegisterModal();
            }}
          >
            Register here
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginModal;
