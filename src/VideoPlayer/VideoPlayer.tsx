import React, { useEffect, useRef, useState } from "react";
import "./VideoPlayer.scss";

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
  const timelineHoverIndicatorRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState(0.6);
  const [volumeLevel, setVolumeLevel] = useState("high");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayBtnClicked, setIsPlayBtnClicked] = useState(true);
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

    volumeRef.current?.style.setProperty(
      "--volume-percent",
      `${Math.round(58 * volume)}px`
    );

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
  const togglePlay = (isBtnClicked?: boolean) => {
    setIsPlayBtnClicked(isBtnClicked || false);
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
    if (videoRef.current && volumeRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      if (videoRef.current.muted) {
        setVolumeLevel("mute");
        volumeRef.current.style.setProperty("--volume-percent", "0");
      } else {
        setVolumeLevel(volume > 0.55 ? "high" : "low");
        volumeRef.current.style.setProperty(
          "--volume-percent",
          `${Math.round(58 * volume)}px`
        );
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
      volumeRef.current?.style.setProperty(
        "--volume-percent",
        `${Math.round(58 * level)}px`
      );
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
      timelineRef.current.style.setProperty("--hover-position", `${percent}`);
    }
  };

  /**
   * Handle timeline mouse move
   *
   * @param e
   */
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
      timelineRef.current.style.setProperty("--hover-position", `${percent}`);
    }
  };

  /**
   * Show bullet indicator of timelione
   */
  const showTimelineIndicator = () => {
    timelineIndicatorRef.current?.style.setProperty("--scale", "1");
  };

  /**
   * Hide bullet indicator of timelione
   */
  const hideTimelineIndicator = () => {
    if (!isScrubbing)
      timelineIndicatorRef.current?.style.setProperty("--scale", "0");
  };

  /**
   * Handle timeline mouse move
   *
   * @param e
   */
  const timelineHoverMouseMoveHandler = (e: any) => {
    if (timelineHoverIndicatorRef.current) {
      const rec = timelineRef.current?.getBoundingClientRect()!;
      const percent =
        Math.min(Math.max(0, e.clientX - rec.x), rec.width) / rec.width;
      timelineRef.current?.style.setProperty("--hover-position", `${percent}`);
      timelineHoverIndicatorRef.current.style.setProperty("--scale", "1");

      const time = percent * videoRef.current?.duration!;
      timelineHoverIndicatorRef.current.textContent = formatDuration(time);
    }
  };

  /**
   * Handle timeline mouse out
   */
  const timelineHoverMouseOutHandler = () => {
    timelineRef.current?.style.setProperty("--hover-position", "0");
    timelineHoverIndicatorRef.current?.style.setProperty("--scale", "0");
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
    <div
      className="videoplayer"
      ref={videoContainerRef}
      data-state={stateMode()}
      data-screen={viewMode()}
    >
      <div className="videoplayer__controller">
        {!isMiniPlayer && (
          <div className="videoplayer__controller-wrap">
            <div
              className="timeline"
              ref={timelineRef}
              data-scrubbing={scrubbingMode()}
              onMouseEnter={showTimelineIndicator}
              onMouseLeave={hideTimelineIndicator}
              onMouseDown={onTimelineMouseDownHandler}
              onMouseMove={timelineHoverMouseMoveHandler}
              onMouseOut={timelineHoverMouseOutHandler}
            >
              <div className="timeline-slider" />
              <div
                className="timeline-slider-indicator"
                ref={timelineIndicatorRef}
              />
              <div className="timeline-hover-slider" />
              <div
                className="timeline-hover-slider-indicator"
                ref={timelineHoverIndicatorRef}
              />
            </div>
            <div className="videoplayer__controller-inner">
              <PlayButton
                isPlaying={isPlaying}
                onClick={() => togglePlay(true)}
              />
              <div className="volume" ref={volumeRef}>
                <VolumeButton volumeState={volumeLevel} onClick={toggleMute} />
                <div className="volume-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="any"
                    value={volumeLevel == "mute" ? 0 : volume}
                    onChange={onVolumeChange}
                  />
                  <div className="volume-slider" />
                </div>
              </div>
              <div className="duration">
                {progress} / {duration}
              </div>
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
            </div>
          </div>
        )}
      </div>
      <video ref={videoRef} src={src} />
      <div className="videoplayer__screen" onClick={() => togglePlay()}>
        {!isPlayBtnClicked && isPlaying && (
          <PlayButton isPlaying={!isPlaying} />
        )}
        {!isPlayBtnClicked && !isPlaying && (
          <PlayButton isPlaying={!isPlaying} />
        )}
      </div>
    </div>
  );
};

/**
 * Default props
 */
VideoPlayer.defaultProps = {
  hasTheater: true,
  hasFullScreen: true,
  hasMiniPlayer: true,
};

/**
 * Buttons components
 */

interface PlayButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isPlaying: boolean;
}

const PlayButton = ({ isPlaying, ...props }: PlayButtonProps) => {
  return (
    <button {...props}>
      <svg viewBox="4 4 28 28">
        <path
          fill="currentColor"
          d={
            isPlaying
              ? "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"
              : "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"
          }
        />
      </svg>
    </button>
  );
};

interface FullScreenButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isFullScreen: boolean;
}

const FullScreenButton = ({
  isFullScreen,
  ...props
}: FullScreenButtonProps) => {
  return (
    <button {...props} className="full-screen">
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d={
            isFullScreen
              ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
          }
        />
      </svg>
    </button>
  );
};

interface MiniPlayerButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const MiniPlayerButton = ({ ...props }: MiniPlayerButtonProps) => {
  return (
    <button {...props}>
      <svg viewBox="-3 -3 30 30">
        <path
          fill="currentColor"
          d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"
        />
      </svg>
    </button>
  );
};

interface TheaterButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isTheater: boolean;
}

const TheaterButton = ({ isTheater, ...props }: TheaterButtonProps) => {
  return (
    <button {...props}>
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d={
            isTheater
              ? "M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"
              : "M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"
          }
        />
      </svg>
    </button>
  );
};

interface VolumeButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  volumeState: string;
}

const VolumeButton = ({ volumeState, ...props }: VolumeButtonProps) => {
  return (
    <button {...props}>
      <svg viewBox="4 4 28 28">
        <path
          fill="currentColor"
          d={
            (volumeState === "high" &&
              "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z") ||
            (volumeState === "low" &&
              "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z") ||
            "m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z"
          }
        />
      </svg>
    </button>
  );
};

export default VideoPlayer;
