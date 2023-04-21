import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  FullScreenButton,
  MiniPlayerButton,
  PlayButton,
  TheaterButton,
  VolumeButton,
} from "./Components";
import usePlayer from "./Utilities/HlsPlayer";
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
  options?: any;
  hlsConfig?: any;
}

const VideoPlayer = ({
  src,
  hasTheater,
  hasFullScreen,
  hasMiniPlayer,
  options,
  hlsConfig,
}: IVideoPlayer) => {
  console.log("inside video player ", hlsConfig);

  const hls = new Hls(hlsConfig);
  const videoRef = usePlayer({ src, options });
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
    if (video) {
      if (Hls.isSupported()) {
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      }
      // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
      // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
      // This is using the built-in support of the plain video element, without using hls.js.
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("canplay", function () {
          video.play();
        });
      }

      video.addEventListener("leavepictureinpicture", exitMiniPlayer);
      video.addEventListener("loadeddata", setVideoDuration);
      video.addEventListener("timeupdate", setVideoProgress);
    }

    document.addEventListener("keydown", keyEvents);
    document.addEventListener("mouseup", stopScrubbingIndicator);
    document.addEventListener("mousemove", timelineMouseMoveHandler);

    volumeRef.current?.style.setProperty(
      "--volume-percent",
      `${Math.round(58 * volume)}px`
    );

    return () => {
      if (video) {
        video.removeEventListener("leavepictureinpicture", exitMiniPlayer);
        video.removeEventListener("loadeddata", setVideoDuration);
        video.removeEventListener("timeupdate", setVideoProgress);
      }

      document.removeEventListener("keydown", keyEvents);
      document.removeEventListener("mouseup", stopScrubbingIndicator);
      document.removeEventListener("mousemove", timelineMouseMoveHandler);
    };
  }, [videoRef]);

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
        break;
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
      <video ref={videoRef} />
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

export default VideoPlayer;
