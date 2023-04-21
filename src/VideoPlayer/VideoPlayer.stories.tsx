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
  src: "http://mydev.test/media/16/590342413d8a7335.m3u8",
};
