import {
    parse,
    ParsedDID,
    VerificationMethod
} from "did-resolver";
import {
    AgenticProfile,
    DID,
    FragmentID
} from "./models.js";
import {
    agentHooks,
    CommonHooks
} from "./hooks.js";


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

// DEPRECATED, use pruneFragmentId
export function resolveFragmentId( didOrFid: string ) {
    if( didOrFid.startsWith('#') )
        return { did: null, fragment: didOrFid.slice(1) };
    else
        return parse( didOrFid ) as ParsedDID;
}

// DEPRECATED, use pruneFragmentId
export function removeFragmentId( did: DID ) {
    return did.split("#")[0];
}

export function pruneFragmentId( did: DID ) {
    const [ documentId, fragment ] = did.split("#");
    return { documentId, fragmentId: '#' + fragment };
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

export async function resolveAgentServiceUrl( agentDid: DID ) {
    const { fragment } = resolveFragmentId( agentDid );
    if( !fragment )
        throw new Error(`Cannot resolve peer agent service URL when there is no fragment for ${agentDid}`);
    const serviceId = "#" + fragment;

    const profile = await fetchAgenticProfile( agentDid );

    const found = profile.service?.find(e=>e.id === serviceId );
    if( !found )
        throw new Error(`Failed to find service ${serviceId} in ${agentDid}`);
    const { serviceEndpoint } = found;
    if( !serviceEndpoint )
        throw new Error(`No serviceEndpoint for ${serviceId} in ${agentDid}`);
    if( typeof serviceEndpoint === 'string' )
        return serviceEndpoint as string;
    if( !Array.isArray( serviceEndpoint ) )
        throw new Error(`Unexpected service endpoint type for ${serviceId} in ${agentDid}`);
    if( serviceEndpoint.length == 0 )
        throw new Error(`Empty service endpoint list for ${serviceId} in ${agentDid}`);
    if( typeof serviceEndpoint[0] !== 'string' )
        throw new Error(`Unexpected service endpoint type in array for ${serviceId} in ${agentDid}`);

    return serviceEndpoint[0] as string;
}

export async function fetchAgenticProfile( profileDid: DID ): Promise<AgenticProfile> {
    const { didDocument, didResolutionMetadata } = await agentHooks<CommonHooks>().didResolver.resolve( profileDid );
    if( !didResolutionMetadata.error && didDocument )
        return didDocument as AgenticProfile;

    const { error, message } = didResolutionMetadata;
    throw new Error( error + ": " + message );    
}