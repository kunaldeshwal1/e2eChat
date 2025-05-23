"use client";
import { useState } from "react";
import { socket } from "@/lib/socket";
import { generateKey, exportCryptoKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const joinRoom = async () => {
    if (!roomId) return;
    try {
      const key = await generateKey();
      const exportKey = await exportCryptoKey(key);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("keyBuffer", exportKey);
      socket.emit("join-room", { roomId, key: exportKey });
      router.push("/chat");
    } catch (error) {
      console.error("Error generating key:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <Card className="w-[50%] p-5">
        <CardTitle>Enter room id</CardTitle>
        <Input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <Button onClick={joinRoom}>Join room</Button>
      </Card>
    </div>
  );
}
