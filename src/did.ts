import { DID } from "./types.js";

export function parseDid(s: DID) {
    const [ did, fragment ] = s.split('#').map(part => part.trim());
    return { did, fragment };
}
