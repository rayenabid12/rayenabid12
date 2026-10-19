/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { existsSync, readdirSync } from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Cloud containers ship Playwright's headless Chromium; use it instead of downloading Remotion's own.
const pw = "/opt/pw-browsers";
const shell = existsSync(pw) && readdirSync(pw).filter((d) => d.startsWith("chromium_headless_shell-")).sort().pop();
if (shell) {
  const dir = `${pw}/${shell}`;
  const exe = readdirSync(dir).map((d) => `${dir}/${d}/headless_shell`).find((p) => existsSync(p)) ?? readdirSync(dir).map((d) => `${dir}/${d}/chrome-headless-shell`).find((p) => existsSync(p));
  if (exe) Config.setBrowserExecutable(exe);
}
