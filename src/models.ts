import {
    DIDDocument,
    Service,
    VerificationMethod
} from "did-resolver";

export type DID = string;           // MAY include a fragment... or not 
export type FragmentID = string;    // may be full DID, or just the fragment part, such as "#key-7"
export type UserID = string | number;

//
// Agentic Profile (Overlays DID document)
//

export interface AgentService extends Service {
    // id: string,                  // Can be fully qualified DID, DID+#fragment-id, or just a #fragment-id 
    // type: string,                // e.g. "Agentic/Chat", "Agentic/presence"
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
// Chat is universal ;)
//

export interface ChatMessage {
    from: DID;
    content: string | Record<string, any>;
    created?: Date;
}

//
// Persistence/Storage
//

export interface CommonStorage {
    cacheAgenticProfile: ( profile: AgenticProfile ) => Promise<void>,
    getCachedAgenticProfile: ( did: DID ) => Promise<AgenticProfile | undefined>,

    dump: () => Promise<any>
}
