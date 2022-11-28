const path = require("path");

const basePath = path.resolve(__dirname, "../");

module.exports = {
  entry: ["./src/main.ts"],

  mode: "production",

  experiments: {
    outputModule: true,
  },

  output: {
    filename: "mods.js",
    path: path.resolve(basePath, "dist"),
    library: {
      type: "module",
    },
    module: true,
  },

  devtool: "source-map",

  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".ts"],
  },

  externals: {
    "pixi.js": "pixi.js",
    "lodash-es": "lodash-es",
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "../tsconfig.base.json",
            },
          },
        ],
      },
      {
        resourceQuery: /\?url$/,
        type: "asset/inline",
      },
    ],
  },
};
