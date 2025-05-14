import {
    DIDDocument,
    DIDResolutionResult,
    ParsedDID,
    Resolver,
    WrappedResolver
} from "did-resolver";

import {
    AgenticProfile,
    DID
} from "./schema.js";
import { getResolver as getWebDidResolver } from "./web-did-resolver.js";
import { removeFragmentId } from "./docs.js";


// Support storage for caching DID documents
export function createResolverCache(store: AgenticProfileStore) {
    return async (parsed: ParsedDID, resolve: WrappedResolver): Promise<DIDResolutionResult> => {
        if (parsed.params && parsed.params['no-cache'] === 'true')
            return await resolve()  // required by DID spec

        const profile = await store.loadAgenticProfile( parsed.did );
        if( profile )
            return asDidResolutionResult( profile );

        const result = await resolve();
        const { error } = result.didResolutionMetadata;
        if( !error && result.didDocument )
            await store.saveAgenticProfile( result.didDocument as AgenticProfile );

        return result;
    }
}

function asDidResolutionResult( didDocument: DIDDocument, contentType: string = "application/json" ) {
    return {
        didDocument,
        didDocumentMetadata: {},
        didResolutionMetadata: { contentType },
    } as DIDResolutionResult;
}

export interface DidResolverOptions {
    store: AgenticProfileStore,
    fetchImpl: typeof fetch
}

export function createDidResolver(options?: DidResolverOptions) {
    const cache = options?.store ? createResolverCache(options.store) : undefined;
    return new Resolver( getWebDidResolver(options?.fetchImpl), { cache } );   
}

export interface AgenticProfileStore {
    saveAgenticProfile( profile: AgenticProfile ): Promise<void>
    loadAgenticProfile( did: DID ): Promise<AgenticProfile | undefined>

    dump: () => Promise<any>
}

//
// Provide an in memory implementation of an AgenticProfileStore
//

function mapToObject<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
    return Object.fromEntries(map) as Record<K, V>;
}

export class InMemoryAgenticProfileStore implements AgenticProfileStore {
    private profileMap: Map<string, AgenticProfile>;

    constructor() {
        this.profileMap = new Map<string, AgenticProfile>();
    }

    async saveAgenticProfile(profile: AgenticProfile): Promise<void> {
        this.profileMap.set(profile.id, profile);
    }

    async loadAgenticProfile(did: DID): Promise<AgenticProfile | undefined> {
        return this.profileMap.get(removeFragmentId(did));
    }

    async dump(): Promise<any> {
        return {
            database: "None",
            agenticProfileCache: mapToObject(this.profileMap)
        };
    }
}