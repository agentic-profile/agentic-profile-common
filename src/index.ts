export * from "./models.js";
export {
    getResolver as getWebDidResolver,
    webDidToUrl
} from "./web-did-resolver.js";
export * from "./hooks.js";
export {
    JsonWebKey,
    parse as parseDID,
    ParsedDID,
    VerificationMethod
} from "did-resolver";
