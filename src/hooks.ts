import {
    DIDDocument,
    DIDResolutionResult,
    ParsedDID,
    Resolver,
    WrappedResolver
} from "did-resolver";

import {
    AgenticProfile,
    CommonStorage,
    DID,
    UserID
} from "./models.js";
import { getResolver as getWebDidResolver } from "./web-did-resolver.js";
import { removeFragmentId } from "./docs.js";

export interface CommonHooks {
    didResolver: Resolver,
    resolveUserAgenticProfileDid: ( uid: UserID ) => Promise<DID>,
    storage: CommonStorage
}

export function setAgentHooks<T>( hooks: T ) {
    const update = { ...defaultHooks, ...hooks };
    (globalThis as any).__hooks = update;
    console.log( 'setAgentHooks', update );
}

export function agentHooks<T>() {
    if( !(globalThis as any).__hooks ) {
        console.error( 'Accessed agentHooks() before initializing' );
        throw new Error( 'Accessed agentHooks() before initializing' );
    } else
        return (globalThis as any).__hooks as T;
}

//
// Defaults
//

function mapToObject<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
    return Object.fromEntries(map) as Record<K, V>;
}

function defaultStorage() {
    const profileMap = new Map<string,AgenticProfile>();
    return {
        cacheAgenticProfile: async ( profile: AgenticProfile ) => { profileMap.set( profile.id, profile ) },
        getCachedAgenticProfile: async ( did: DID ) => profileMap.get( removeFragmentId( did ) ),
        dump: async ()=>({
            database: "None",
            agenticProfileCache: mapToObject( profileMap )
        })
    } as CommonStorage;
}

// Support storage for caching
export async function storageCache( parsed: ParsedDID, resolve: WrappedResolver) : Promise<DIDResolutionResult> {
    if (parsed.params && parsed.params['no-cache'] === 'true')
        return await resolve()  // required by DID spec

    const profile = await agentHooks<CommonHooks>().storage.getCachedAgenticProfile( parsed.did );
    if( profile )
        return asDidResolutionResult( profile );

    const result = await resolve();
    const { error } = result.didResolutionMetadata;
    if( !error && result.didDocument )
        await agentHooks<CommonHooks>().storage.cacheAgenticProfile( result.didDocument as AgenticProfile );

    return result;
}

function asDidResolutionResult( didDocument: DIDDocument, contentType: string = "application/json" ) {
    return {
        didDocument,
        didDocumentMetadata: {},
        didResolutionMetadata: { contentType },
    } as DIDResolutionResult;
}

const defaultHooks = {
    didResolver: new Resolver( getWebDidResolver(), { cache: storageCache } ),
    storage: defaultStorage(),
    resolveUserAgenticProfileDid: async ( uid: UserID ) => `did:${process.env.AP_DID_PATH ?? "web:example.com:iam"}:${uid}` 
};