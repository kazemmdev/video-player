import React from "react";

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

export default PlayButton;
