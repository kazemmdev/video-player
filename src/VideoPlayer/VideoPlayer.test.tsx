import React from "react";
import { render } from "@testing-library/react";

import VideoPlayer from "./VideoPlayer";

describe("VideoPlayer", () => {
  test("renders the VideoPlayer component", () => {
    render(<VideoPlayer src="" />);
  });
});
