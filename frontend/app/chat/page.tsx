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
import { getCookie } from "@/lib/utils";
import dotenv from "dotenv";
dotenv.config();
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

interface ChatMessage {
  text: string;
  type: "incoming" | "outgoing";
  name: string;
}

export default function Chat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const keyBufferRef = useRef<string | null>(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    const currUserId = localStorage.getItem("currUserId");
    const roomId = localStorage.getItem("roomId");
    const keyBuffer = localStorage.getItem("keyBuffer");
    if (roomId && keyBuffer) {
      socket.emit("join-room", { roomId, key: keyBuffer });
    }
    keyBufferRef.current = keyBuffer;
    async function getMessages() {
      await new Promise((res) => setTimeout(res, 1000));

      if (!keyBufferRef.current) return;
      try {
        const key = await importSecretKey(keyBufferRef.current);
        const token = getCookie("token");
        const response = await fetch(
          `${serverUrl}/api/v1/message/group_chat?roomId=${roomId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer=${token}`,
            },
          }
        );
        const data = await response.json();
        data.map(async (msg: any) => {
          const message = JSON.stringify(msg.content);
          const decryptedMsg = await decryptMessage(message, key);
          setMessages((prev) => [
            ...prev,
            {
              text: decryptedMsg,
              type: msg.senderId === currUserId ? "outgoing" : "incoming",
              name: msg.sender.name,
            },
          ]);
        });
        setLoading(false);
      } catch (e) {
        console.error("some error occured", e);
      }
    }

    getMessages();
    if (!roomId || !keyBuffer) {
      router.push("/");
      return;
    }

    importSecretKey(keyBuffer)
      .then((key) => setEncryptionKey(key))
      .catch((error) => console.error("Error importing key:", error));
    const handleMessage = async (messageObj: any) => {
      const msgId = messageObj.id;
      const message = JSON.stringify(messageObj.content);
      if (!keyBufferRef.current) return;
      try {
        const key = await importSecretKey(keyBufferRef.current);
        const decryptedMsg = await decryptMessage(message, key);
        setMessages((prev) => [
          ...prev,
          {
            text: decryptedMsg,
            type: messageObj.senderId == currUserId ? "outgoing" : "incoming",
            name: messageObj.senderId.name,
            id: msgId,
          },
        ]);
      } catch (error) {
        console.error("Decryption error:", error);
      }
    };

    socket.on("groupMessage", handleMessage);

    socket.on("user joined", (text: string) => {});

    socket.on("share-key", (sharedKeyBuffer: string) => {
      localStorage.setItem("keyBuffer", sharedKeyBuffer);
      keyBufferRef.current = sharedKeyBuffer;
      importSecretKey(sharedKeyBuffer)
        .then((key) => setEncryptionKey(key))
        .catch((error) => console.error("Error importing shared key:", error));
      window.location.reload();
    });

    router.refresh();
    return () => {
      socket.off("groupMessage", handleMessage);
      socket.off("user joined");
      socket.off("share-key");
    };
  }, []);

  useEffect(() => {
    const roomId = localStorage.getItem("roomId");
    if (!roomId) return;
    localStorage.setItem("chatMessage", JSON.stringify(messages));
  }, [messages]);
  const sendMessage = async () => {
    const roomId = localStorage.getItem("roomId");
    const keyBuffer = localStorage.getItem("keyBuffer");
    if (!message || !encryptionKey || !roomId || !keyBuffer) return;

    try {
      const encryptedMsg = await encryptMessage(message, encryptionKey);

      await fetch(`${serverUrl}/api/v1/message/group_chat`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          roomId: roomId,
          encryptedContent: encryptedMsg,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer=${getCookie("token")}`,
        },
      });
      setMessage("");
    } catch (error) {
      console.error("Encryption error:", error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1 className="mt-4 p-4 bg-gray-900 text-white rounded-sm">
        Group Chat End to End Encrypted!
      </h1>
      <Card className="w-[50%] p-5 bg-gray-100">
        <div className="messages-container h-[400px] overflow-y-auto mb-4 p-4">
          {loading && (
            <div className="flex justify-center">
              Please wait your conversation is loading...
            </div>
          )}
          {messages.length ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 max-w-[70%] ${
                  msg.type === "incoming" ? "ml-0" : "ml-auto"
                }`}
              >
                <div
                  className={`flex justify-between p-3 rounded-lg ${
                    msg.type === "incoming"
                      ? "bg-gray-200 text-gray-800 rounded-tl-none"
                      : "bg-blue-500 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text},
                  <div className="text-gray-800 text-xs flex items-end">
                    {msg.name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center">Start Your Conversation</div>
          )}
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
            required
          />
          <Button onClick={sendMessage}>Send</Button>
          <Button
            onClick={() => {
              const roomId = localStorage.getItem("roomId");
              localStorage.removeItem("roomId");
              localStorage.removeItem("keyBuffer");
              localStorage.removeItem("chatMessage");
              socket.emit("leaveGroupChat", {
                roomId,
              });
              router.push("/dashboard");
            }}
          >
            Exit Room
          </Button>
        </div>
      </Card>
    </div>
  );
}
