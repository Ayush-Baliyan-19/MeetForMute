import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const createAndJoinRoom = () => {
    const roomid = uuidv4();
    router.push(`/${roomid}`);
  }

  const joinRoom = () => {
    if(!roomId) return;
    router.push(`/${roomId}`);
  }
  return (
    <div className="flex justify-center items-center py-10">
      <div className="flex justify-center items-center flex-col gap-5 w-1/3 border border-white p-10 rounded-md">
        <h1 className="text-4xl font-bold font-poppins">Meet for Mute</h1>
        <div className="join-room w-full flex justify-center items-center gap-3">
          <input type="text" placeholder="Enter Room Id" className="input w-1/2 text-center" value={roomId} onChange={(e)=>{
            setRoomId(e?.target?.value);
          }}/>
          <button className="btn w-1/2 bg-green-300 text-black font-bold" onClick={joinRoom}>Join room</button>
        </div>
        <div className="divider">OR</div>
        <div className="create-room w-full">
          <button className="btn w-full bg-green-300 text-black font-bold" onClick={createAndJoinRoom}>Create a New Room</button>
        </div>
      </div>
    </div>
  );
}
