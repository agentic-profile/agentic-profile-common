import { Resolver } from "did-resolver";

import {
	DID,
	UserId,
} from "./models.js";
import { getResolver as getWebDidResolver } from "./web-did-resolver.js";


export interface CommonHooks {
    //generateChatReply: ( uid: UserId, agentDid: DID, history: ChatMessage[] ) => Promise<ChatCompletionResult>;
    createAgentDid: ( uid: UserId ) => DID;
    didResolver: Resolver
}

/*
export interface AgentHookOverrides {
    //generateChatReply?: ( uid: UserId, agentDid: DID, history: ChatMessage[] ) => Promise<ChatCompletionResult>;
    createAgentDid?: ( uid: UserId ) => DID;
    didResolver?: Resolver
}
*/

const defaultHooks = {
    //generateChatReply,
    createAgentDid: ( uid: UserId ) => `did:web:${process.env.AP_DOMAIN ?? "example.com"}:${uid}`,
    didResolver: new Resolver( getWebDidResolver() )
};

export function setAgentHooks<T>( hooks: T ) {
    const update = { ...defaultHooks, ...hooks };
    (globalThis as any).__hooks = update;
    console.log( 'setAgentHooks', update );
}

export function agentHooks<T>() {
    if( !(globalThis as any).__hooks ) {
        console.error( 'no hooks!' );
        throw new Error('Accessed hooks() before initializing');
    } else
        return (globalThis as any).__hooks as T;
}