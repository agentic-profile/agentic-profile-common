import {
    DIDDocument,
    Service,
    VerificationMethod
} from "did-resolver";
import { Part } from "./a2a-parts.js";


export type DID = string;           // May include a fragment... or not 
export type FragmentID = string;    // May be full DID, or just the fragment part, such as "#key-7"
                                    // Follows https://www.w3.org/TR/html4/types.html (ID and NAME tokens)
                                    // "ID and NAME tokens must begin with a letter ([A-Za-z]) and may be
                                    // followed by any number of letters, digits ([0-9]), hyphens ("-"), 
                                    // underscores ("_"), colons (":"), and periods (".").
                                    // For service/agent ids, we suggest using "-" to separate words,
                                    // such as: #connect-love
                                    // It is up to the DID document builder to ensure that the fragment id
                                    // is unique within the DID document.
export type UserID = string | number;


//
// Agentic Profile (Overlays DID document)
//

export interface AgentService extends Service {
    // id: string,                  // Can be fully qualified DID, DID+#fragment-id, or just a #fragment-id 
    // type: string,                // Case insensitive.  e.g. "Agentic/Chat", "Agentic/presence", "A2A/card"
    // serviceEndpoint: string,     // e.g. `https://agents.matchwise.ai/users/1/agent/connect`,
    name: string,                   // Friendly human-readable name
    capabilityInvocation: (FragmentID | VerificationMethod)[]
}

export interface AgenticProfile extends DIDDocument {
    name: string      // Nickname, not globally unique
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

export * from "./a2a-parts.js";

export type Metadata = Record<string, unknown>;

export interface AgentMessage {
    from: DID;
    content: string | Part[];
    metadata?: Metadata | null;
    created?: Date;
}
