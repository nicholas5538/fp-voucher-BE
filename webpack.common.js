import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import nodeExternals from "webpack-node-externals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const common = {
  target: ["node", "es2023"],
  entry: "./src/app.ts",
  experiments: { outputModule: true },
  externals: [nodeExternals({ importType: "module" })],
  externalsPresets: { node: true },
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
        exclude: /(node_modules|\/(tests)\/)/,
      },
    ],
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
    extensions: [".ts", ".js"],
  },
};

export default common;
