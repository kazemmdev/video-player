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

export const Controller = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
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
`;
