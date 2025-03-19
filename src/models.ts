import {
    DIDDocument,
    //JsonWebKey,
    Service,
    VerificationMethod
} from "did-resolver";

export type DID = string;           // MAY include a fragment... or not 
export type FragmentID = string;    // may be full DID, or just the fragment part, such as "#key-7"
export type UserId = string | number;


//
// Agentic Profile (Overlays DID document)
//

export interface AgentService extends Service {
    // id: string,
    // type: string,               // e.g. "AgenticChat",
    // serviceEndpoint: string,    // e.g. `https://agents.matchwise.ai/agent-chat`,
    name: string,                  // friendly name
    capabilityInvocation: (FragmentID | VerificationMethod)[]
}

export interface AgenticProfile extends DIDDocument {
    name: string      // nickname, not globally unique
    ttl?: number      // TTL in seconds, default is 86400 (one day)
}

//
// Chat is universal ;)
//

export interface ChatMessage {
    from: DID;
    content: string | Record<string, any>;
    created?: Date;
}
