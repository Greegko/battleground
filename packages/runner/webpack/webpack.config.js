const path = require("path");

const basePath = path.resolve(__dirname, "../");

module.exports = {
  entry: ["./src/main.ts"],

  mode: "production",

  output: {
    filename: "bundle.js",
    path: path.resolve(basePath, "public"),
  },

  devtool: "source-map",

  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".ts"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
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
        resourceQuery: /url/,
        type: "asset/resource",
      },
    ],
  },
};
