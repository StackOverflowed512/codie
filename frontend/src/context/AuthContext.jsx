import { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, setUser, isAuthenticated, setIsAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
