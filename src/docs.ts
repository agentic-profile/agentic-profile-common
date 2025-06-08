import {
    Resolver,
    VerificationMethod
} from "did-resolver";
import {
    AgenticProfile,
    DID,
    FragmentID
} from "./schema.js";


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

export function removeFragmentId( did: DID ) {
    return did.split("#")[0];
}

export function pruneFragmentId( did: DID ) {
    if( typeof did !== 'string' )
        throw new Error(`Prune fragment ID expected string, got ${typeof did} for ${JSON.stringify(did)}`);
    const [ documentId, fragment, extraneous ] = did.split("#");
    if( extraneous )
        throw new Error(`Unexpected extraneous fragment in ${did}`);
    const fragmentId = fragment ? '#' + fragment : undefined;
    return { documentId, fragmentId };
}

export function matchingFragmentIds( partOrId: DocumentPartOrFragmentID, fid2: FragmentID ) {
    const fid1 = resolveDocumentPartId( partOrId );
    if( !fid1 || !fid2 )
        return false;

    const { documentId: did1, fragmentId: fragmentId1 } = pruneFragmentId( fid1 );
    const { documentId: did2, fragmentId: fragmentId2 } = pruneFragmentId( fid2 );
    if( did1 && did2 && did1 !== did2 )
        return false;   // different documents
    if( !fragmentId1 || !fragmentId2 )
        return false;   // must have fragments to match
    if( fragmentId1 !== fragmentId2 )
        return false;   // simple case of fragments not matching
    
    return true;
}

export async function resolveAgentServiceUrl( agentDid: DID, didResolver: Resolver ) {
    const { fragmentId: serviceId } = pruneFragmentId( agentDid );
    if( !serviceId )
        throw new Error(`Cannot resolve peer agent service URL when there is no fragment for ${agentDid}`);

    const profile = await fetchAgenticProfile( agentDid, didResolver );

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

export async function fetchAgenticProfile( profileDid: DID, didResolver: Resolver ): Promise<AgenticProfile> {
    const { didDocument, didResolutionMetadata } = await didResolver.resolve( profileDid );
    if( !didResolutionMetadata.error && didDocument )
        return didDocument as AgenticProfile;

    const { error, message } = didResolutionMetadata;
    throw new Error( error + ": " + message );    
}
