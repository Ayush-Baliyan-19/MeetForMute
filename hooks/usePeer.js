const { useEffect, useState, useRef } = require("react");
import { useSocket } from "@/context/socket";
import { usePathname } from "next/navigation";
const usePeer = () => {
    const { socket, userName } = useSocket();
    const pathName = usePathname()
    const roomId = pathName?.slice(1, pathName.length);
    const [peer, setPeer] = useState(null);
    const [myId, setId] = useState('');
    const isPeerSet = useRef(false);
    useEffect(() => {
        import("peerjs").then(({ default: Peer }) => {
            if (isPeerSet.current || !roomId || !socket) return;
            isPeerSet.current = true;
            const newPeer = new Peer([userName], { secure: true });
            setPeer(newPeer);

            newPeer.on("open", (id) => {
                setId(userName);
                socket?.emit('join-room', roomId, userName)
            });
        });

    }, [roomId, socket]);
    return {
        peer,
        myId
    }
}

export default usePeer;