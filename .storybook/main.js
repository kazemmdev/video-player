module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    "@storybook/addon-interactions",
  ],
  core: {
    builder: "@storybook/builder-webpack5",
  },
  typescript: { reactDocgen: false },
  framework: "@storybook/react",
};
