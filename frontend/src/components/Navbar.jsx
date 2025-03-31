import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { logout } from "../services/auth";
import styles from "./Auth/Auth.module.css";

const Navbar = () => {
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.navBrand}>
                   Codie
                </Link>
                <div className={styles.navLinks}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/problems" className={styles.navLink}>
                                Problems
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={styles.navButton}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>
                                Login
                            </Link>
                            <Link to="/signup" className={styles.navLink}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
