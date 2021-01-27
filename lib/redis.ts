import redis, { RedisClient } from 'redis';
import { promisify } from 'util';
import { Character } from './wow-api';

const DEFAULT_LIMIT = 20;

console.info('Initializing Redis client');
const client = redis.createClient();
client.on('ready', () => 'Redis client initialized');

client.on('error', (error) => {
    throw Error('Redis error: ' + error);
});

const zrangeAsync = promisify(client.zrange).bind(client);
const hscanAsync = promisify(client.hscan).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(client);

export function upsertCharacterCache(character: Character) {
    const characterId = `character:${character.name}-${character.realm.slug}-${character.region}`.toLowerCase();
    client.hmset(characterId, [
        'name',
        character.name,
        'realmName',
        character.realm.name,
        'realmSlug',
        character.realm.slug,
        'region',
        character.region,
    ]);
    client.zadd('recent-searches', new Date().getDate(), characterId);
}

export function getRecentChecks(limit = DEFAULT_LIMIT): Promise<Character[]> {
    return zrangeAsync('recent-searches', 0, limit).then(
        (characterIds: string[] | undefined) => {
            if (!characterIds || characterIds.length === 0) {
                return [];
            }

            return Promise.all(characterIds.map((id) => hgetallAsync(id)));
        }
    );
}

export function findCharacters(searchTerm: string) {
    return hscanAsync(`character`, 0, 'MATCH', `${searchTerm.toLowerCase()}*`)
        .then((res) => {
            if (res && Array.isArray(res) && res.length === 2) {
                return Promise.all(
                    res[1]
                        .filter((_element, index) => index % 2 === 0)
                        .map((id) => {
                            return hgetallAsync(id);
                        })
                );
            }
            return [];
        })
        .then();
}
