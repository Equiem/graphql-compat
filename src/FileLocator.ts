import { Partial, Static, String } from "runtypes";

/**
 * Runtype representing a parsed file locator pattern.
 */
export const FileLocator = Partial({
  committish: String,
  glob: String,
  url: String,
});

export type FileLocator = Static<typeof FileLocator>;
