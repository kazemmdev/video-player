import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  ControlWrapper,
  Controller,
  DurationContainer,
  VolumeContainer,
  VolumeSeek,
  VolumeSeekInput,
  VolumeSlider,
} from "./VideoPlayer.styles";
import {
  FullScreenButton,
  MiniPlayerButton,
  PlayButton,
  TheaterButton,
} from "./buttons";
import VolumeButton from "./buttons/VolumeButton";

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
  const [volume, setVolume] = useState(0.55);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  // useEffect(() => {
  //   events();
  //   return events();
  // }, []);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      if (videoRef.current.muted) {
        setVolumeLevel("mute");
      } else {
        setVolumeLevel(volume > 0.55 ? "high" : "low");
      }
    }
  };

  const onVolumeChange = (e: any) => {
    if (videoRef.current) {
      const level = parseFloat(e.target.value);
      videoRef.current.volume = level;
      videoRef.current.muted = level === 0;
      if (level === 0) setVolumeLevel("mute");
      if (level > 0.55) setVolumeLevel("high");
      if (level < 0.55 && level > 0.1) setVolumeLevel("low");
      setVolume(level);
    }
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
          {!isMiniPlayer && (
            <VolumeContainer>
              <VolumeButton volumeState={volumeLevel} onClick={toggleMute} />
              <VolumeSeek>
                <VolumeSeekInput
                  type="range"
                  min="0"
                  max="1"
                  step="any"
                  value={volumeLevel == "mute" ? 0 : volume}
                  onChange={onVolumeChange}
                />
                <VolumeSlider width={volumeLevel == "mute" ? 0 : volume} />
              </VolumeSeek>
            </VolumeContainer>
          )}
          {!isMiniPlayer && <DurationContainer>0:00</DurationContainer>}
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
