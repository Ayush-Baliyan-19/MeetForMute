import cx from "classnames";
import { Mic, Video, PhoneOff, MicOff, VideoOff, BrainCircuit, SwitchCamera } from "lucide-react";

import styles from "@/components/Bottom/index.module.css";

const Bottom = (props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom, toggleModel, isPrediction } = props;

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <div className="tooltip"
          data-tip={`${muted ? "Unmute" : "Mute"}`}
        >
          <MicOff
            className={cx(styles.icon, styles.active)}
            size={50}
            onClick={toggleAudio}
          />
        </div>
      ) : (
        <div className="tooltip"
          data-tip={`${muted ? "Unmute" : "Mute"}`}
        >
          <Mic className={cx(styles.icon)} size={50} onClick={toggleAudio} />
        </div>
      )}
      {playing ? (
        <div className="tooltip" data-tip={`${playing ? 'Stop video' : 'Play'}`}>
          <Video className={styles.icon} size={50} onClick={toggleVideo} />
        </div>
      ) : (

        <div className="tooltip" data-tip={`${playing ? 'Stop video' : 'Play'}`}>
          <VideoOff
            className={cx(styles.icon, styles.active)}
            size={50}
            onClick={toggleVideo}
          />
        </div>
      )}
      <div className="tooltip" data-tip="Leave call">
        <PhoneOff size={50} className={cx(styles.icon)} onClick={leaveRoom} />
      </div>
      {
        <div className="tooltip" data-tip={`${!isPrediction?'Run model':'Stop model'}`}>
          {isPrediction ? <BrainCircuit size={50} className={cx(styles.icon, styles.active)} onClick={toggleModel} /> :
            <BrainCircuit size={50} className={styles.icon} onClick={toggleModel} />
          }
          </div>
      }
      <div className="tooltip" data-tip="Switch camera">
        <SwitchCamera size={50} className={styles.icon} />
      </div>
    </div>
  );
};

export default Bottom;