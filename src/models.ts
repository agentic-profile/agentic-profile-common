import {
    DIDDocument,
    Service,
    VerificationMethod
} from "did-resolver";

export type DID = string;           // MAY include a fragment... or not 
export type FragmentID = string;    // may be full DID, or just the fragment part, such as "#key-7"


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
    dump: () => Promise<any>
}
