import { useState, useEffect, useRef } from 'react';

const useMediaStream = () => {
    const [stream, setStream] = useState(null);
    const isStream = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || isStream.current) return;

        isStream.current = true;

        (async function initStream() {
            try {
                const mediaStream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    return { stream };
};

export default useMediaStream;
