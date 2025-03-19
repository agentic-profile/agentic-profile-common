import { webDidToUrl } from "../src/web-did-resolver";

describe("Agentic Profile Common Package", () => {

    test("web did to http url", async () => {
        expect( webDidToUrl( "did:web:localhost%3A3003:iam:7" ) ).toBe( "http://localhost:3003/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:iam:7" ) ).toBe( "https://example.com/iam/7/did.json" );
        expect( webDidToUrl( "did:web:example.com:7" ) ).toBe( "https://example.com/7/did.json" );
        expect( webDidToUrl( "did:web:example.com" ) ).toBe( "https://example.com/.well-known/did.json" );
    });
});