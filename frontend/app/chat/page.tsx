"use client"
import { useEffect, useState, useRef } from "react";
import { socket } from "../../lib/socket";
import { encryptMessage, decryptMessage, importSecretKey } from "../../lib/crypto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ChatMessage {
  text: string;
  type: 'incoming' | 'outgoing';
}

export default function Chat() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  // Avoid repeated handler registrations by using refs:
  const keyBufferRef = useRef<string | null>(null);
  useEffect(() => {
    const roomId = localStorage.getItem('roomId');
    const keyBuffer = localStorage.getItem('keyBuffer');
    const saved = localStorage.getItem('chatMessage');
    if(saved){
      try {
        setMessages(JSON.parse(saved));
      } catch(e) {
        setMessages([]);
      }
    }
    keyBufferRef.current = keyBuffer;
    if (roomId) {
      socket.emit('join-room', { roomId, key: keyBuffer });
    }
    if (!roomId || !keyBuffer) {
      router.push('/dashboard');
      return;
    }
    setLoading(false); 

    importSecretKey(keyBuffer)
      .then(key => setEncryptionKey(key))
      .catch(error => console.error('Error importing key:', error));

    const handleMessage = async (encryptedMsg: any) => {
      if (!keyBufferRef.current) return;
      try {
        const key = await importSecretKey(keyBufferRef.current);
        const decryptedMsg = await decryptMessage(encryptedMsg, key);
        setMessages(prev => [...prev, { text: decryptedMsg, type: 'incoming' }]);
      } catch (error) {
        console.error("Decryption error:", error);
      }
    };

    socket.on('message', handleMessage);

    socket.on('user joined', (text: string) => {
      console.log(text)
      // option: setMessages(prev => [...prev, { text, type: 'incoming' }]);
    });

    // Key sharing - only update localStorage, not state directly!
    socket.on('share-key', (sharedKeyBuffer: string) => {
      // Save for future reloads
      localStorage.setItem('keyBuffer', sharedKeyBuffer);
      keyBufferRef.current = sharedKeyBuffer;
      importSecretKey(sharedKeyBuffer)
        .then(key => setEncryptionKey(key))
        .catch(error => console.error('Error importing shared key:', error));
    });

    return () => {
      socket.off('message', handleMessage);
      socket.off('user joined');
      socket.off('share-key');
    };
  }, []);

  useEffect(() => {
    const roomId = localStorage.getItem('roomId');
    if(!roomId) return
    localStorage.setItem('chatMessage', JSON.stringify(messages));
  }, [messages]);
  const sendMessage = async () => {
    const roomId = localStorage.getItem("roomId");
    const keyBuffer = localStorage.getItem("keyBuffer");
    if (!message || !encryptionKey || !roomId || !keyBuffer) return;

    try {
      const encryptedMsg = await encryptMessage(message, encryptionKey);
      socket.emit("message", {
        roomId: roomId,
        message: encryptedMsg,
      });
      setMessages(prev => [...prev, { text: message, type: 'outgoing' }]);
      setMessage('');
    } catch (error) {
      console.error('Encryption error:', error);
    }
  };

  if (loading) {
    return null;
  }
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <Card className="w-[50%] p-5">
        <div className="messages-container h-[400px] overflow-y-auto mb-4 p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 max-w-[70%] ${
                msg.type === 'incoming' ? 'ml-0' : 'ml-auto'
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.type === 'incoming'
                    ? 'bg-gray-200 text-gray-800 rounded-tl-none'
                    : 'bg-blue-500 text-white rounded-tr-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="input-container flex gap-2 p-4 border-t">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
          <Button onClick={()=>{
            localStorage.removeItem('roomId');
            localStorage.removeItem('keyBuffer');
            localStorage.removeItem('chatMessage');
            router.push("/dashboard")
          }}>Exit Room</Button>

        </div>
      </Card>
    </div>
  );
}