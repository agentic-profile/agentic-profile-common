import { matchingFragmentIds } from "../src/docs.js";

describe("Agentic Profile Common Package", () => {
    test("matchingFragmentIds", async () => {
        expect( matchingFragmentIds( "","" ) ).toBe( false );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1", "did:web:iamagentic.ai:1" ) ).toBe( false );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1", "did:web:iamagentic.ai:2" ) ).toBe( false );
        expect( matchingFragmentIds( "connect", "connect" ) ).toBe( false );
        expect( matchingFragmentIds( "#connect", "#connect" ) ).toBe( true );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "did:web:iamagentic.ai:1#connect" ) ).toBe( true );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "did:web:iamagentic.ai:2#connect" ) ).toBe( false );
        expect( matchingFragmentIds( "#connect", "did:web:iamagentic.ai:1#connect" ) ).toBe( true );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "#connect" ) ).toBe( true );
        expect( matchingFragmentIds( "#connect1", "did:web:iamagentic.ai:1#connect" ) ).toBe( false );
        expect( matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "#connect1" ) ).toBe( false );

        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect#foo", "did:web:iamagentic.ai:1#connect" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#foo" );
        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect#foo", "did:web:iamagentic.ai:1#connect#bar" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#foo" );
        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect#foo", "did:web:iamagentic.ai:1#connect#foo" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#foo" );
        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect#foo", "did:web:iamagentic.ai:1#connect#foo#bar" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#foo" );

        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "did:web:iamagentic.ai:1#connect#bar" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#bar" );
        expect( () => matchingFragmentIds( "did:web:iamagentic.ai:1#connect", "did:web:iamagentic.ai:1#connect#foo#bar" ) )
            .toThrow( "Unexpected extraneous fragment in did:web:iamagentic.ai:1#connect#foo#bar" );

        expect( matchingFragmentIds( "did:ex:1#", "did:ex:1#" ) ).toBe(false);
        expect( matchingFragmentIds( "did:ex:1#", "did:ex:1#foo" ) ).toBe(false);
        expect( matchingFragmentIds( "did:ex:1#foo", "did:ex:1" ) ).toBe(false);
        expect( matchingFragmentIds( undefined as any, "did:ex:1#foo" ) ).toBe(false);
        expect( matchingFragmentIds( "did:ex:1#foo", undefined as any ) ).toBe(false);
        expect( matchingFragmentIds( null as any, "did:ex:1#foo" ) ).toBe(false);
        expect( matchingFragmentIds( "did:ex:1#foo", null as any ) ).toBe(false);
        expect( () => matchingFragmentIds( "did:ex:1#a#b", "did:ex:1#a#c" ) )
            .toThrow( "Unexpected extraneous fragment in did:ex:1#a#b" );
        expect( () => matchingFragmentIds( "did:ex:1#a#b", "did:ex:1#a#b" ) )
            .toThrow( "Unexpected extraneous fragment in did:ex:1#a#b" );
        
        const vm1 = { id: 'did:ex:1#foo' } as any;
        const vm2 = { id: 'did:ex:2#foo' } as any;
        const vm3 = { id: '#foo' } as any;

        expect( matchingFragmentIds( vm1, '#foo' ) ).toBe(true);
        expect( matchingFragmentIds( vm1, 'did:ex:1#foo' ) ).toBe(true);
        expect( matchingFragmentIds( vm1, 'did:ex:2#foo' ) ).toBe(false);
        expect( matchingFragmentIds( vm3, 'did:ex:1#foo' ) ).toBe(true);
        expect( matchingFragmentIds( vm1, vm1.id ) ).toBe(true);
        expect( matchingFragmentIds( vm1, vm2.id ) ).toBe(false);
        expect( matchingFragmentIds( vm1, vm3.id ) ).toBe(true);

        expect( () => matchingFragmentIds( vm1, vm3 ) )
            .toThrow( "Prune fragment ID expected string, got object for {\"id\":\"#foo\"}" );
    });
});
