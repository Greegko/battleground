const path = require("path");

const basePath = path.resolve(__dirname, "../");
const tsconfig = require(path.resolve(basePath, "tsconfig.json"));

module.exports = {
  entry: ["./src/main.tsx"],

  mode: "production",

  output: {
    filename: "bundle.js",
    path: __dirname + "/public",
  },

  devtool: "source-map",

  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".ts", ".tsx"],
    alias: Object.keys(tsconfig.compilerOptions.paths).reduce((aliases, aliasName) => {
      const aliasBase = aliasName.slice(0, -2);
      const pathBase = tsconfig.compilerOptions.paths[aliasName][0].slice(0, -2);

      return { ...aliases, [aliasBase]: path.resolve(basePath, pathBase) };
    }, {}),
  },

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
      },
      {
        test: /\.svg$/,
        use: ["svg-url-loader"],
      },
    ],
  },
};
