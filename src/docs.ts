import {
    parse,
    ParsedDID,
    VerificationMethod
} from "did-resolver";
import {
    DID,
    FragmentID
} from "./models.js";


//
// DID tools
/*
    did:${METHOD}:${METHOD_ID}${PARAMS}${PATH}${QUERY}${FRAGMENT}
    e.g. did:web:iamagentic.ai:mike

    interface ParsedDID {
      did: string         // always 'did:<method>:<method_id>'
      didUrl: string      // original string that was parsed
      method: string
      id: string          // method_id
      path?: string
      fragment?: string
      query?: string
      params?: Params
    }
*/

export type DocumentPartOrFragmentID = VerificationMethod | FragmentID;

// Some DID document lists contain a combination of ids, or document parts which contain ids.
// This method resolves each list item to a FragmentID which can either be a full DID,
// or just the fragment ID such as '#id'
export function resolveDocumentPartId( partOrId: DocumentPartOrFragmentID ): FragmentID | undefined {
    if( !partOrId )
        return undefined;
    else if( typeof partOrId === 'string' )
        return partOrId as FragmentID;
    else
        return partOrId.id as FragmentID;
}

export function resolveFragmentId( didOrFid: string ) {
    if( didOrFid.startsWith('#') )
        return { did: null, fragment: didOrFid.slice(1) };
    else
        return parse( didOrFid ) as ParsedDID;
}

export function removeFragmentId( did: DID ) {
    return did.split("#")[0];
}

export function matchingFragmentIds( partOrId: DocumentPartOrFragmentID, fid2: FragmentID ) {
    //console.log( 'matchingFragmentIds', partOrId, fid2 );
    const fid1 = resolveDocumentPartId( partOrId );
    if( !fid1 )
        return false;
    else if( fid1 === fid2 )
        return true;    // simple case

    const parsed1 = resolveFragmentId( fid1 );
    const parsed2 = resolveFragmentId( fid2 );
    if( !parsed1?.fragment || !parsed2?.fragment )
        return false;   // must have fragments to match
    if( parsed1.fragment !== parsed2.fragment )
        return false;   // simple case of fragments not matching
    if( parsed1.did && parsed2.did )
        return false;

    //console.log( 'matchingFragmentIds is TRUE for', fid1, fid2 );
    return true;
}