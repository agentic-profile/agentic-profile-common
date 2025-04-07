import { Resolver } from "did-resolver";
import { webDidToUrl } from "../src/web-did-resolver";
import {
    createAgenticProfile,
    fetchAgenticProfile
} from "../src/profile";
import { DID } from "../src/models.js";
import {
    agentHooks,
    setAgentHooks,
    storageCache
} from "../src/hooks.js";
import { prettyJson } from "../src/misc.js";

const EXAMPLE_DID = "did:web:example.com:test"

describe("Agentic Profile Common Package", () => {
    beforeAll(async() => {
        const { profile } = await createAgenticProfile({ createJwk });
        profile.id = EXAMPLE_DID;

        setAgentHooks({
            didResolver: createDidResolver([profile])
        });
    });

    test("web did to http url", async () => {
        expect( webDidToUrl( "did:web:localhost%3A3003:iam:7" ) ).toBe( "http://localhost:3003/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:iam:7" ) ).toBe( "https://example.com/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:7" ) ).toBe( "https://example.com/7/did.json" );
        expect( webDidToUrl( "did:web:example.com" ) ).toBe( "https://example.com/.well-known/did.json" );
    });

    test("hooks and caching", async() => {
        const hooks = agentHooks<CommonHooks>();
        expect( await hooks.resolveUserAgenticProfileDid("6") ).toBe( "did:web:example.com:iam:6" );

        const profile = await fetchAgenticProfile( EXAMPLE_DID );
        expect( profile.id ).toBe( EXAMPLE_DID );
        console.log( "pid", profile.id, EXAMPLE_DID );

        console.log( "Storage:", prettyJson( await hooks.storage.dump() ) );

        expect( fetchAgenticProfile( "did:web:example.com:foo" ) )
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

    return new Resolver({ web: resolve }, { cache: storageCache } );
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