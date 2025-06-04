"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "../../lib/socket";
import {
  encryptMessage,
  decryptMessage,
  importSecretKey,
} from "../../lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";
dotenv.config();
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
interface ChatMessage {
  text: string;
  type: "incoming" | "outgoing";
  id: number;
}

export default function Privatechat() {
  const tempId = Date.now();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const keyBufferRef = useRef<string | null>(null);
  const shownMessageIds = useRef(new Set());
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    const roomId = localStorage.getItem("privateRoomId");
    const keyBuffer = localStorage.getItem("keyBuffer");
    const currUserId = localStorage.getItem("currUserId");
    keyBufferRef.current = keyBuffer;
    async function getMessages() {
      await new Promise((res) => setTimeout(res, 1000));

      if (!keyBufferRef.current) return;
      try {
        const key = await importSecretKey(keyBufferRef.current);

        const response = await fetch(
          `${serverUrl}/api/v1/message/private_chat?roomId=${roomId}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        data.map(async (msg: any) => {
          if (shownMessageIds.current.has(msg.id)) return; // Already shown
          shownMessageIds.current.add(msg.id);
          const message = JSON.stringify(msg.content);
          const decryptedMsg = await decryptMessage(message, key);
          console.log(decryptedMsg);
          setMessages((prev) => [
            ...prev,
            {
              text: decryptedMsg,
              type: msg.senderId === currUserId ? "outgoing" : "incoming",
              id: msg.id,
            },
          ]);
        });
      } catch (e) {
        console.error("some error occured", e);
      }
    }
    getMessages();

    if (roomId) {
      socket.emit("join-room", { roomId, key: keyBuffer });
    }
    if (!roomId || !keyBuffer) {
      router.push("/mycontacts");
      return;
    }
    setLoading(false);

    importSecretKey(keyBuffer)
      .then((key) => setEncryptionKey(key))
      .catch((error) => console.error("Error importing key:", error));

    const handleMessage = async (encryptedMsg: any) => {
      const msgId = encryptedMsg.id; // Get the id field from your socket, or use a combo (timestamp+sender)
      if (shownMessageIds.current.has(msgId)) return; // Already shown
      shownMessageIds.current.add(msgId);
      if (!keyBufferRef.current) return;
      try {
        const key = await importSecretKey(keyBufferRef.current);
        const decryptedMsg = await decryptMessage(encryptedMsg, key);
        setMessages((prev) => [
          ...prev,
          { text: decryptedMsg, type: "incoming", id: msgId },
        ]);
      } catch (error) {
        console.error("Decryption error:", error);
      }
    };

    socket.on("groupMessage", handleMessage);

    socket.on("user joined", (text: string) => {
      console.log(text);
    });

    socket.on("share-key", (sharedKeyBuffer: string) => {
      localStorage.setItem("keyBuffer", sharedKeyBuffer);
      keyBufferRef.current = sharedKeyBuffer;
      importSecretKey(sharedKeyBuffer)
        .then((key) => setEncryptionKey(key))
        .catch((error) => console.error("Error importing shared key:", error));
    });

    return () => {
      socket.off("groupMessage", handleMessage);
      socket.off("user joined");
      socket.off("share-key");
    };
  }, []);

  useEffect(() => {
    const roomId = localStorage.getItem("privateRoomId");
    if (!roomId) return;
    localStorage.setItem("privateChatMessage", JSON.stringify(messages));
  }, [messages]);
  const sendMessage = async () => {
    const roomId = localStorage.getItem("privateRoomId");
    const keyBuffer = localStorage.getItem("keyBuffer");
    if (!message || !encryptionKey || !roomId || !keyBuffer) return;

    try {
      const encryptedMsg = await encryptMessage(message, encryptionKey);
      await fetch(`${serverUrl}/api/v1/message/private_chat`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          roomId: roomId,
          encryptedContent: encryptedMsg,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      socket.emit("groupMessage", {
        roomId: roomId,
        message: encryptedMsg,
      });
      setMessages((prev) => [
        ...prev,
        { text: message, type: "outgoing", id: tempId },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Encryption error:", error);
    }
  };

  if (loading) {
    return null;
  }
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <h1>thisis private chat</h1>
      <Card className="w-[50%] p-5">
        <div className="messages-container h-[400px] overflow-y-auto mb-4 p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 max-w-[70%] ${
                msg.type === "incoming" ? "ml-0" : "ml-auto"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.type === "incoming"
                    ? "bg-gray-200 text-gray-800 rounded-tl-none"
                    : "bg-blue-500 text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>

        <div className="input-container flex gap-2 p-4 border-t">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
          <Button
            onClick={() => {
              const roomId = localStorage.getItem("privateRoomId");
              localStorage.removeItem("privateRoomId");
              localStorage.removeItem("keyBuffer");
              localStorage.removeItem("privateChatMessage");
              socket.emit("leavePrivateChat", {
                roomId,
              });
              router.push("/mycontacts");
            }}
          >
            Exit Room
          </Button>
        </div>
      </Card>
    </div>
  );
}
