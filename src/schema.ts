import {
    DIDDocument,
    Service,
    VerificationMethod
} from "did-resolver";

export type DID = string;           // May include a fragment... or not 
export type FragmentID = string;    // May be full DID, or just the fragment part, such as "#key-7"
                                    // Follows https://www.w3.org/TR/html4/types.html (ID and NAME tokens)
                                    // "ID and NAME tokens must begin with a letter ([A-Za-z]) and may be
                                    // followed by any number of letters, digits ([0-9]), hyphens ("-"), 
                                    // underscores ("_"), colons (":"), and periods (".").
                                    // For service/agent ids, we suggest using "-" to separate words,
                                    // such as: #connect-love
                                    // It is up to the DID document builder to ensure that the fragment id
                                    // is unique within the DID document.
export type UserID = string | number;


//
// Agentic Profile (Overlays DID document)
//

export interface AgentService extends Service {
    // id: string,                  // Can be fully qualified DID, DID+#fragment-id, or just a #fragment-id 
    // type: string,                // Case insensitive.  e.g. "Agentic/Chat", "Agentic/presence", "A2A/card"
    // serviceEndpoint: string,     // e.g. `https://agents.matchwise.ai/users/1/agent/connect`,
    name: string,                   // Friendly human-readable name
    capabilityInvocation: (FragmentID | VerificationMethod)[]
}

export interface AgenticProfile extends DIDDocument {
    name: string      // Nickname, not globally unique
    ttl?: number      // TTL in seconds, default is 86400 (one day)
}


//
// JWK
//

export type Base64Url = string;

export interface EdDSAPublicJWK extends JsonWebKey {
    kty: "OKP",
    alg: "EdDSA",
    crv: "Ed25519",
    x: Base64Url
}

export interface EdDSAPrivateJWK extends EdDSAPublicJWK {
    d: Base64Url
}

export interface JWKSet {
    id?: string,
    publicJwk: EdDSAPublicJWK
    b64uPublicKey: Base64Url,
    privateJwk: EdDSAPrivateJWK,
    b64uPrivateKey: Base64Url  
}


//
// Standardize globally scoped agent messaging (DIDs); use Googles A2A message parts
//

export type Metadata = Record<string, unknown>;

export interface AgentMessage {
    from: DID;
    content: string | Part[];
    metadata?: Metadata | null;
    created?: Date;
}


/**
 * Represents a text segment within a message or artifact.
 *
 * This interface was referenced by `MySchema`'s JSON-Schema
 * via the `definition` "TextPart".
 */
export interface TextPart {
    /**
     * The type of this part, used as a discriminator. Always 'text'.
     */
    kind: "text";
    /**
     * Optional metadata associated with this part.
     */
    metadata?: {
      [k: string]: unknown;
    };
    /**
     * The string content of the text part.
     */
    text: string;
  }

  /**
   * Represents a file segment within a message or artifact. The file content can be
   * provided either directly as bytes or as a URI.
   *
   * This interface was referenced by `MySchema`'s JSON-Schema
   * via the `definition` "FilePart".
   */
  export interface FilePart {
    /**
     * The file content, represented as either a URI or as base64-encoded bytes.
     */
    file: FileWithBytes | FileWithUri;
    /**
     * The type of this part, used as a discriminator. Always 'file'.
     */
    kind: "file";
    /**
     * Optional metadata associated with this part.
     */
    metadata?: {
      [k: string]: unknown;
    };
  }

  /**
   * Represents a file with its content provided directly as a base64-encoded string.
   *
   * This interface was referenced by `MySchema`'s JSON-Schema
   * via the `definition` "FileWithBytes".
   */
  export interface FileWithBytes {
    /**
     * The base64-encoded content of the file.
     */
    bytes: string;
    /**
     * The MIME type of the file (e.g., "application/pdf").
     */
    mimeType?: string;
    /**
     * An optional name for the file (e.g., "document.pdf").
     */
    name?: string;
  }

  /**
   * Represents a file with its content located at a specific URI.
   *
   * This interface was referenced by `MySchema`'s JSON-Schema
   * via the `definition` "FileWithUri".
   */
  export interface FileWithUri {
    /**
     * The MIME type of the file (e.g., "application/pdf").
     */
    mimeType?: string;
    /**
     * An optional name for the file (e.g., "document.pdf").
     */
    name?: string;
    /**
     * A URL pointing to the file's content.
     */
    uri: string;
  }
  
  /**
   * Represents a structured data segment (e.g., JSON) within a message or artifact.
   *
   * This interface was referenced by `MySchema`'s JSON-Schema
   * via the `definition` "DataPart".
   */
  export interface DataPart {
    /**
     * The structured data content.
     */
    data: {
      [k: string]: unknown;
    };
    /**
     * The type of this part, used as a discriminator. Always 'data'.
     */
    kind: "data";
    /**
     * Optional metadata associated with this part.
     */
    metadata?: {
      [k: string]: unknown;
    };
  }

export type Part = TextPart | FilePart | DataPart;