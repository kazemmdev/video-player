import styled from "styled-components";

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
