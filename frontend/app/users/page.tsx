import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dotenv from "dotenv";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type User = {
  id: number;
  name: string;
};
type AllUserResponse = {
  allUsers: User[];
};
export default async function Users() {
  const response = await fetch(`${server}/api/v1/user/allusers`);
  const data: AllUserResponse = await response.json();
  const users: User[] = data.allUsers;
  console.log(users);
  return (
    <div className="flex flex-col gap-1 items-center justify-center h-[80dvh]">
      {users.map((user) => (
        <li
          key={user.id}
          className="bg-gray-300 w-fit p-2 list-none rounded-xs"
        >
          {user.name}
        </li>
      ))}
    </div>
  );
}
