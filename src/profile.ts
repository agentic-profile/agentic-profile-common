import { VerificationMethod } from "did-resolver";
import {
    AgenticProfile,
    AgentService,
    JWKSet
} from "./types.js";


type ProfileTemplate = {
    name?: string
}

export type ServiceTemplate = {
    name?: string,                // service name, defaults to `${type} ${id} agent`
    type: "a2a" | "mcp" | string, // case insensitive
    id: string,                   // service id without leading '#'
    url: string
}

type Params = {
    template?: ProfileTemplate,
    services?: ServiceTemplate[],
    createJwkSet: () => Promise<JWKSet>
}

export async function createAgenticProfile({ template = {}, services = [], createJwkSet }: Params) {
    if (!createJwkSet)
        throw new Error("Missing createJwk parameter");

    const keyring: JWKSet[] = [];
    const service: AgentService[] = [];
    for (const { name, type, id, url } of services) {
        if (!(id && type))
            throw new Error("createAgenticProfile() missing id or type");
        if (!url)
            throw new Error("createAgenticProfile() missing url");

        const jwkSet = await createJwkSet();
        const vmid = `#agent-${id}-key-0`;
        keyring.push({ ...jwkSet, id: vmid } as any);

        const verificationMethod = {
            id: vmid,
            type: "JsonWebKey2020",
            publicKeyJwk: jwkSet.publicJwk
        } as VerificationMethod;

        service.push({
            name: name ?? `${type} ${id} agent`,
            id: `#${id}`,
            type,
            serviceEndpoint: url,
            capabilityInvocation: [
                verificationMethod
            ]
        });
    };

    const generalJwkSet = await createJwkSet();
    const vmid = `#identity-key`;
    keyring.push({ ...generalJwkSet, id: vmid } as any);

    const profile = {
        "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1",
            "https://iamagentic.org/ns/agentic-profile/v1"
        ],
        id: "TBD",
        ...template,
        verificationMethod: [
            {
                id: vmid,
                type: "JsonWebKey2020",
                publicKeyJwk: generalJwkSet.publicJwk
            } as VerificationMethod
        ],
        service
    } as AgenticProfile;

    return { profile, keyring, b64uPublicKey: generalJwkSet.b64uPublicKey };
}
