import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/components/Player";
import Bottom from "@/components/Bottom";
import CopySection from "@/components/CopySection";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";

import * as tmImage from "@teachablemachine/image";

import Draggable, { DraggableCore } from 'react-draggable';
const Room = () => {
  const { socket } = useSocket();
  const { roomId } = useRouter().query;
  const { peer, myId } = usePeer();
  const { stream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer);

  const [users, setUsers] = useState([]);
  const [prediction, setPrediction] = useState(null); // State to store prediction data
  const [isPrediction, setIsPrediction] = useState(true); // State to control prediction feature

  // Teachable Machine model variables
  let model, webcam, labelContainer, maxPredictions;

  maxPredictions = 2; // Replace with model's class count
  useEffect(() => {
    if (isPrediction && myId.length > 0) {
      // Model URL and other variables
      const URL = "https://teachablemachine.withgoogle.com/models/2UnELG3RZ/"; // Replace with your model URL obtained from Teachable Machine

      async function initModel() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        webcam = new tmImage.Webcam(200, 200, true); // Width, height, flip

        await webcam.setup();
        await webcam.play();
        setInterval(() => {
          loop();
        }, 1000);
      }

      if (!socket || !peer || !stream) return;
      initModel();

      return () => {
        if (webcam && webcam.active)
          webcam.stop(); // Cleanup function to stop webcam when unmounting
      };
    }
  }, [myId, isPrediction, peer, setPlayers, socket, stream]);

  // Update webcam and predict within a loop
  async function loop() {
    webcam.update();
    await predict(myId);
  }

  // Make predictions and update UI (within predict)
  async function predict(myId) {
    if (!webcam || myId.length <= 0) {
      return
    };
    const prediction = await model.predict(webcam.canvas);

    // Access the predicted class with the highest probability
    const highestPrediction = prediction.reduce(
      (max, current) => (current.probability > max.probability ? current : max),
      prediction[0]
    );

    // Update UI based on prediction (e.g., highlight user or trigger actions)
    // console.log("Predicted class:", highestPrediction.className, highestPrediction.probability);

    // Emit prediction over the socket
    socket.emit("prediction", [myId, highestPrediction.className]);
  }

  useEffect(() => {
    if (!socket || !peer || !stream || myId.length <= 0) return;
    const handleUserConnected = (newUser) => {
      console.log(`user connected in room with userId ${newUser}`);

      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call
        }))
      });
    };
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [myId, peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket || myId.length <= 0) return;
    const handleToggleAudio = (userId) => {
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);
      users[userId]?.close()
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    }
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [myId, players, setPlayers, socket, users]);

  useEffect(() => {
    if (!peer || !stream || myId.length <= 0) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call
        }))
      });
    });
  }, [myId, peer, setPlayers, stream]);

  useEffect(() => {
    if (!stream || myId.length <= 0) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        playing: true,
      },
    }));
  }, [myId, setPlayers, stream]);

  useEffect(() => {
    if (!socket || myId.length <= 0) {
      return
    };

    localStorage.setItem("IsWebcamOn", "yes");
    // Handle incoming prediction data
    const handlePrediction = (predictionData) => {
      // Update prediction state
      if (predictionData[0].length > 0)
        setPlayers((prev) => ({
          ...prev,
          [predictionData[0]]: {
            url: stream,
            muted: true,
            playing: true,
            prediction: predictionData[1],
          },
        }));
    };
    const handlePredictionOff = () => {
      setPlayers((prev) => ({
        ...prev,
        [myId]: {
          url: stream,
          muted: true,
          playing: true,
          prediction: null,
        },
      }));
    };

    // Listen for prediction events
    socket.on("prediction", handlePrediction);

    // Clean up function
    return () => {
      socket.off("prediction", handlePredictionOff);
    };
  }, [myId, nonHighlightedPlayers, setPlayers, socket, stream]);

  // Function to toggle prediction feature
  const toggleModel = () => {
    setIsPrediction(!isPrediction);
  };

  // Rest of the existing Room component code... (socket handling, user management, etc.)

  return (
    <div className=" bg-black h-screen w-screen">
      <div className={"w-full h-screen"}>
        {playerHighlighted && (
          <div className={"relative flex justify-center h-screen"}>
            <Player
              url={playerHighlighted.url}
              muted={playerHighlighted.muted}
              playing={playerHighlighted.playing}
              isActive
              userName={myId}
            />
            {/* Overlay box */}
            <div className={"overlayBox absolute bottom-60"}>
              <div className={"overlayText"}>
                {Object.keys(nonHighlightedPlayers)?.length > 0 && (
                  <>
                    {Object.keys(nonHighlightedPlayers).map((item, index) => {
                      return (
                        <>
                          {nonHighlightedPlayers[item].prediction && (
                              <div key={index}>{`${item} : ${nonHighlightedPlayers[item].prediction}`}</div>)}
                        </>
                      )
                    })}
                    <br />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.inActivePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).map((playerId) => {
          const { url, muted, playing } = nonHighlightedPlayers[playerId];
          return (
            <Draggable key={playerId}
              handle=".handle" >
              <div className="handle cursor-move">
                <Player key={playerId} url={url} muted={muted} playing={playing} isActive={false} userName={playerId} />
              </div>
            </Draggable>
          );
        })}
      </div>
      <CopySection roomId={roomId} />
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        toggleModel={toggleModel}
        leaveRoom={leaveRoom}
        isPrediction={isPrediction}
      />
      <div id="webcam-container"></div>
      <div id="label-container"></div>
    </div>
  );
};

export default Room;
