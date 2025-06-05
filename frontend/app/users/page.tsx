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
  const session = cookieStore.get("session");
  console.log("This is session from users route", session);
  const response = await fetch(`${server}/api/v1/user`, {
    credentials: "include",
    headers: {
      Cookie: `session=${session?.value}`,
    },
  });
  const data: AllUserResponse = await response.json();
  const users: User[] = data.allUsers;
  console.log(data);
  await new Promise((res) => setTimeout(res, 1000));
  return (
    <div className="flex flex-col gap-1 items-center  justify-center h-[80dvh]">
      {users.length ? (
        users.map((user) => (
          <Usercard key={user.id} id={user.id} name={user.name} />
        ))
      ) : (
        <div>No new users are here </div>
      )}
    </div>
  );
}
