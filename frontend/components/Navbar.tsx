"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/app/userContext";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import dotenv from "dotenv";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/lib/cookieFunction";

dotenv.config();
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
export default function Navbar() {
  const { currentUserName, setCurrentUserName } = useUser();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (currentUserName === undefined) return null;
  return (
    <div className="flex justify-between h-24 bg-gray-900 text-[#fff]">
      <div className="flex items-center pl-2">
        <img src="/favicon.png" className="h-10" alt="" />
      </div>
      <nav className=" flex justify-end items-center p-5 ">
        <button
          className="md:hidden absolute right-0 flex flex-col justify-center items-center w-10 h-10"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block w-7 h-1 bg-white mb-1.5 rounded transition-all ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-7 h-1 bg-white mb-1.5 rounded transition-all ${
              open ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-7 h-1 bg-white rounded transition-all ${
              open ? "-rotate-45 -translate-y-3" : ""
            }`}
          ></span>
        </button>
        <ul
          className={`md:static md:flex md:gap-12 ${
            open
              ? "flex flex-col absolute rounded-b-sm left-0 bg-gray-500"
              : "hidden"
          } transition-all`}
          onClick={() => setOpen(false)}
        >
          {currentUserName ? (
            <li className="flex gap-8 items-center">
              <Link
                href="/dashboard"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/dashboard" ? "text-gray-400" : ""
                }`}
              >
                Groups
              </Link>

              <Link
                href="/users"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/users" ? "text-gray-400" : ""
                }`}
              >
                Users
              </Link>
              <Link
                href="/mycontacts"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/mycontacts" ? "text-gray-400" : ""
                }`}
              >
                My Contacts
              </Link>
              <Button
                className="bg-amber-500 hover:bg-amber-400"
                onClick={() => {
                  localStorage.removeItem("currUsername");
                  localStorage.removeItem("currUserId");
                  setCurrentUserName(null);
                  deleteCookie("token");
                  router.push("/login");
                }}
              >
                Logout
              </Button>
            </li>
          ) : (
            <li className="flex gap-8 items-center">
              <Link
                href="/"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/" ? "text-gray-500" : ""
                }`}
              >
                Home
              </Link>

              <Link
                href="/login"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/login" ? "text-gray-500" : ""
                }`}
              >
                Login
              </Link>

              <Link
                href="/register"
                className={`transition delay-150 duration-300 ease-in-out hover:scale-120 ${
                  pathname === "/register" ? "text-gray-500" : ""
                }`}
              >
                Sign up
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
