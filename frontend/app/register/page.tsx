"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
const serverUrl = process.env.BACKEND_URL;
export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <Card className="w-[50%] p-5">
        <CardTitle>Please Register yourself</CardTitle>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const currEmail = email;
            const currPassword = password;
            const currName = name;
            const response = await fetch(
              "http://localhost:4000/api/v1/user/register",
              {
                method: "POST",
                body: JSON.stringify({
                  email: currEmail,
                  name: currName,
                  password: currPassword,
                }),
                headers: {
                  "Content-type": "application/json",
                },
              }
            );
            setEmail("");
            setPassword("");
            setName("");
            if (response.ok) router.push("/login");
            else alert("Not registered");
          }}
        >
          <Label htmlFor="name">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Label htmlFor="name">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Sign up</Button>
        </form>
      </Card>
    </div>
  );
}
