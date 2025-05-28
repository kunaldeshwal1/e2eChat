"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { generateKey, exportCryptoKey } from "@/lib/crypto";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type UserCardProps = {
  id: number;
  name: string;
};
export default function Usercard({ id, name }: UserCardProps) {
  // const [privateRoomId, setPrivateRoomId] = useState("");
  // useEffect(() => {
  //   const currUser = localStorage.getItem("currUsername");

  //   const userArr = [name, currUser].sort().join("_");
  //   setPrivateRoomId(userArr);
  // }, [name]);
  const currUser = localStorage.getItem("currUsername");
  const router = useRouter();
  const handleClick = async function (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!name) return;
    try {
      fetch(`${server}/api/v1/room/private`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          person_one: currUser,
          person_two: name,
          person_two_id: id,
          // privateRoom: privateRoomId,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      const key = await generateKey();
      const exportKey = await exportCryptoKey(key);
      // localStorage.setItem("privateRoomId", privateRoomId);
      // localStorage.setItem("keyBuffer", exportKey);
      // socket.emit("join-room", { privateRoomId, key: exportKey });
      router.push("/privatechat");
    } catch (error) {
      console.error("Error generating key:", error);
    }
    socket.emit("privateMessage", {});
  };
  return (
    <Card className="w-[350px] ">
      <CardHeader className="flex">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle>
          {name},{id}
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Add to chat</Button>
      </CardFooter>
    </Card>
  );
}
