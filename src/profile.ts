import {
	JsonWebKey,
	VerificationMethod
} from "did-resolver";
import {
    AgenticProfile,
    AgentService,
    JWKSet
} from "./models.js"


type ProfileTemplate = {
    name?: string
}

type ServiceTemplate = {
    subtype: string,
    url: string
}

type Params = {
    template?: ProfileTemplate,
    services: ServiceTemplate[],
    createJwk: ()=>Promise<JsonWebKey>
}

export async function createAgenticProfile({ template = {}, services, createJwk }: Params ) {
    if( !createJwk )
        throw new Error("Missing createJwk parameter");

    const keyring: JWKSet[] = [];
    const service: AgentService[] = [];
    for( const { subtype, url } of services ) {
        if( !subtype )
            throw new Error("createAgenticProfile() missing subtype");
        if( !url )
            throw new Error("createAgenticProfile() missing url");

        const jwk = await createJwk();
        const vmid = `#agent-${subtype}-key-0`;
        keyring.push({...jwk, id: vmid } as any);

        const verificationMethod = {
            id: vmid,
            type: "JsonWebKey2020",
            publicKeyJwk: jwk.publicJwk
        } as VerificationMethod;

        service.push({
            name: `${subtype} agent`,
            id: `#agent-${subtype}`,
            type: `Agentic/${subtype}`,
            serviceEndpoint: url,
            capabilityInvocation: [
                verificationMethod
            ] 
        });
    };

    const generalJwk = await createJwk();
    const vmid = `#identity-key`;
    keyring.push({ ...generalJwk, id: vmid } as any);

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
                publicKeyJwk: generalJwk.publicJwk
            } as VerificationMethod
        ],
        service
    } as AgenticProfile;

    return { profile, keyring, b64uPublicKey: generalJwk.b64uPublicKey };
}