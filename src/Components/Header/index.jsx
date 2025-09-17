import React, { useState } from "react";
import Button from "@mui/material/Button";
import Logo from "../../assets/images/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import RegisterModal from "../RegisterModal";
import { auth } from "../../firebase";
import SchemesModal from "./SchemeModal";
import { IoIosMenu } from "react-icons/io";
import { MdOutlineClose } from "react-icons/md";

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSchemes, setShowSchemes] = useState(false); // state for schemes modal
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const openLoginModal = () => setShowLogin(true);
  const openRegisterModal = () => setShowRegister(true);
  const openSchemesModal = () => setShowSchemes(true); // open schemes modal
  const closeSchemesModal = () => setShowSchemes(false);

 
  const handleLogout = async () => {
  try {
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/", { replace: true }); // replace so back button won’t re-enter
  } catch (error) {
    console.error("Error logging out:", error);
  }
};


  const isDashboard =
    location.pathname === "/admin-dashboard" ||
    location.pathname === "/user-dashboard" ||
    location.pathname === "/staff-dashboard";

  const handleMenuLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className={showLogin ? "headerWrapper blurred" : "headerWrapper"}>
        <div className="header">
          <div className="container">
            <div className="row">
              <div className="logoWrapper">
                {/* <Link to={""} className="imglink"> */}
                  <img src={Logo} alt="Logo" />
                {/* </Link> */}
              </div>
              <div className="  part2">
                {isDashboard ? (
                  <Button className="logout" onClick={handleLogout}>Logout</Button>
                ) : (
                  <>
                    <Button className="login" component={Link} to="/">Home</Button>
                    <Button className="login" onClick={openSchemesModal}>Schemes</Button>
                    <Button className="login" onClick={openLoginModal}>Login</Button>
                    <Button className="login" onClick={openRegisterModal}>Register</Button>
                    <button
                      className="menu-btn"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      {mobileMenuOpen ? <MdOutlineClose /> : <IoIosMenu />}
                    </button>
                  </>
                )}
              </div>
              {mobileMenuOpen && (
                <div className="menu-btn-box">
                  <button className="m-btn" component={Link} to="/">Home</button>
                  <button className="m-btn" onClick={() => {
                    openSchemesModal();
                    handleMenuLinkClick();
                  }}>
                    Schemes
                  </button>
                  <button className="m-btn" onClick={() => {
                     openLoginModal();
                    handleMenuLinkClick();
                  }}>
                    Login
                  </button>
                  <button className="m-btn" onClick={() => {
                     openRegisterModal();
                    handleMenuLinkClick();
                  }}>
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        showRegisterModal={() => setShowRegister(true)}
      />

      <RegisterModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
        showLoginModal={() => setShowLogin(true)}
      />

      <SchemesModal
        open={showSchemes}
        onClose={closeSchemesModal}
        openLoginModal={() => {
          setShowLogin(true); // open LoginModal
          closeSchemesModal(); // close SchemesModal
        }}
      />
    </>
  );
}

export default Header;

