import React from "react";

interface props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isTheater: boolean;
}

const TheaterButton = ({ isTheater, ...props }: props) => {
  return (
    <button {...props} >
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

export default TheaterButton;
