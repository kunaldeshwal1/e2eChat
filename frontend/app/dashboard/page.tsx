import { useState } from "react";
import { socket } from "@/lib/socket";
import { generateKey, exportCryptoKey } from "@/lib/crypto";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import dotenv from "dotenv";
dotenv.config();
import Groupcard from "@/components/Groupcard";
import Inputcard from "@/components/Inputcard";
const server = process.env.NEXT_PUBLIC_SERVER_URL;
export type Group = {
  id: string;
  name: string;
  type: string;
};
type AllGroupResponse = {
  allGroups: Group[];
};
export default async function Dashboard() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const response = await fetch(`${server}/api/v1/room/all`, {
    headers: {
      Cookie: `session=${session?.value}`,
    },
  });
  const data: AllGroupResponse = await response.json();
  const groups: Group[] = data.allGroups;
  return (
    <div className="flex flex-col justify-center items-center h-[80vh]">
      {groups.map((group) => (
        <Groupcard
          key={group.id}
          id={group.id}
          name={group.name}
          type={group.type}
        />
      ))}
      <div className="">
        <Inputcard session={session?.value} />
      </div>
    </div>
  );
}
