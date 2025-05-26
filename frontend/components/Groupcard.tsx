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

type UserCardProps = {
  id: number;
  name: string;
};
export default function Groupcard() {
  const handleClick = () => {};
  return (
    <Card className="w-[350px] ">
      <CardHeader className="flex">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button onClick={handleClick}>Group Chat</Button>
      </CardFooter>
    </Card>
  );
}
