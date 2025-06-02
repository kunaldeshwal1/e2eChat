"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

type UserContextType = {
  currUserName: string | null;
  setCurrUserName: (name: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currUserName, setCurrUserName] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("currUsername") : null
  );

  useEffect(() => {
    const handler = () => setCurrUserName(localStorage.getItem("currUsername"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <UserContext.Provider value={{ currUserName, setCurrUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
