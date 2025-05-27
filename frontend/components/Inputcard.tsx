"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateKey, exportCryptoKey } from "@/lib/crypto";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type Props = {
  session: string | undefined;
};
export default function Inputcard({ session }: Props) {
  const [roomName, setRoomName] = useState("");
  const createRoom = async () => {
    fetch(`${server}/api/v1/room/public`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        name: roomName,
      }),
      headers: {
        Cookie: `session=${session}`,
        "Content-type": "application/json",
      },
    });
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create a new chat room</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="groupname">Group name</Label>
              <Input
                id="groupname"
                placeholder="Enter group name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5"></div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={createRoom}>Create</Button>
      </CardFooter>
    </Card>
  );
}
