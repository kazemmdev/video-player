import React, { useEffect, useRef, useState } from "react";
import { Container, ControlWrapper, Controller } from "./VideoPlayer.styles";
import {
  FullScreenButton,
  MiniPlayerButton,
  PlayButton,
  TheaterButton,
} from "./buttons";

export interface IVideoPlayer {
  src: string;
  hasTheater?: boolean;
  hasFullScreen?: boolean;
  hasMiniPlayer?: boolean;
}

const VideoPlayer = ({
  src,
  hasTheater,
  hasFullScreen,
  hasMiniPlayer,
}: IVideoPlayer) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const togglePlay = () => {
    setIsPlaying((state) => !state);
    videoRef.current?.paused
      ? videoRef.current?.play()
      : videoRef.current?.pause();
  };

  const toggleMiniPlayer = () => {
    if (isMiniPlayer) {
      setIsMiniPlayer(false);
      document.exitPictureInPicture();
    } else {
      setIsMiniPlayer(true);
      videoRef.current?.requestPictureInPicture();
    }
  };

  const toggleTheater = () => {
    setIsTheater((state) => !state);
  };

  const toggleFullScreen = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const stateMode = () => {
    return isPlaying ? "play" : "pause";
  };

  const viewMode = () => {
    return (isTheater ? "theater" : "") || (isFullScreen ? "full-screen" : "");
  };

  return (
    <Container
      ref={videoContainerRef}
      data-state={stateMode()}
      data-screen={viewMode()}
    >
      <ControlWrapper>
        <Controller>
          {!isMiniPlayer && (
            <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
          )}
          {hasMiniPlayer && !isFullScreen && !isMiniPlayer && (
            <MiniPlayerButton onClick={toggleMiniPlayer} />
          )}
          {hasTheater && !isFullScreen && !isMiniPlayer && (
            <TheaterButton isTheater={isTheater} onClick={toggleTheater} />
          )}
          {hasFullScreen && !isMiniPlayer && (
            <FullScreenButton
              isFullScreen={isFullScreen}
              onClick={toggleFullScreen}
            />
          )}
        </Controller>
      </ControlWrapper>
      <video ref={videoRef} src={src} />
    </Container>
  );
};

VideoPlayer.defaultProps = {
  hasTheater: true,
  hasFullScreen: true,
  hasMiniPlayer: true,
};

export default VideoPlayer;
