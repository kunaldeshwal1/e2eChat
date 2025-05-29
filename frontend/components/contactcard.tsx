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
import { generateKey, exportCryptoKey } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
type contactCardProps = {
  id: string;
  name: string;
};
export default function ContactCard({ id, name }: contactCardProps) {
  const router = useRouter();
  const handleClick = async function (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const key = await generateKey();
      const exportKey = await exportCryptoKey(key);
      localStorage.setItem("privateRoomId", id);
      localStorage.setItem("keyBuffer", exportKey);
      socket.emit("join-room", { id, key: exportKey });
      router.push("/privatechat");
    } catch (error) {
      console.error("Error generating key:", error);
    }
    // socket.emit("privateMessage", {});
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
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Start chat</Button>
      </CardFooter>
    </Card>
  );
}
