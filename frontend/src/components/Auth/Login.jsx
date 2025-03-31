import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import AuthContext from "../../context/AuthContext";
import styles from "./Auth.module.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(username, password);
            setUser(response);
            setIsAuthenticated(true);
            navigate("/problems");
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className={styles.authContainer}>
            <h2>Login</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" className={styles.submitButton}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
