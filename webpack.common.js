import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import nodeExternals from "webpack-node-externals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const common = {
  target: ["node", "es2023"],
  entry: "./src/index.ts",
  experiments: { outputModule: true },
  externals: [nodeExternals({ importType: "module" })],
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
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
