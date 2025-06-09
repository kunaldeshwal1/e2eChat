import { cookies } from "next/headers";
import dotenv from "dotenv";
import ContactCard from "@/components/contactcard";
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
  const token = cookieStore.get("token");
  const response = await fetch(`${server}/api/v1/room/contacts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer=${token?.value}`,
    },
  });
  const data: AllRoomResponse = await response.json();
  const rooms: Room[] = data.myRooms;
  return (
    <div className="flex gap-1 items-center justify-center ">
      {rooms.length ? (
        <div className="flex flex-wrap gap-2 p-2 justify-center">
          {rooms.map((room, i) => (
            <ContactCard key={i} id={room.id} name={room.name} />
          ))}
        </div>
      ) : (
        <div>No users in contact list</div>
      )}
    </div>
  );
}
