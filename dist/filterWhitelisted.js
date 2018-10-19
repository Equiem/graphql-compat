"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const WhitelistedChanges_1 = require("./WhitelistedChanges");
/**
 * Formats the given breaking changes in pretty format.
 */
exports.filterWhitelisted = (changes, whitelistFile, toleranceMs) => {
    const now = new Date().getTime();
    try {
        const whitelist = WhitelistedChanges_1.WhitelistedChanges.check(fs_1.default.readFileSync(whitelistFile)
            .toString()
            .split("\n")
            .map((line) => JSON.parse(line)));
        return changes.filter((change) => {
            const whitelisted = whitelist.filter((wchange) => wchange.description === change.description && wchange.type === change.type).sort((wchange) => wchange.timestamp < wchange.timestamp ? -1 : (wchange.timestamp > wchange.timestamp ? 1 : 0));
            if (whitelisted.length > 0) {
                return whitelisted[whitelisted.length - 1].timestamp + toleranceMs < now;
            }
            return true;
        });
    }
    catch (e) {
        throw new Error("Malformed whitelist file.");
    }
};
//# sourceMappingURL=filterWhitelisted.js.map