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
import { getCookie } from "@/lib/utils";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type GroupcardProps = {
  id: string;
  name: string;
  type: string;
  createdById: string;
};

export default function Groupcard({
  id,
  name,
  type,
  createdById,
}: GroupcardProps) {
  const router = useRouter();
  const [currUserId, setCurrUserId] = useState<string | null>("");
  useEffect(() => {
    setCurrUserId(localStorage.getItem("currUserId"));
  }, []);
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!id) return;
    try {
      const key = await generateKey();
      const exportKey = await exportCryptoKey(key);
      localStorage.setItem("roomId", id);
      localStorage.setItem("keyBuffer", exportKey);
      router.push("/chat");
    } catch (error) {
      console.error("Error generating key:", error);
    }
  };
  const handleDelete = async () => {
    await fetch(`${server}/api/v1/room/public/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer=${getCookie("token")}`,
        "Content-Type": "application/json",
      },
    });
    router.refresh();
  };
  return (
    <Card className="w-[350px] ">
      <CardHeader className="flex">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle>
          <CardDescription>Group Type: {type}</CardDescription>
          <CardDescription>Group Name: {name}</CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Group Chat</Button>
        {currUserId === createdById ? (
          <Button onClick={handleDelete}>Delete</Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
