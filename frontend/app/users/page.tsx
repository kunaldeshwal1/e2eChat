import { cookies } from "next/headers";
import dotenv from "dotenv";
import Usercard from "@/components/Usercard";
import UserListSkeleton from "./loading";
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
  return (
    <div className="flex flex-col gap-2 items-center justify-between ">
      <h1 className="mt-2">List of All Users</h1>

      {users.length ? (
        <div className="flex flex-wrap gap-2 p-2 justify-center">
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
