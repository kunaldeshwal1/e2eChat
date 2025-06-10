"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;

type Props = {
  session: string | undefined;
};

export default function Inputcard({ session }: Props) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${server}/api/v1/room/public`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name: roomName,
        }),
        headers: {
          Authorization: `Bearer=${getCookie("token")}`,
          "Content-type": "application/json",
        },
      });

      if (response.ok) {
        setRoomName("");
        setOpen(false);
        router.refresh();
      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4">
          Create a New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={createRoom}>
          <DialogHeader>
            <DialogTitle>Create a New Room</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Please Enter the Name</Label>
              <Input
                id="name-1"
                name="name"
                placeholder="Input Here..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !roomName.trim()}>
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
