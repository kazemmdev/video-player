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
  src: "http://localhost/media/9/vcompress_2_0_500.m3u8",
};
