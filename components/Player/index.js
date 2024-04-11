import ReactPlayer from "react-player";

const Player = (props) => {
    const { url, muted, playing } = props;
    return (
        <div className="player-wrapper">
            <ReactPlayer
                url={url}
                controls
                width="100%"
                height="100%"
                className="react-player"
                playing={playing}
                muted={muted}
            />
        </div>
    );
}

export default Player;