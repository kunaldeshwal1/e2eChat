"use client";
import { useEffect, useState, useRef, useCallback } from "react";
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

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

interface ChatMessage {
  text: string;
  type: "incoming" | "outgoing";
  id: string | number;
}

export default function Privatechat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currUserId = useRef<string | null>(null);
  const roomId = useRef<string | null>(null);
  const shownMessageIds = useRef<Set<string | number>>(new Set());

  const fetchAndDecryptMessages = useCallback(
    async (keyBuffer: string, importedKey: CryptoKey) => {
      setLoading(true);
      roomId.current = localStorage.getItem("privateRoomId");
      currUserId.current = localStorage.getItem("currUserId");

      try {
        const token = getCookie("token");
        const response = await fetch(
          `${serverUrl}/api/v1/message/private_chat?roomId=${roomId.current}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer=${token}`,
            },
          }
        );
        const data = await response.json();
        setMessages([]);
        shownMessageIds.current.clear();
        for (const msg of data) {
          shownMessageIds.current.add(msg.id);
          const messageStr = JSON.stringify(msg.content);
          try {
            const decryptedMsg = await decryptMessage(messageStr, importedKey);
            setMessages((prev) => [
              ...prev,
              {
                text: decryptedMsg,
                type:
                  msg.senderId === currUserId.current ? "outgoing" : "incoming",
                id: msg.id,
              },
            ]);
          } catch (err) {
            console.error("Decryption error (history):", err);
          }
        }
      } catch (e) {
        console.error("Fetch/decrypt error:", e);
      }
      setLoading(false);
    },
    []
  );

  // Scroll to last message when messages update
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    roomId.current = localStorage.getItem("privateRoomId");
    currUserId.current = localStorage.getItem("currUserId");
    const keyBuffer = localStorage.getItem("keyBuffer");

    if (!roomId.current || !keyBuffer) {
      router.push("/mycontacts");
      return;
    }
    importSecretKey(keyBuffer)
      .then((importedKey) => {
        setEncryptionKey(importedKey);
        fetchAndDecryptMessages(keyBuffer, importedKey);
      })
      .catch((error) => {
        console.error("Error importing key:", error);
        router.push("/mycontacts");
      });

    socket.emit("join-room", { roomId: roomId.current, key: keyBuffer });

    // Handler for new socket messages
    const handleMessage = async (messageObj: any) => {
      const msgId = messageObj.id;
      if (shownMessageIds.current.has(msgId)) return;
      if (!encryptionKey) {
        console.warn("Key not ready, can't decrypt socket message");
        return;
      }
      shownMessageIds.current.add(msgId);
      try {
        const messageStr = JSON.stringify(messageObj.content);
        const decryptedMsg = await decryptMessage(messageStr, encryptionKey);
        setMessages((prev) => [
          ...prev,
          {
            text: decryptedMsg,
            type:
              messageObj.senderId === currUserId.current
                ? "outgoing"
                : "incoming",
            id: msgId,
          },
        ]);
      } catch (error) {
        console.error("Decryption error (socket):", error);
      }
    };

    socket.on("privateMessage", handleMessage);

    socket.on("share-key", (sharedKeyBuffer: string) => {
      localStorage.setItem("keyBuffer", sharedKeyBuffer);
      importSecretKey(sharedKeyBuffer)
        .then((newKey) => {
          setEncryptionKey(newKey);
          fetchAndDecryptMessages(sharedKeyBuffer, newKey);
        })
        .catch((err) => {
          console.error("Failed to import shared key:", err);
        });
    });

    return () => {
      socket.off("privateMessage", handleMessage);
      socket.off("share-key");
    };
  }, [fetchAndDecryptMessages, encryptionKey, router]);

  const sendMessage = async () => {
    if (!message || !encryptionKey || !roomId.current) return;
    try {
      const encryptedMsg = await encryptMessage(message, encryptionKey);
      await fetch(`${serverUrl}/api/v1/message/private_chat`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          roomId: roomId.current,
          encryptedContent: encryptedMsg,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer=${getCookie("token")}`,
        },
      });
      setMessage("");
    } catch (error) {
      console.error("Encryption/send error:", error);
    }
  };

  const exitRoom = () => {
    const room = localStorage.getItem("privateRoomId");
    localStorage.removeItem("privateRoomId");
    localStorage.removeItem("keyBuffer");
    socket.emit("leavePrivateChat", { roomId: room });
    router.push("/mycontacts");
  };

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h1 className="mt-4 p-4 bg-gray-900 text-white rounded-sm">
        Private Chat End to End Encrypted!
      </h1>
      <Card className="w-[50%] p-5 bg-gray-100">
        <div className="messages-container h-[400px] overflow-y-auto mb-4 p-4">
          {loading && (
            <div className="flex justify-center">
              Please wait, your conversation is loading...
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="flex justify-center font-extrabold">
              Start Your Conversation
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
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
            required
          />
          <Button onClick={sendMessage}>Send</Button>
          <Button onClick={exitRoom}>Exit Room</Button>
        </div>
      </Card>
    </div>
  );
}
