import { getBnetAccessToken } from './bnet-oauth';

export interface CharacterQuery {
    characterName: string;
    realm: string;
    region: string;
}

export interface Statistics {
    id: number;
    last_updated_timestamp: number;
    name: string;
    quantity: number;
}

export interface StatisticsCategory {
    id: number;
    name: string;
    sub_categories?: StatisticsCategory[];
    statistics?: Statistics[];
}

export interface Realm {
    name: string;
    region: string;
}

let cachedRealms: Realm[];

export async function fetchAllRealms(): Promise<Realm[]> {
    if (cachedRealms) {
        cachedRealms;
    }

    const path = '/data/wow/realm/index';
    const mapper = (realmData: any, region: string) => ({
        name: realmData.name,
        region,
    });
    cachedRealms = await Promise.all([
        dynamicFetch(path, 'eu'),
        dynamicFetch(path, 'us'),
    ]).then(([euData, usData]) => [
        ...euData.realms.map((r) => mapper(r, 'eu')),
        ...usData.realms.map((r) => mapper(r, 'us')),
    ].sort((a, b) => a.name.localeCompare(b.name)));

    return cachedRealms;
}

export async function fetchCharacter(query: CharacterQuery) {
    return Promise.all([
        fetchCharacterMedia(query),
        fetchCharacter2v2(query),
        fetchCharacter3v3(query),
        fetchCharacterStatistics(query),
    ]).then(([media, twos, threes, statistics]) => ({
        media,
        twos,
        threes,
        statistics,
    }));
}

export async function fetchCharacterAchievements(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/achievements`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterStatistics(
    query: CharacterQuery
): Promise<StatisticsCategory[]> {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/achievements/statistics`;
    return profileFetch(endpoint, region).then((data) => data.categories);
}

export async function fetchCharacter2v2(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-bracket/2v2`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacter3v3(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-bracket/3v3`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterPvpSummary(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-summary`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterMedia(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/character-media`;
    return profileFetch(endpoint, region);
}

async function dynamicFetch(path: string, region: string) {
    return bnetFetch(path, region, 'dynamic');
}

async function profileFetch(path: string, region: string) {
    return bnetFetch(path, region, 'profile');
}

async function bnetFetch(path: string, region: string, namespace: string) {
    const url = constructUrl(path, region, namespace);
    const token = await getBnetAccessToken();
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
    });
    console.debug(`GET request to ${url}`);

    return fetch(url, { headers }).then((res) => (res.ok ? res.json() : null));
}

function constructUrl(path: string, region: string, namespace: string): string {
    let p = path.startsWith('/') ? path : `/${path}`;
    let queryParams = `?namespace=${namespace}-${region}&locale=en_US`;
    if (p.includes('?')) {
        const [url, qp] = p.split('?');
        p = url;
        queryParams += `&${qp}`;
    }
    return getBaseUrlForRegion(region) + p + queryParams;
}

function getBaseUrlForRegion(region: string): string {
    return `https://${region}.api.blizzard.com`;
}
