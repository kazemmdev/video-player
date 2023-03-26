import React from "react";

interface props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isPlaying: boolean;
}

const PlayButton = ({ isPlaying, ...props }: props) => {
  return (
    <button {...props}>
      <svg viewBox="0 0 24 24">
        {isPlaying ? (
          <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
        ) : (
          <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
        )}
      </svg>
    </button>
  );
};

export default PlayButton;
