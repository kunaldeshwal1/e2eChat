"use client";
import Dashboard from "./dashboard/page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <div className="h-[80vh] flex flex-col justify-center items-center text-2xl text-gray-900 font-bold">
      <h1>Welcome to our chat application </h1>
      <h2>Your chats are end-to-end encrypted</h2>
      <h2>Please register yourself to continue...</h2>
      <Button
        className="mt-8"
        type="button"
        onClick={() => {
          router.push("/register");
        }}
      >
        Register
      </Button>
    </div>
  );
}
