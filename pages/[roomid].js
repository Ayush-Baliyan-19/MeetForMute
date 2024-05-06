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

const Room = () => {
  const socket = useSocket();
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

  // Teachable Machine model variables
  let model, webcam, labelContainer, maxPredictions;

  maxPredictions = 2; // Replace with model's class count
  useEffect(() => {
    // Model URL and other variables
    const URL = "https://teachablemachine.withgoogle.com/models/2UnELG3RZ/"; // Replace with your model URL obtained from Teachable Machine

    async function initModel() {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmImage.load(modelURL, metadataURL);
      webcam = new tmImage.Webcam(200, 200, true); // Width, height, flip

      await webcam.setup();
      await webcam.play();
      window.requestAnimationFrame(loop);

      labelContainer = document.getElementById("label-container");
      for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
      }
    }

    if (!socket || !peer || !stream) return;
    initModel();

    return () => {
      webcam.stop(); // Cleanup function to stop webcam when unmounting
    };
  }, [peer, setPlayers, socket, stream]);

  // Update webcam and predict within a loop
  async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
  }

  // Make predictions and update UI (within predict)
  async function predict() {
    const prediction = await model.predict(webcam.canvas);

    // Access the predicted class with the highest probability
    const highestPrediction = prediction.reduce(
      (max, current) => (current.probability > max.probability ? current : max),
      prediction[0]
    );

    // Update UI based on prediction (e.g., highlight user or trigger actions)
    console.log("Predicted class:", highestPrediction.className, highestPrediction.probability);

    // Set the prediction state
    setPrediction(highestPrediction);

    // Emit prediction over the socket
    socket.emit("prediction", highestPrediction.className);

    labelContainer.textContent = `Predicted Class: ${highestPrediction.className} (Probability: ${highestPrediction.probability.toFixed(2)})`;
  }

  useEffect(() => {
    if (!socket || !peer || !stream) return;
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
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;
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
  }, [players, setPlayers, socket, users]);

  useEffect(() => {
    if (!peer || !stream) return;
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
  }, [peer, setPlayers, stream]);

  useEffect(() => {
    if (!stream || !myId) return;
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
    if (!socket) return;

    // Handle incoming prediction data
    const handlePrediction = (predictionData) => {
      console.log("Received prediction:", predictionData);
      // Update prediction state
      setPrediction(predictionData);
    };

    // Listen for prediction events
    socket.on("prediction", handlePrediction);

    // Clean up function
    return () => {
      socket.off("prediction", handlePrediction);
    };
  }, [socket]);

  // Rest of the existing Room component code... (socket handling, user management, etc.)

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {playerHighlighted && (
          <div className={styles.videoContainer+ "relative"}>
            <Player
              url={playerHighlighted.url}
              muted={playerHighlighted.muted}
              playing={playerHighlighted.playing}
              isActive
            />
            {/* Overlay box */}
            <div className={styles.overlayBox + "overlayBox"}>
              <div className={styles.overlayText + "overlayText"}>
                {/* Render prediction text dynamically */}
                {prediction && (
                  <>
                    Predicted Class: {prediction.className}
                    <br />
                    Probability: {(prediction.probability * 100).toFixed(2)}%
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
            <Player key={playerId} url={url} muted={muted} playing={playing} isActive={false} />
          );
        })}
      </div>
      <CopySection roomId={roomId} />
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        leaveRoom={leaveRoom}
      />
      <div id="webcam-container"></div>
      <div id="label-container"></div>
    </>
  );
};

export default Room;
