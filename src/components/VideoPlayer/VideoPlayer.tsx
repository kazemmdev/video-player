import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  ControlInner,
  ControlWrapper,
  Controller,
  DurationContainer,
  TimeLine,
  TimeLineContainer,
  TimeLineIndicator,
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
  VolumeButton,
} from "./buttons";

const formatDuration = (time: number) => {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  return hours === 0
    ? `${minutes}:${leadingZeroFormatter.format(seconds)}`
    : `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
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
  const timelineIndicatorRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState(0.6);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState("0:00");
  const [isScrubbing, setIsScrubbing] = useState(false);

  useEffect(() => {
    const video = videoRef?.current!;

    video.addEventListener("leavepictureinpicture", exitMiniPlayer);
    video.addEventListener("loadeddata", setVideoDuration);
    video.addEventListener("timeupdate", setVideoProgress);
    document.addEventListener("keydown", keyEvents);
    document.addEventListener("mouseup", stopScrubbingIndicator);
    document.addEventListener("mousemove", timelineMouseMoveHandler);

    return () => {
      video.removeEventListener("leavepictureinpicture", exitMiniPlayer);
      video.removeEventListener("loadeddata", setVideoDuration);
      video.removeEventListener("timeupdate", setVideoProgress);
      document.removeEventListener("keydown", keyEvents);
      document.removeEventListener("mouseup", stopScrubbingIndicator);
      document.removeEventListener("mousemove", timelineMouseMoveHandler);
    };
  }, []);

  /**
   * Keyboard Event handler
   *
   * @param e
   * @returns
   */
  const keyEvents = (e: any) => {
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;
    switch (e.key.toLowerCase()) {
      case " ":
        if (tagName === "button") return;
      case "k":
        togglePlay();
        break;
      case "f":
        toggleFullScreen();
        break;
      case "t":
        toggleTheater();
        break;
      case "i":
        toggleMiniPlayer();
        break;
      case "m":
        toggleMute();
        break;
    }
  };

  /**
   * Play & pause toggler
   */
  const togglePlay = () => {
    setIsPlaying((state) => !state);
    videoRef.current?.paused
      ? videoRef.current?.play()
      : videoRef.current?.pause();
  };

  /**
   * Mini-player screen toggler
   */
  const toggleMiniPlayer = () => {
    if (
      videoContainerRef.current?.getAttribute("data-screen") == "mini-player"
    ) {
      document.exitPictureInPicture();
      setIsMiniPlayer(false);
    } else {
      videoRef.current?.requestPictureInPicture();
      setIsMiniPlayer(true);
    }
  };

  /**
   * Exit mini-player screen
   */
  const exitMiniPlayer = () => {
    setIsMiniPlayer(false);
  };

  /**
   * Theater screen toggler
   */
  const toggleTheater = () => {
    setIsTheater((state) => !state);
  };

  /**
   * Full-screen toggler
   */
  const toggleFullScreen = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  /**
   * Mute toggler
   */
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

  /**
   * On volume change event handler
   * @param e
   */
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

  /**
   * Set duration of video
   */
  const setVideoDuration = () => {
    setDuration(formatDuration(videoRef?.current?.duration!));
  };

  /**
   * Set duration of progress
   */
  const setVideoProgress = () => {
    const duration = videoRef?.current?.duration;
    const curent = videoRef?.current?.currentTime;
    setProgress(formatDuration(curent!));
    const percent = curent! / duration!;
    timelineRef.current!.style.setProperty("--progress-position", `${percent}`);
  };

  /**
   * Handle click on timeline event
   *
   * @param e
   */
  const onTimelineMouseDownHandler = (e: any) => {
    setIsScrubbing(true);
    if (videoRef?.current && timelineRef?.current) {
      const rec = timelineRef.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rec.x), rec.width) / rec.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
      timelineRef.current.style.setProperty(
        "--progress-position",
        `${percent}`
      );
    }
  };
  const timelineMouseMoveHandler = (e: any) => {
    if (
      videoRef?.current &&
      timelineRef?.current &&
      timelineRef.current.getAttribute("data-scrubbing") == "on"
    ) {
      const rec = timelineRef.current.getBoundingClientRect();
      const percent =
        Math.min(Math.max(0, e.clientX - rec.x), rec.width) / rec.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
      timelineRef.current!.style.setProperty(
        "--progress-position",
        `${percent}`
      );
    }
  };

  /**
   * Show bullet indicator of timelione
   */
  const showTimelineIndicator = () => {
    if (timelineIndicatorRef?.current)
      timelineIndicatorRef.current.style.setProperty("--scale", "0.3");
  };

  /**
   * Hide bullet indicator of timelione
   */
  const hideTimelineIndicator = () => {
    if (timelineIndicatorRef?.current && !isScrubbing)
      timelineIndicatorRef.current.style.setProperty("--scale", "0");
  };

  /**
   *
   */
  const stopScrubbingIndicator = () => {
    setIsScrubbing(false);
  };

  /**
   * Handle playing mode attribute
   */
  const stateMode = () => {
    return isPlaying ? "play" : "pause";
  };

  /**
   * Handle view mode attribute
   */
  const viewMode = () => {
    return (
      (isTheater ? "theater" : "") ||
      (isFullScreen ? "full-screen" : "") ||
      (isMiniPlayer ? "mini-player" : "")
    );
  };

  /**
   * Handle scrubbing mode attribute
   */
  const scrubbingMode = () => {
    return isScrubbing ? "on" : "off";
  };

  return (
    <Container
      ref={videoContainerRef}
      data-state={stateMode()}
      data-screen={viewMode()}
    >
      <ControlWrapper>
        {!isMiniPlayer && (
          <ControlInner>
            <TimeLineContainer
              ref={timelineRef}
              data-scrubbing={scrubbingMode()}
              onMouseEnter={showTimelineIndicator}
              onMouseLeave={hideTimelineIndicator}
              onMouseDown={onTimelineMouseDownHandler}
            >
              <TimeLine />
              <TimeLineIndicator ref={timelineIndicatorRef} />
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
                <MiniPlayerButton onClick={toggleMiniPlayer} />
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
          </ControlInner>
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
