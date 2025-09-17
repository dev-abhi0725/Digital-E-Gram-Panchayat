import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../../firebase";
import { MdOutlineClose } from "react-icons/md";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const RegisterModal = ({ show, onClose, showLoginModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [uniqueId, setUniqueId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // if (role === "admin" && uniqueId !== "JH2025ADMIN") {
    //   setErrorMessage("Invalid Unique ID for admin registration!");
    //   return;
    // }
    if (role === "staff" && uniqueId !== "JH2025STAFF") {
      setErrorMessage("Invalid Unique ID for staff registration!");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingUserRole = querySnapshot.docs[0].data().role;
        if (existingUserRole !== role) {
          setErrorMessage(`This email is already registered as a ${existingUserRole}. Please use a different email.`);
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await addDoc(usersRef, {
        email: email,
        role: role,
        uid: user.uid,
      });

      setSuccessMessage("Registration successful! Please verify your email.");
      setTimeout(() => {
        onClose();
        showLoginModal();
      }, 2000);

      setEmail("");
      setPassword("");
      setRole("user");
      setUniqueId("");
    } catch (error) {
      console.error("Registration error:", error.message);
      setErrorMessage(error.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <form onSubmit={handleRegister} className="modal-content">
        <h2 className="login-title">
          Register{" "}
          <span className="popout" onClick={onClose} style={{ cursor: "pointer" }}>
            <MdOutlineClose />
          </span>
        </h2>

        {successMessage && (
          <p className="alert alert-success mt-2 text-center">{successMessage}</p>
        )}

        {errorMessage && (
          <p className="alert alert-danger mt-2 text-center">{errorMessage}</p>
        )}

        <label className="mt-3">Register as:</label>
        <select
          className="form-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="staff">Staff</option>
          {/* <option value="admin">Admin</option> */}
        </select>

        {(role === "admin" || role === "staff") && (
          <>
            <label>Unique ID:</label>
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
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: "2.5rem" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#555",
              fontSize: "1.25rem",
              userSelect: "none",
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        <button type="submit" className="btn btn-primary login-btn mt-3">
          Register
        </button>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              showLoginModal();
            }}
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterModal;
