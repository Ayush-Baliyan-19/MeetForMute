const { useEffect, useState, useRef } = require("react");
import { useSocket } from "@/context/socket";
import { usePathname } from "next/navigation";
import Peer from "peerjs";
const usePeer = () => {
    const socket= useSocket();
    const pathName=usePathname()
    const roomId= pathName.slice(1,pathName.length);
    const [peer, setPeer] = useState(null);
    const [myId, setId] = useState('');
    const isPeerSet = useRef(false);
    useEffect(() => {
        if(isPeerSet.current || !roomId   || !socket) return;
        isPeerSet.current = true;
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on("open", (id) => {
            setId(id);
            socket?.emit('join-room',roomId,id)
        });

    }, [roomId, socket]);
    return {
        peer,
        myId
    }
}

export default usePeer;