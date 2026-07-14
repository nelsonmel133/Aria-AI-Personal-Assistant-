module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@aria/tokens": "./packages/tokens/src/index.json",
            "@aria/ui": "./packages/ui/src/index.ts",
            "@aria/api-client": "./packages/api-client/src/index.ts",
          },
        },
      ],
    ],
  };
};
