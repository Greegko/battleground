const path = require("path");

const basePath = path.resolve(__dirname, "../");
const workspaceRoot = path.resolve(basePath, "../../");
const tsConfigPath = path.resolve(workspaceRoot, "tsconfig.base.json");
const tsconfig = require(tsConfigPath);

module.exports = {
  entry: ["./src/main.tsx"],

  mode: "production",

  output: {
    filename: "bundle.js",
    path: path.resolve(basePath, "public"),
  },

  devtool: "source-map",

  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".ts", ".tsx"],
    alias: Object.keys(tsconfig.compilerOptions.paths).reduce((aliases, aliasName) => {
      const pathBase = tsconfig.compilerOptions.paths[aliasName][0].replace(/\/\*$/, "");

      return { ...aliases, [aliasName.replace(/\/*$/, "")]: path.resolve(workspaceRoot, pathBase) };
    }, {}),
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: tsConfigPath,
            },
          },
        ],
      },
      {
        test: /\.scss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        resourceQuery: /\?url$/,
        type: "asset/resource",
      },
    ],
  },
};
