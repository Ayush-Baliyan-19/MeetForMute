import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/socket";
import Image from "next/image";
import { Poppins } from "next/font/google";
import MainSVG from "../components/SVGs/Home/Meet-Main.svg"
import { MdMeetingRoom } from "react-icons/md";
import { ImMakeGroup } from "react-icons/im";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
})
export default function Home() {
  const { setUserName, userName } = useSocket();
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const createAndJoinRoom = () => {
    console.log("Called create and join room")
    if (!userName) {
      toast.error('Please enter your username');
      return;
    }
    const roomid = uuidv4();
    const room = roomid.split('-')[0];
    router.push(`/1`);
  }
  const joinRoom = () => {
    // if(!roomId) return;
    router.push(`/1`);
  }
  useEffect(() => {
    if(localStorage.getItem('IsWebcamOn')==="yes") {
      console.log("Called this")
      localStorage.setItem('IsWebcamOn', false);
      window.location.reload();
    }
  },[])
  return (
    <>
      <ToastContainer />
      <div className="h-[100vh] flex">
        <div className="leftSide w-1/2 h-full bg-white">
          <div className="flex justify-center items-center h-full w-full p-20">
            <Image src={MainSVG} alt="MainSVG" placeholder="blur" blurDataURL={'../components/SVGs/Home/Meet-Main.svg'}/>
          </div>
        </div>
        <div className=" h-full w-max flex justify-center items-center">
          <div className=" bg-black w-[2px] h-[60vh] inline-block rounded-xl opacity-70"></div> 
        </div>
        <div className="rightSide w-1/2 h-full bg-white">
          <div className="flex justify-center items-center h-full w-full flex-col">
            <div className="heading flex justify-center items-center gap-5 my-10">
              <ImMakeGroup className="text-6xl text-black" />
              <h1 className="text-4xl font-bold text-black">MeetforMute</h1>
            </div>
            <div className="inputsAndButtons flex flex-col justify-center items-center gap-5 w-[60%]" >
              <div className="w-full">
                <label className="input input-bordered bg-[#F0F1F1] border-black text-black flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70 self-center"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                  <input type="text" id="userName" name="userName" autoComplete="true" className="grow placeholder:text-black placeholder:opacity-70 font-semibold" placeholder="Username"
                    value={userName} onChange={(e) => {
                      setUserName(e?.target?.value);
                    }} />
                </label>
              </div>
              <div className="join-room w-full flex justify-center items-center gap-3 ">
                <label className="input input-bordered bg-[#F0F1F1] border-black text-black flex items-center gap-2">
                  <MdMeetingRoom className="text-xl text-black opacity-70 self-center" />
                  <input type="text" id="roomId" name="roomId" placeholder="Enter Room Id" className="grow w-1/2 bg-[#F0F1F1] placeholder:text-black placeholder:opacity-70 font-semibold" value={roomId} onChange={(e) => {
                    setRoomId(e?.target?.value);
                  }} />
                </label>
                <button className="btn w-1/2 bg-green-300 text-black font-bold hover:bg-green-700" onClick={joinRoom}>Join room</button>
              </div>
              <div className="divider my-0">OR</div>
              <div className="create-room w-full">
                <button className="btn w-full bg-green-300 text-black font-bold hover:bg-green-700" onClick={createAndJoinRoom}>Create a New Room</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
