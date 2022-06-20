const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");

const basePath = path.resolve(__dirname, "../");
const tsconfig = require(path.resolve(basePath, "tsconfig.webpack.json"));

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
    alias: Object.keys(tsconfig.compilerOptions.paths).reduce((aliases, aliasName) => {
      const aliasBase = aliasName.slice(0, -2);
      const pathBase = tsconfig.compilerOptions.paths[aliasName][0].slice(0, -2);

      return { ...aliases, [aliasBase]: path.resolve(basePath, tsconfig.compilerOptions.baseUrl, pathBase) };
    }, {}),
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.webpack.json",
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [{ from: "mods", to: "mods" }],
    }),
  ],
};
