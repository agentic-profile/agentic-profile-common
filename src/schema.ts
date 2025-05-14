import {
    DIDDocument,
    Service,
    VerificationMethod
} from "did-resolver";
import { Part } from "./a2a-parts.js";

export * from "./a2a-parts.js";

export type DID = string;           // MAY include a fragment... or not 
export type FragmentID = string;    // may be full DID, or just the fragment part, such as "#key-7"
export type UserID = string | number;

//
// Agentic Profile (Overlays DID document)
//

export interface AgentService extends Service {
    // id: string,                  // Can be fully qualified DID, DID+#fragment-id, or just a #fragment-id 
    // type: string,                // e.g. "Agentic/Chat", "Agentic/presence", "A2A/card"
    // serviceEndpoint: string,     // e.g. `https://agents.matchwise.ai/agent-chat`,
    name: string,                   // friendly name
    capabilityInvocation: (FragmentID | VerificationMethod)[]
}

export interface AgenticProfile extends DIDDocument {
    name: string      // nickname, not globally unique
    ttl?: number      // TTL in seconds, default is 86400 (one day)
}


//
// JWK
//

export type Base64Url = string;

export interface EdDSAPublicJWK extends JsonWebKey {
    kty: "OKP",
    alg: "EdDSA",
    crv: "Ed25519",
    x: Base64Url
}

export interface EdDSAPrivateJWK extends EdDSAPublicJWK {
    d: Base64Url
}

export interface JWKSet {
    id?: string,
    publicJwk: EdDSAPublicJWK
    b64uPublicKey: Base64Url,
    privateJwk: EdDSAPrivateJWK,
    b64uPrivateKey: Base64Url  
}


//
// Standardize globally scoped agent messaging (DIDs); use Googles A2A message parts
//

export interface TypedMeta {
    type: string,
    [ key: string ]: any
}

export interface AgentMessage {
    from: DID;
    content: string | Part[];
    meta?: TypedMeta[],
    created?: Date;
}
