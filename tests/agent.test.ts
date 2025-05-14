import { Resolver } from "did-resolver";
import {
    createResolverCache,
    InMemoryAgenticProfileStore,
} from "../src/did-resolver";
import { webDidToUrl } from "../src/web-did-resolver";
import { createAgenticProfile } from "../src/profile";
import { fetchAgenticProfile } from "../src/docs";

import { DID } from "../src/models";
import { prettyJson } from "../src/misc";

const EXAMPLE_DID = "did:web:example.com:test"

describe("Agentic Profile Common Package", () => {
    test("web did to http url", async () => {
        expect( webDidToUrl( "did:web:localhost%3A3003:iam:7" ) ).toBe( "http://localhost:3003/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:iam:7" ) ).toBe( "https://example.com/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:7" ) ).toBe( "https://example.com/7/did.json" );
        expect( webDidToUrl( "did:web:example.com" ) ).toBe( "https://example.com/.well-known/did.json" );
    });

    test("create profile and resolve", async() => {
        const { profile } = await createAgenticProfile({ createJwk });
        profile.id = EXAMPLE_DID;
        const didResolver = createDidResolver([profile]);

        const fetchedProfile = await fetchAgenticProfile( EXAMPLE_DID, didResolver );
        expect( fetchedProfile.id ).toBe( EXAMPLE_DID );
        expect( fetchAgenticProfile( "did:web:example.com:foo", didResolver ) )
            .rejects.toThrow( "Failed to resolve DID document did:web:example.com:foo: Cound not find document" );
    })
});

function createDidResolver( profiles: AgenticProfile[] ) {
    async function resolve( did, parsed ) {
        const found = profiles.find(e=>e.id === did );
        if( found )
            return {
                didDocument: found,
                didDocumentMetadata: {},
                didResolutionMetadata: { contentType: "application/json" }
            }
        else {
            return {
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: {
                    error: `Failed to resolve DID document ${did}`,
                    message: "Cound not find document"
                }
            }    
        }
    }

    const cache = createResolverCache( new InMemoryAgenticProfileStore() );
    return new Resolver({ web: resolve }, { cache } );
}

async function createJwk() {
    return {
        "kty": "OKP",
        "alg": "EdDSA",
        "crv": "Ed25519",
        "x": "UTG3YeUcVg4-2xklwrCpFCdBOBiVU8UhPE_yvG9ojJA",
        "d": "jTzwi_KSJIqHy63dtjsJoDcOPT4A26JdvLb0ipTiqlM"
    }
}