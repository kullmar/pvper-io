import redis, { RedisClient } from 'redis';
import { promisify } from 'util';
import { Character } from './wow-api';

const DEFAULT_LIMIT = 20;

console.info('Initializing Redis client');
const client = redis.createClient();
client.on('ready', () => 'Redis client initialization successful');

client.on('error', (error) => {
    throw Error('Redis error: ' + error);
});

const zrangeAsync = promisify(client.zrange).bind(client);
const zscanAsync = promisify(client.zscan).bind(client);

export function addRecentCheck(character: Character) {
    const characterId = `${character.name}-${character.realm}-${character.region}`;
    client.zadd('last-search', new Date().getDate(), characterId);
}

export function getRecentChecks(limit = DEFAULT_LIMIT) {
    return zrangeAsync('last-search', 0, limit);
}

export function findCharacters(searchTerm: string) {
    return zscanAsync('last-search', 0, 'MATCH', `${searchTerm}*`)
}
