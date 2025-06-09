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
import { generateKey, exportCryptoKey } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
type contactCardProps = {
  id: string;
  name: string;
};
export default function ContactCard({ id, name }: contactCardProps) {
  const router = useRouter();
  const [currUserName, setCurrUserName] = useState<string | null>(null);

  useEffect(() => {
    setCurrUserName(localStorage.getItem("currUsername"));
  }, []);

  if (!currUserName) return <div>loading...</div>; // skip until loaded

  const groupName = name.split("_");
  name = groupName[0] === currUserName ? groupName[1] : groupName[0];
  const handleClick = async function (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const key = await generateKey();
      const exportKey = await exportCryptoKey(key);
      localStorage.setItem("privateRoomId", id);
      localStorage.setItem("keyBuffer", exportKey);
      router.push("/privatechat");
    } catch (error) {
      console.error("Error generating key:", error);
    }
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
          <CardDescription>Start chat with the person.</CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Start Chat</Button>
      </CardFooter>
    </Card>
  );
}
