import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  ControlWrapper,
  Controller,
  DurationContainer,
  TimeLine,
  TimeLineContainer,
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

const formatDuration = (time: number) => {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
};

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
  const timelineRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(0.55);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState("0:00");

  useEffect(() => {
    const video = videoRef?.current!;

    video.addEventListener("leavepictureinpicture", exitMiniPlayer);
    video.addEventListener("loadeddata", setVideoDuration);
    video.addEventListener("timeupdate", setVideoProgress);

    return () => {
      video.removeEventListener("leavepictureinpicture", exitMiniPlayer);
      video.removeEventListener("loadeddata", setVideoDuration);
      video.removeEventListener("timeupdate", setVideoProgress);
    };
  }, []);

  // play / pause
  const togglePlay = () => {
    setIsPlaying((state) => !state);
    videoRef.current?.paused
      ? videoRef.current?.play()
      : videoRef.current?.pause();
  };

  // screen
  const launchMiniPlayer = () => {
    setIsMiniPlayer(true);
    videoRef.current?.requestPictureInPicture();
  };

  const exitMiniPlayer = () => {
    setIsMiniPlayer(false);
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

  // Volumes

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

  // Duratiuon
  const setVideoDuration = () => {
    setDuration(formatDuration(videoRef?.current?.duration!));
  };
  const setVideoProgress = () => {
    const duration = videoRef?.current?.duration;
    const curent = videoRef?.current?.currentTime;

    setProgress(formatDuration(curent!));

    const percent = curent! / duration!;
    timelineRef.current!.style.setProperty("--progress-position", `${percent}`);
  };

  // Handel modes attr
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
        {!isMiniPlayer && (
          <>
            <TimeLineContainer>
              <TimeLine ref={timelineRef} />
            </TimeLineContainer>
            <Controller>
              <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
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
              <DurationContainer>
                {progress} / {duration}
              </DurationContainer>
              {hasMiniPlayer && !isFullScreen && (
                <MiniPlayerButton onClick={launchMiniPlayer} />
              )}
              {hasTheater && !isFullScreen && (
                <TheaterButton isTheater={isTheater} onClick={toggleTheater} />
              )}
              {hasFullScreen && (
                <FullScreenButton
                  isFullScreen={isFullScreen}
                  onClick={toggleFullScreen}
                />
              )}
            </Controller>
          </>
        )}
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
