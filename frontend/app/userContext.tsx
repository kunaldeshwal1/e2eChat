"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

type UserContextType = {
  currentUserName: string | null;
  setCurrentUserName: (name: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserName(localStorage.getItem("currUsername"));
    const handler = () =>
      setCurrentUserName(localStorage.getItem("currUsername"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  useEffect(() => {
    const handler = () =>
      setCurrentUserName(localStorage.getItem("currUsername"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <UserContext.Provider value={{ currentUserName, setCurrentUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
