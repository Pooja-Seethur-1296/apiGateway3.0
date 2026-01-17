import { createContext, useState } from "react";

// Provide default context shape
export const AuthContext = createContext({
  user: localStorage.getItem("user") || null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }) => {
  // Load user from localStorage initially
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Update user manually
  const updateUser = (data) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  // Login function
  const login = (data) => {
    const { authToken, userDetails } = data.responseObject;
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userDetails));
    setUser(userDetails);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
