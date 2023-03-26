import React, { useEffect, useRef, useState } from "react";
import { Container, ControlWrapper, Controller } from "./VideoPlayer.styles";
import { PlayButton } from "./buttons";

export interface IVideoPlayer {
  src: string;
  hasTheater: boolean;
}

const VideoPlayer = ({ src, hasTheater }: IVideoPlayer) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) togglePlay();
  }, [isPlaying]);

  const togglePlay = () => {
    videoRef.current?.paused
      ? videoRef.current?.play()
      : videoRef.current?.pause();
  };

  return (
    <Container data-state={isPlaying ? "play" : "pause"}>
      <ControlWrapper>
        <Controller>
          <PlayButton
            isPlaying={isPlaying}
            onClick={() => setIsPlaying(!isPlaying)}
          />
        </Controller>
      </ControlWrapper>
      <video ref={videoRef} src={src} />
    </Container>
  );
};

export default VideoPlayer;
