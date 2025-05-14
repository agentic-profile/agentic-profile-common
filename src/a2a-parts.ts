/**
 * This file is derived from https://github.com/google/A2A.git
 * and under the Apache 2.0 License.
 * 
 * It has been modified to add support for the Agentic Profile, as
 * well as other enhancements.
 */

export interface FileContentBase {
    /**
     * Optional name of the file.
     * @default null
     */
    name?: string | null;

    /**
     * Optional MIME type of the file content.
     * @default null
     */
    mimeType?: string | null;

    /**
     * File content encoded as a Base64 string. Use this OR `uri`.
     */
    bytes?: string | null;

    /**
     * URI pointing to the file content. Use this OR `bytes`.
     */
    uri?: string | null;
}

export type FileContentBytes = FileContentBase & {
    /* File content encoded as a Base64 string. Use this OR `uri`. */
    bytes: string;
    uri?: never;
};

export type FileContentUri = FileContentBase & {
    /** URI pointing to the file content. */
    uri: string;
    bytes?: never;
};

/**
 * Represents the content of a file, either as base64 encoded bytes or a URI.
 * @description Ensures that either 'bytes' or 'uri' is provided, but not both. (Note: This constraint is informational in TypeScript types).
 */
export type FileContent = FileContentBytes | FileContentUri;

/**
 * Represents a part of a message containing text content.
 */
export interface TextPart {
    type: "text";

    /**
     * The text content.
     */
    text: string;

    /**
     * Optional metadata associated with this text part.
     */
    metadata?: Record<string, unknown> | null;
}

/**
 * Represents a part of a message containing file content.
 */
export interface FilePart {
    /**
     * Type identifier for this part.
     */
    type: "file";

    /**
     * The file content, provided either inline or via URI.
     */
    file: FileContent;

    /**
     * Optional metadata associated with this file part.
     */
    metadata?: Record<string, unknown> | null;
}

/**
 * Represents a part of a message containing structured data (JSON).
 */
export interface DataPart {
    /**
     * Type identifier for this part.
     */
    type: "data";

    /**
     * The structured data content as a JSON object.
     */
    data: Record<string, unknown>;

    /**
     * Optional metadata associated with this data part.
     */
    metadata?: Record<string, unknown> | null;
}

/**
 * Represents a single part of a multi-part message. Can be text, file, or data.
 */
export type Part = TextPart | FilePart | DataPart;

/**
 * Represents an artifact generated or used by a task, potentially composed of multiple parts.
 */
export interface Artifact {
    /**
     * Optional name for the artifact.
     * @default null
     */
    name?: string | null;

    /**
     * Optional description of the artifact.
     * @default null
     */
    description?: string | null;

    /**
     * The constituent parts of the artifact.
     */
    parts: Part[];

    /**
     * Optional index for ordering artifacts, especially relevant in streaming or updates.
     * @default 0
     */
    index?: number;

    /**
     * Optional flag indicating if this artifact content should append to previous content (for streaming).
     * @default null
     */
    append?: boolean | null;

    /**
     * Optional metadata associated with the artifact.
     * @default null
     */
    metadata?: Record<string, unknown> | null;

    /**
     * Optional flag indicating if this is the last chunk of data for this artifact (for streaming).
     * @default null
     */
    lastChunk?: boolean | null;
}

/**
 * Represents a message exchanged between a user and an agent.
 */
export interface Message {
    /**
     * The role of the sender (user or agent).
     */
    role: "user" | "agent";

    /**
     * The content of the message, composed of one or more parts.
     */
    parts: Part[];

    /**
     * Optional metadata associated with the message.
     * @default null
     */
    metadata?: Record<string, unknown> | null;
}
