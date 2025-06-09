"use client";
import MyLottieHome from "@/components/MyLottieHome";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <div className="md:h-[80vh] flex flex-col gap-4 items-center text-2xl text-gray-900 font-bold p-12 md:flex-row md:gap-0">
      <div className="flex-1 flex items-end md:items-baseline">
        <MyLottieHome />
      </div>
      <div className="flex-1 justify-center flex flex-col items-center ">
        <h1 className="text-xs xl:text-2xl text-center">
          Welcome to our chat application
        </h1>
        <h2 className="text-xs xl:text-2xl text-center">
          Your chats are end-to-end encrypted
        </h2>
        <h2 className="text-xs xl:text-2xl text-center">
          Please register yourself to continue...
        </h2>
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
    </div>
  );
}
