import { useState, useEffect, useRef } from 'react';

const useMediaStream = () => {
    const [stream, setStream] = useState(null);
    const isStream = useRef(false);
    useEffect(() => {
        if (isStream.current) return;
        isStream.current = true;
        (async function initStream() {
            try {
                const stream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(stream);
            } catch (error) {
                console.error(error);
            }
        })();
        return () => {
            if (stream) {
                console.log("Getting a stream")
                stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [stream]);
    return { stream };
};

export default useMediaStream;