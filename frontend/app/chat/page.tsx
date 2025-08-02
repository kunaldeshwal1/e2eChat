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

// Remove dotenv from frontend! Use Next.js env variable directly.
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

interface ChatMessage {
  text: string;
  type: "incoming" | "outgoing";
  name: string;
  id?: string;
}

export default function Chat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currUserId = useRef<string | null>(null);
  const roomId = useRef<string | null>(null);

  // Scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch and decrypt all messages, only after we have the key
  const fetchAndDecryptMessages = useCallback(
    async (keyBuffer: string, importedKey: CryptoKey) => {
      setLoading(true);
      try {
        const room = roomId.current;
        const token = getCookie("token");
        const response = await fetch(
          `${serverUrl}/api/v1/message/group_chat?roomId=${room}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer=${token}`,
            },
          }
        );
        const data = await response.json();
        // Clear old messages before re-populating
        setMessages([]);
        // Decrypt each message and append
        for (let msg of data) {
          const messageStr = JSON.stringify(msg.content);
          try {
            const decryptedMsg = await decryptMessage(messageStr, importedKey);
            setMessages((prev) => [
              ...prev,
              {
                text: decryptedMsg,
                type:
                  msg.senderId === currUserId.current ? "outgoing" : "incoming",
                name: msg.sender.name,
                id: msg._id || undefined,
              },
            ]);
          } catch (decryptErr) {
            console.error("Error decrypting a message:", decryptErr);
          }
        }
      } catch (e) {
        console.error("Fetch/decrypt error:", e);
      }
      setLoading(false);
    },
    []
  );

  // Main effect: Set up room, key, socket listeners, initial fetch
  useEffect(() => {
    currUserId.current = localStorage.getItem("currUserId");
    roomId.current = localStorage.getItem("roomId");
    const keyBuffer = localStorage.getItem("keyBuffer");

    // Sanity: if roomId or keyBuffer is missing, redirect
    if (!roomId.current || !keyBuffer) {
      router.push("/");
      return;
    }

    // Set up, import the key, THEN fetch and decrypt messages
    importSecretKey(keyBuffer)
      .then((importedKey) => {
        setEncryptionKey(importedKey);
        fetchAndDecryptMessages(keyBuffer, importedKey);
      })
      .catch((error) => {
        console.error("Failed to import key:", error);
        // If we can't get the key, redirect to home
        router.push("/");
      });

    // Always join the socket room
    socket.emit("join-room", { roomId: roomId.current, key: keyBuffer });

    // Handler for receiving new group messages via socket
    const handleMessage = async (messageObj: any) => {
      if (!encryptionKey) {
        // Race condition: key missing
        console.warn(
          "Encryption key is not ready yet, can't decrypt incoming message"
        );
        return;
      }
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
            name: messageObj.sender?.name || "",
            id: messageObj.id,
          },
        ]);
      } catch (error) {
        console.error("Decryption error (socket message):", error);
      }
    };

    socket.on("groupMessage", handleMessage);

    socket.on("share-key", (sharedKeyBuffer: string) => {
      // New group key received (when a new member joins, or key rotates)
      localStorage.setItem("keyBuffer", sharedKeyBuffer);
      importSecretKey(sharedKeyBuffer)
        .then((newKey) => {
          setEncryptionKey(newKey);
          // Re-fetch and re-decrypt all messages with new key!
          fetchAndDecryptMessages(sharedKeyBuffer, newKey);
        })
        .catch((err) => {
          console.error("Failed to import shared key:", err);
        });
    });

    // Clean up listeners
    return () => {
      socket.off("groupMessage", handleMessage);
      socket.off("share-key");
    };
  }, [fetchAndDecryptMessages, encryptionKey, router]);

  // Persist messages to localStorage for session caching (optional)
  useEffect(() => {
    if (roomId.current && messages.length > 0) {
      localStorage.setItem("chatMessage", JSON.stringify(messages));
    }
  }, [messages]);

  // --- Sending a message ---
  const sendMessage = async () => {
    const keyBuffer = localStorage.getItem("keyBuffer");
    if (!message || !encryptionKey || !roomId.current || !keyBuffer) return;

    try {
      const encryptedMsg = await encryptMessage(message, encryptionKey);

      await fetch(`${serverUrl}/api/v1/message/group_chat`, {
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

  // --- Exiting the room ---
  const exitRoom = () => {
    const room = localStorage.getItem("roomId");
    localStorage.removeItem("roomId");
    localStorage.removeItem("keyBuffer");
    localStorage.removeItem("chatMessage");
    socket.emit("leaveGroupChat", { roomId: room });
    router.push("/dashboard");
  };

  // --- Render ---
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
          {!loading && messages.length ? (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
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
                  {msg.text}
                  <div className="text-gray-800 text-xs flex items-end">
                    {msg.name}
                  </div>
                </div>
              </div>
            ))
          ) : !loading ? (
            <div className="flex justify-center">Start Your Conversation</div>
          ) : null}
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
