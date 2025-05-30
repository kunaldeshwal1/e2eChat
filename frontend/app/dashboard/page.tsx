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
  const response = await fetch(`${server}/api/v1/room`, {
    headers: {
      Cookie: `session=${session?.value}`,
    },
  });
  const data: AllGroupResponse = await response.json();
  const groups: Group[] = data.allGroups;
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 ">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Groupcard
              key={group.id}
              id={group.id}
              name={group.name}
              type={group.type}
            />
          ))
        ) : (
          <div>No groups available</div>
        )}
      </div>
      <div className="flex justify-center">
        <Inputcard session={session?.value} />
      </div>
    </div>
  );
}
