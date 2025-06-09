import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dotenv from "dotenv";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Usercard from "@/components/Usercard";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type User = {
  id: string;
  name: string;
};
type AllUserResponse = {
  allUsers: User[];
};
export default async function Users() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const response = await fetch(`${server}/api/v1/user`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer=${token?.value}`,
    },
  });
  const data: AllUserResponse = await response.json();
  const users: User[] = data.allUsers;
  await new Promise((res) => setTimeout(res, 1000));
  return (
    <div className="flex gap-1 items-center justify-between ">
      {users.length ? (
        <div className="flex flex-wrap gap-2 p-2">
          {users.map((user) => (
            <Usercard key={user.id} id={user.id} name={user.name} />
          ))}
        </div>
      ) : (
        <div>No new users are here </div>
      )}
    </div>
  );
}
