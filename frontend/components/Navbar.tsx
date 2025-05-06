"use client"
import {useEffect, useState } from "react";
import Link from 'next/link'
import { usePathname } from "next/navigation";
export default function Navbar() {
  const [open,setOpen] = useState(false);
  const pathname = usePathname()
  useEffect(()=>{
    const handleResize = ()=>{
      if(window.innerWidth>=768){
        setOpen(false)
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
      <nav className="h-24 bg-gray-900 text-[#fff] flex justify-end items-center p-5 ">
        <button className="md:hidden absolute right-0 flex flex-col justify-center items-center w-10 h-10"
                onClick={()=>setOpen(!open)}
        >
          <span className={`block w-7 h-1 bg-white mb-1.5 rounded transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-7 h-1 bg-white mb-1.5 rounded transition-all ${open ? 'opacity-0' : ''}`}></span>
          <span className={`block w-7 h-1 bg-white rounded transition-all ${open ? '-rotate-45 -translate-y-3' : ''}`}></span>
        </button>
        <ul className={`md:static md:flex md:gap-12 ${open? 'flex flex-col absolute rounded-b-sm left-0 bg-gray-500':'hidden'} transition-all`} 
        onClick={() => setOpen(false)}
        >
          <li><Link href="/dashboard"  className={`${pathname === '/dashboard' ? 'text-gray-500' : ''}`}>Home</Link></li>
          <li><Link href="/chat"  className={`${pathname === '/chat' ? 'text-gray-400' : ''}`}>Chat</Link></li>
          <li><Link href="/register"  className={`${pathname === '/register' ? 'text-gray-500' : ''}`}>Sign up</Link></li>
        </ul>

      </nav>
  );
};