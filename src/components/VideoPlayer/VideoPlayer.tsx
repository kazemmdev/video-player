import React, { useEffect, useRef, useState } from "react";
import { Container, ControlWrapper, Controller } from "./VideoPlayer.styles";
import { PlayButton, TheaterButton } from "./buttons";

export interface IVideoPlayer {
  src: string;
  hasTheater: boolean;
}

const VideoPlayer = ({ src, hasTheater }: IVideoPlayer) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheater, setIsTheater] = useState(false);

  const togglePlay = () => {
    setIsPlaying((state) => !state);
    videoRef.current?.paused
      ? videoRef.current?.play()
      : videoRef.current?.pause();
  };

  const toggleTheater = () => {
    setIsTheater((state) => !state);
  };

  return (
    <Container
      data-state={isPlaying ? "play" : "pause"}
      data-screen={isTheater && "theater"}
    >
      <ControlWrapper>
        <Controller>
          <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
          <TheaterButton isTheater={isTheater} onClick={toggleTheater} />
        </Controller>
      </ControlWrapper>
      <video ref={videoRef} src={src} />
    </Container>
  );
};

export default VideoPlayer;
