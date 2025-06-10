import { cookies } from "next/headers";
import dotenv from "dotenv";
import Groupcard from "@/components/Groupcard";
import Inputcard from "@/components/Inputcard";
const server = process.env.NEXT_PUBLIC_SERVER_URL;
dotenv.config();
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <Inputcard session={token?.value} />
      </div>
      <div className="">
        <h1 className="flex justify-center">List of Available Groups</h1>
        {groups.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 p-2">
            {groups.map((group) => (
              <Groupcard
                key={group.id}
                id={group.id}
                name={group.name}
                type={group.type}
                createdById={group.createdById}
              />
            ))}
          </div>
        ) : (
          <div>No groups available</div>
        )}
      </div>
    </div>
  );
}
