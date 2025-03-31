import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";
import { lightTheme, darkTheme } from "./styles/themes";
import GlobalStyle from "./styles/GlobalStyle";
import Navbar from "./components/Navbar";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProblemList from "./components/Problems/ProblemList";
import ProblemDetail from "./components/Problems/ProblemDetail";
import "./App.css";

const ThemedApp = () => {
    const { darkMode } = useTheme();

    return (
        <StyledThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <GlobalStyle />
            <AuthProvider>
                <Router>
                    <Navbar />
                    <div className="container">
                        <Routes>
                            <Route path="/problems" element={<ProblemList />} />
                            <Route
                                path="/problems/:id"
                                element={<ProblemDetail />}
                            />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/" element={<ProblemList />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </StyledThemeProvider>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    );
};

export default App;
