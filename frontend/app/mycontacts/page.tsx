import { cookies } from "next/headers";
import Usercard from "@/components/Usercard";
import dotenv from "dotenv";
import ContactCard from "@/components/contactcard";
import Contactcard from "@/components/contactcard";
dotenv.config();
const server = process.env.NEXT_PUBLIC_SERVER_URL;
type Room = {
  id: string;
  name: string;
};
type AllRoomResponse = {
  myRooms: Room[];
};
export default async function MyContact() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const response = await fetch(`${server}/api/v1/room/contacts`, {
    headers: {
      Cookie: `session=${session?.value}`,
    },
  });
  const data: AllRoomResponse = await response.json();
  const rooms: Room[] = data.myRooms;
  console.log(data);
  await new Promise((res) => setTimeout(res, 1000));
  return (
    <div className="flex flex-col gap-1 items-center  justify-center h-[80dvh]">
      {rooms.map((room, i) => (
        <ContactCard key={i} id={room.id} name={room.name} />
      ))}
    </div>
  );
}
