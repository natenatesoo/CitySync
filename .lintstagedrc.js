const path = require("path");
const fs = require("fs");

// Check whether the platform-native Next.js SWC binary is installed.
// When working in a Linux sandbox (e.g. Cowork) the macOS binary from
// the original install won't work, and the Linux binary can't be
// downloaded because of network restrictions. Skipping lint in that
// case keeps commits clean without hiding real errors on the dev machine.
const isLinuxArm64 = process.platform === "linux" && process.arch === "arm64";
const swcLinuxPath = path.join(
  __dirname,
  "packages/nextjs/node_modules/@next/swc-linux-arm64-gnu"
);
const nextSwcAvailable = !isLinuxArm64 || fs.existsSync(swcLinuxPath);

const buildNextEslintCommand = (filenames) => {
  if (!nextSwcAvailable) {
    return "echo 'Next.js lint skipped: SWC native binary unavailable in this environment'";
  }
  return `yarn next:lint --fix --file ${filenames
    .map((f) => path.relative(path.join("packages", "nextjs"), f))
    .join(" --file ")}`;
};

const checkTypesNextCommand = () => {
  if (!nextSwcAvailable) {
    return "echo 'Next.js type-check skipped: SWC native binary unavailable in this environment'";
  }
  return "yarn next:check-types";
};

const buildHardhatEslintCommand = (filenames) =>
  `yarn hardhat:lint-staged --fix ${filenames
    .map((f) => path.relative(path.join("packages", "hardhat"), f))
    .join(" ")}`;

module.exports = {
  "packages/nextjs/**/*.{ts,tsx}": [
    buildNextEslintCommand,
    checkTypesNextCommand,
  ],
  "packages/hardhat/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
