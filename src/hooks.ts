import { Resolver } from "did-resolver";

import {
    CommonStorage,
} from "./models.js";
import { getResolver as getWebDidResolver } from "./web-did-resolver.js";

export interface CommonHooks {
    didResolver: Resolver,
    storage: CommonStorage
}

const defaultHooks = {
    didResolver: new Resolver( getWebDidResolver() ),
    storage: { dump: ()=>({ database: "None" }) }
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