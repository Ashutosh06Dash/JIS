import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode token to get user info
        const decoded = jwtDecode(token);
        console.log("Token decoded in AuthContext:", decoded);
        setUser({ token });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      // Decode token to get user info
      const decoded = jwtDecode(token);
      console.log("User logged in:", decoded);
      setUser({ token });
    } catch (error) {
      console.error("Error decoding token during login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
