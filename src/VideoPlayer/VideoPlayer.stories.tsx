import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import VideoPlayer from "./VideoPlayer";

export default {
  title: "ReactComponentLibrary/VideoPlayer",
  component: VideoPlayer,
} as ComponentMeta<typeof VideoPlayer>;

const Template: ComponentStory<typeof VideoPlayer> = (args) => (
  <VideoPlayer {...args} />
);

export const HelloWorld = Template.bind({});

HelloWorld.args = {
  src: "https://kazemm.dev/api/media/sample.m3u8",
};
