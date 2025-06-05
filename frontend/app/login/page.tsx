"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";
import MyLottieLogin from "@/components/MyLottieLogin";
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const { setCurrentUserName } = useUser();
  const router = useRouter();
  const handleSubmit = async function (e: any) {
    e.preventDefault();
    const currEmail = email;
    const currPassword = password;
    const response = await fetch(`${serverUrl}/api/v1/user/login`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        email: currEmail,
        password: currPassword,
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = await response.json();
    console.log("this is data", data);
    if (data) {
      localStorage.setItem("currUsername", data.name);
      localStorage.setItem("currUserId", data.id);
      setCurrentUserName(data.name);
    }
    setEmail("");
    setPassword("");
    if (response.ok) router.push("/");
    else setErrMessage("No user exists with this email!");
  };
  return (
    <div className="flex justify-center items-center h-[80vh]">
      {/* <MyLottieLogin /> */}
      <Card className="w-[50%] p-5">
        <CardTitle>Please Login</CardTitle>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="name">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="name">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit">Login</Button>
          </div>
        </form>
        {errMessage && <Label className="text-red-800">{errMessage}</Label>}
      </Card>
    </div>
  );
}
