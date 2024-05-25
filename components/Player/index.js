import React, { useRef, useEffect } from "react";

const Player = (props) => {
    const { url, muted, playing,userName } = props;
    const videoStreamRef = useRef(null);

    useEffect(() => {
        if (url instanceof MediaStream) {
            const videoElement = videoStreamRef.current;
            if (videoElement) {
                videoElement.srcObject = url;
            }
        }
    }, [url]);

    return (
        <div className="player-wrapper w-[80%] h-[87%] relative top-5">
            <h1 className="absolute bottom-5 z-10 left-5 text-[#fff] drop-shadow-xl shadow-black" style={{textShadow:"0px 0px 5px black"}}>{userName}</h1>
            <video
                ref={videoStreamRef}
                controls={false}
                width="100%"
                height="100%"
                className="react-player object-cover w-full h-full rounded-3xl"
                muted={muted}
                autoPlay={playing}
                style={{transform: "scaleX(-1)"}}
            ></video>
        </div>
    );
};

export default Player;
