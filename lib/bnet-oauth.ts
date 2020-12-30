import { config } from "../config";
import { AccessToken, ClientCredentials, ModuleOptions } from 'simple-oauth2';

const { bnetUser, bnetPassword } = config;

if (!bnetUser) {
    throw new Error('Please define the Battle.net user in .env.local');
}

if (!bnetPassword) {
    throw new Error('Please define the Battle.net user password in .env.local');
}

let cachedToken: AccessToken | Promise<AccessToken>;

export async function getBnetAccessToken(): Promise<string> {
    if (cachedToken) {
        const token = await Promise.resolve(cachedToken);
        if (token.expired()) {
            console.info('Cached token expired');
            cachedToken = null;
        } else {
            console.info('Using cached token');
            return reduceToken(token);
        }
    }

    if (!cachedToken) {
        console.info('Fetching new auth token');
        const config: ModuleOptions = {
            client: {
                id: bnetUser,
                secret: bnetPassword
            },
            auth: {
                tokenHost: 'https://eu.battle.net/oauth/token'
            }
        }
        const client = new ClientCredentials(config);

        cachedToken = client.getToken({});
    }

    const token = await Promise.resolve(cachedToken);
    console.info(`Received new token: ${JSON.stringify(token)}`);

    return reduceToken(token);
}

function reduceToken(token: AccessToken): string {
    return token.token['access_token'];
}