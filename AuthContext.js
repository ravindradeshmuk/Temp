import React, { createContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const broadcastChannel = new BroadcastChannel('auth_channel');

  const checkLoginStatus = useCallback(() => {
    const token = Cookies.get("token");
    const storedFirstName = Cookies.get("firstName");
    const storedLastName = Cookies.get("lastName");
    const storedEmail = Cookies.get("email");
    const storedTeam = Cookies.get("team");
    const storedRole = Cookies.get("role");
    const storedStatus = Cookies.get("status");

    if (token && storedFirstName && storedLastName && storedEmail && storedTeam && storedRole && storedStatus) {
      setIsLoggedIn(true);
      setFirstName(storedFirstName);
      setLastName(storedLastName);
      setEmail(storedEmail);
      setTeam(storedTeam);
      setRole(storedRole);
      setStatus(storedStatus);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();

    broadcastChannel.onmessage = (event) => {
      if (event.data === 'logout') {
        logout();
      } else if (event.data === 'login') {
        checkLoginStatus();
      }
    };

    return () => {
      broadcastChannel.close();
    };
  }, [checkLoginStatus]);

  const login = (token, user) => {
    if (Cookies.get("token")) {
      // If a user is already logged in, do not allow another login
      console.warn("User is already logged in on another tab.");
      return;
    }

    Cookies.set("token", token);
    Cookies.set("firstName", user.firstName);
    Cookies.set("lastName", user.lastName);
    Cookies.set("email", user.email);
    Cookies.set("team", user.team);
    Cookies.set("role", user.role);
    Cookies.set("status", user.status);
    broadcastChannel.postMessage('login'); // Notify other tabs of the login

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setTeam(user.team);
    setRole(user.role);
    setStatus(user.status);
    setIsLoggedIn(true);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("firstName");
    Cookies.remove("lastName");
    Cookies.remove("email");
    Cookies.remove("team");
    Cookies.remove("role");
    Cookies.remove("status");

    setFirstName("");
    setLastName("");
    setEmail("");
    setTeam("");
    setRole("");
    setStatus("");
    setIsLoggedIn(false);
    broadcastChannel.postMessage('logout'); // Notify other tabs of the logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, firstName, lastName, email, team, role, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
