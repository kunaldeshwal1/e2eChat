"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import MyLottieLogin from "@/components/MyLottieLogin";
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center items-center h-[80vh] md:flex-row p-12">
      <MyLottieLogin />

      <Card className="w-[50%] p-5 min-w-[200px]">
        <CardTitle>Please Register yourself</CardTitle>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const currEmail = email;
            const currPassword = password;
            const currName = name;
            const response = await fetch(`${serverUrl}/api/v1/user/register`, {
              method: "POST",
              body: JSON.stringify({
                email: currEmail,
                name: currName,
                password: currPassword,
              }),
              headers: {
                "Content-type": "application/json",
              },
            });
            setEmail("");
            setPassword("");
            setName("");
            if (response.ok) router.push("/login");
            else alert("Not registered");
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                minLength={5}
                onChange={(e) => setName(e.target.value)}
                required
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
                required
              />
            </div>
            <Button type="submit">Sign up</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
