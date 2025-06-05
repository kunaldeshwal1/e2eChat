import { cookies } from "next/headers";
import dotenv from "dotenv";
dotenv.config();
import Groupcard from "@/components/Groupcard";
import { getCookie } from "@/lib/utils";

import Inputcard from "@/components/Inputcard";
import { session } from "@/lib/session";
const server = process.env.NEXT_PUBLIC_SERVER_URL;
export type Group = {
  id: string;
  name: string;
  type: string;
  createdById: string;
};
type AllGroupResponse = {
  allGroups: Group[];
};
export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${server}/api/v1/room`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer=${token?.value}`,
    },
  });
  const data: AllGroupResponse = await response.json();
  const groups: Group[] = data.allGroups;
  return (
    <div>
      <div className="">
        <h1>List of available groups</h1>
        {groups.length > 0 ? (
          groups.map((group) => (
            <Groupcard
              key={group.id}
              id={group.id}
              name={group.name}
              type={group.type}
              createdById={group.createdById}
            />
          ))
        ) : (
          <div>No groups available</div>
        )}
      </div>
      <div className="flex justify-center">
        <Inputcard session={token?.value} />
      </div>
    </div>
  );
}
