"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { getCookie } from "@/lib/utils";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type UserCardProps = {
  id: string;
  name: string;
};
export default function Usercard({ id, name }: UserCardProps) {
  const router = useRouter();
  const token = getCookie("token");
  const handleClick = async function (e: React.MouseEvent<HTMLButtonElement>) {
    const currUserName = localStorage.getItem("currUsername");
    e.preventDefault();
    if (!name) return;
    try {
      await fetch(`${server}/api/v1/room/private`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          person_one: currUserName,
          person_two: name,
          person_two_id: id,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer=${token}`,
        },
      });
      router.push("/mycontacts");
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
          {name}
          <CardDescription>Add the person to your contacts.</CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Add to chat</Button>
      </CardFooter>
    </Card>
  );
}
