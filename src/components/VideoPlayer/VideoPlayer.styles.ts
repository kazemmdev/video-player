import styled from "styled-components";

const VOLUME_WIDTH = 60;

export const Container = styled.div`
  position: relative;
  width: 90%;
  max-width: 1000px;
  display: flex;
  justify-content: center;
  margin-inline: auto;
  background-color: black;

  video {
    width: 100%;
  }

  &[data-screen="theater"],
  &[data-screen="full"] {
    max-width: initial;
    width: 100%;
  }

  &[data-screen="theater"] {
    max-height: 90vh;
  }
`;

export const ControlWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  z-index: 100;
  opacity: 0;
  transition: opacity 150ms ease-in-out;

  &:before {
    content: "";
    position: absolute;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    width: 100%;
    aspect-ratio: 6 / 1;
    z-index: -1;
    pointer-events: none;
  }

  ${Container}:hover &,
  ${Container}:focus-within &,
  ${Container}[data-state="pause"] & {
    opacity: 1;
  }
`;

export const ControlInner = styled.div`
  position: relative;
  margin: 0.4rem;
`;

export const Controller = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  & button {
    background: none;
    border: none;
    color: inherit;
    padding: 0;
    height: 30px;
    width: 30px;
    font-size: 1.1rem;
    cursor: pointer;
    opacity: 0.85;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 150ms ease-in-out;

    &:hover {
      opacity: 1;
    }

    & svg path {
      transition: 0.2s ease;
    }
  }

  .full-screen:hover {
    animation: blink 0.3s ease-in-out;
  }

  @keyframes blink {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const VolumeSeek = styled.div`
  width: 0;
  height: 3px;
  display: flex;
  align-items: center;
  position: relative;
  padding-inline: 3px;
  transform-origin: left;
  transform: scaleX(0);
  transition: width 150ms ease-in-out, transform 150ms ease-in-out;
  transition-delay: 300ms;

  ${VolumeContainer}:hover &,
  &:focus-within {
    width: ${VOLUME_WIDTH}px;
    transform: scaleX(1);
  }
`;

export const VolumeSeekInput = styled.input`
  height: 3px;
  width: ${VOLUME_WIDTH}px;
  background: rgba(255, 255, 255, 0.3) !important;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
    border-radius: 100%;
    border: none;
    -webkit-appearance: none;
    margin: 0;
    background-color: white;
    z-index: 99;
    position: relative;
    transition: 0.5s all ease;
  }
  ${VolumeContainer}:hover &,
  &:focus-within {
    transform: scaleX(1);
  }
`;

export const VolumeSlider = styled.span<{ width: number }>`
  height: 3px;
  position: absolute;
  background: white;
  width: ${({ width }) => Math.round(58 * width)}px;
`;

export const DurationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-grow: 1;
  color: #ddd;
  font-family: Roboto, Arial, Helvetica, sans-serif;
`;

export const TimeLineContainer = styled.div`
  height: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
`;

export const TimeLine = styled.div`
  background-color: rgba(100, 100, 100, 0.4);
  height: 3px;
  width: 100%;
  position: relative;
  transition: all 0.2s ease;

  ${TimeLineContainer}:hover &,
  ${TimeLineContainer}[data-scrubbing='on'] & {
    height: 6px;
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: calc(100% - var(--preview-position) * 100%);
    background-color: rgb(150, 150, 150);
    display: none;
  }
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: calc(100% - var(--progress-position) * 100%);
    background-color: red;
  }
`;

export const TimeLineIndicator = styled.div`
  --scale: 0;
  position: absolute;
  transform: translateX(-50%) scale(var(--scale));
  height: 100%;
  top: 0;
  left: calc(var(--progress-position) * 100%);
  background-color: red;
  border-radius: 50%;
  transition: transform 150ms ease-in-out;
  aspect-ratio: 1 / 1;
`;

export const TimeLineHover = styled.div`
  height: 3px;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 10;
  transition: all 0.2s ease;

  ${TimeLineContainer}:hover & {
    height: 6px;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: calc(100% - var(--hover-position) * 100%);
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const TimeLineHoverIndicator = styled.div`
  --scale: 0;
  position: absolute;
  height: 16px;
  bottom: 18px;
  padding: 3px 6px;
  border-radius: 4px;
  aspect-ratio: 1 / 1;
  left: calc(var(--hover-position) * 100%);
  transform: translateX(-50%) scale(var(--scale));
  transition: scale 150ms ease-in-out;
  background-color: rgb(24, 24, 24);
  color: white;
  font-family: Roboto, Arial, Helvetica, sans-serif;
  font-size: 0.75rem;
  opacity: 0.7;

  &::before {
    content: "";
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    margin: auto;
    height: 8px;
    width: 8px;
    rotate: 45deg;
    border-radius: 2px;
    background-color: rgb(24, 24, 24);
  }
`;
