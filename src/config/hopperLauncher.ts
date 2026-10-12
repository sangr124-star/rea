import { accessSync, constants } from "node:fs";
import { join } from "node:path";

const MAC_APPLICATION_NAME = "Hopper Disassembler.app";
const MAC_LAUNCHER = "Contents/MacOS/hopper";
const SYSTEM_MAC_HOPPER = join(
  "/Applications",
  MAC_APPLICATION_NAME,
  MAC_LAUNCHER,
);
const SYSTEM_LINUX_HOPPER = "/opt/hopper/bin/Hopper";

/** Per-user macOS bundle location that `rea setup` installs into. */
export const userMacHopperApplication = (homeDirectory: string): string =>
  join(homeDirectory, "Applications", MAC_APPLICATION_NAME);

/** Launcher inside a macOS Hopper application bundle. */
export const macHopperLauncher = (application: string): string =>
  join(application, MAC_LAUNCHER);

/** Ordered default launcher locations used when HOPPER_LAUNCHER_PATH is unset. */
export const defaultHopperLauncherCandidates = (
  platform: NodeJS.Platform,
  homeDirectory: string,
): readonly [string, ...string[]] => {
  if (platform === "linux")
    return [
      SYSTEM_LINUX_HOPPER,
      join(homeDirectory, ".local/share/rea/hopper/bin/Hopper"),
    ];
  if (platform === "darwin")
    return [
      SYSTEM_MAC_HOPPER,
      macHopperLauncher(userMacHopperApplication(homeDirectory)),
    ];
  return [SYSTEM_MAC_HOPPER];
};

const executableAvailable = (path: string): boolean => {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

/** First executable default launcher, else the preferred default for diagnostics. */
export const defaultHopperLauncherPath = (
  platform: NodeJS.Platform,
  homeDirectory: string,
  executable: (path: string) => boolean = executableAvailable,
): string => {
  const candidates = defaultHopperLauncherCandidates(platform, homeDirectory);
  return candidates.find(executable) ?? candidates[0];
};
