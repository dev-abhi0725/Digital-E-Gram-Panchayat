import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { MdOutlineClose } from "react-icons/md";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify"; // ✅ added
import "react-toastify/dist/ReactToastify.css"; // ✅ added

import "../../../App";

const LoginModal = ({ show, onClose, showRegisterModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [uniqueId, setUniqueId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password dialog states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpRole, setFpRole] = useState("user");

  const navigate = useNavigate();

  // ✅ Detect screen size for toast position
  const toastPosition =
    window.innerWidth < 768 ? "bottom-center" : "top-right";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Hardcoded admin credentials
      if (role === "admin") {
        if (uniqueId !== "ADMIN2025" || password !== "Admin@2025") {
          toast.error("Invalid Admin ID or Password");
          return;
        } else {
          setEmail("JHADMIN@gmail.com"); // pre-fill email
          navigate("/admin-dashboard");
          onClose();
          setEmail("");
          setPassword("");
          setUniqueId("");
          toast.success("Welcome Admin!");
          return;
        }
      }

      // Staff unique ID validation
      if (role === "staff" && uniqueId !== "STAFF2025") {
        toast.error("Invalid Staff ID");
        return;
      }

      // Firestore role check
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
          toast.warning(
            "This email is registered as a different role. Please login using the correct role."
          );
          return;
        }
      } else {
        toast.error("No user found with this email.");
        return;
      }

      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.info("Please verify your email before logging in. Check your inbox.");
        await signOut(auth);
        return;
      }

      if (role === "user") navigate("/user-dashboard");
      else if (role === "staff") navigate("/staff-dashboard");

      onClose();
      setEmail("");
      setPassword("");
      setUniqueId("");
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error.message);
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      if (fpRole === "admin") {
        toast.error("Admin password reset is not permitted.");
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", fpEmail),
        where("role", "==", fpRole)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.warning("No registered user found with this email and role.");
        return;
      }

      await sendPasswordResetEmail(auth, fpEmail);
      toast.success("Password reset link sent to your email.");
      setShowForgotPassword(false);
      setFpEmail("");
      setFpRole("user");
    } catch (error) {
      console.error("Forgot Password error:", error.message);
      toast.error(error.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <form onSubmit={handleLogin} className="modal-content">
        <h2 className="login-title">
          Login{" "}
          <span
            className="popout"
            onClick={onClose}
            style={{ cursor: "pointer" }}
          >
            <MdOutlineClose />
          </span>
        </h2>

        <label className="mt-3">Login as:</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option className="f-select" value="user">
            User
          </option>
          <option className="f-select" value="staff">
            Staff
          </option>
          <option className="f-select" value="admin">
            Admin
          </option>
        </select>

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
          value={role === "admin" ? "JHAdmin2015@gmail.com" : email}
          onChange={(e) => role !== "admin" && setEmail(e.target.value)}
          required
          readOnly={role === "admin"}
        />

        <label>Password:</label>
        <div
          className="password-input-container"
          style={{ position: "relative" }}
        >
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

        {/* Forgot Password Button */}
        <p className="mt-2 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowForgotPassword(true);
            }}
          >
            Forgot Password?
          </a>
        </p>

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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <form onSubmit={handleForgotPassword} className="modal-content">
            <h3>
              Reset Password{" "}
              <span
                onClick={() => setShowForgotPassword(false)}
                style={{ cursor: "pointer" }}
              >
                <MdOutlineClose />
              </span>
            </h3>

            <label>Select Role:</label>
            <select
              className="form-select"
              value={fpRole}
              onChange={(e) => setFpRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="staff">Staff</option>
            </select>

            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-primary mt-3">
              Send Reset Link
            </button>
          </form>
        </div>
      )}

      {/* ✅ Toast container for showing messages */}
      <ToastContainer
        position={toastPosition}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default LoginModal;
