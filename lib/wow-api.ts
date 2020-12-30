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

export async function fetchCharacter(query: CharacterQuery) {
    return Promise.all([
        fetchCharacterMedia(query),
        fetchCharacter2v2(query),
        fetchCharacter3v3(query),
        fetchCharacterStatistics(query)
    ]).then(([media, twos, threes, statistics]) => ({ media, twos, threes, statistics }));
}

export async function fetchCharacterAchievements(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/achievements`;
    return fetchBnet(endpoint, region);
}

export async function fetchCharacterStatistics(query: CharacterQuery): Promise<StatisticsCategory[]> {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/achievements/statistics`;
    return fetchBnet(endpoint, region).then(data => data.categories)
}

export async function fetchCharacter2v2(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-bracket/2v2`;
    return fetchBnet(endpoint, region);
}

export async function fetchCharacter3v3(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-bracket/3v3`;
    return fetchBnet(endpoint, region);
}

export async function fetchCharacterPvpSummary(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/pvp-summary`;
    return fetchBnet(endpoint, region);
}

export async function fetchCharacterMedia(query: CharacterQuery) {
    const { region, realm, characterName } = query;
    const endpoint = `/profile/wow/character/${realm}/${characterName}/character-media`;
    return fetchBnet(endpoint, region);
}

async function fetchBnet(path: string, region: string) {
    const url = constructUrl(path, region);
    const token = await getBnetAccessToken();
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
    });
    console.debug(`GET request to ${url}`);

    return fetch(url, { headers }).then((res) => (res.ok ? res.json() : null));
}

function constructUrl(path: string, region: string): string {
    let p = path.startsWith('/') ? path : `/${path}`;
    let queryParams = `?namespace=profile-${region}&locale=en_US`;
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
