"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "../userContext";
import MyLottieLogin from "@/components/MyLottieLogin";
import { setCookie } from "@/lib/cookieFunction";
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const { setCurrentUserName } = useUser();
  const router = useRouter();
  const handleSubmit = async function (e: React.SyntheticEvent) {
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
    if (data) {
      localStorage.setItem("currUsername", data.name);
      localStorage.setItem("currUserId", data.id);
      setCookie("token", data?.token);
      setCurrentUserName(data.name);
    }
    setEmail("");
    setPassword("");
    if (response.ok) router.push("/dashboard");
    else setErrMessage("No user exists with this email!");
  };
  return (
    <div className="flex flex-col justify-center items-center h-[80vh] md:flex-row p-12">
      <MyLottieLogin />
      <Card className="w-[50%] p-5 min-w-[200px]">
        <CardTitle>Please Login</CardTitle>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                minLength={8}
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
