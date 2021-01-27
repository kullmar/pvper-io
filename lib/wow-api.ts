import { getBnetAccessToken } from './bnet-oauth';

export interface CharacterID {
    characterName: string;
    realmSlug: string;
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
    slug: string;
    region: string;
}

export interface Character {
    name: string;
    realm: Realm;
    region: string;
    media?: any;
    arena?: any;
}

let cachedRealms: Realm[];

export async function fetchAllRealms(): Promise<Realm[]> {
    if (cachedRealms) {
        return cachedRealms;
    }

    const path = '/data/wow/realm/index';
    const mapper = (realmData: Realm, region: string) => ({
        ...realmData,
        region,
    });
    cachedRealms = await Promise.all([
        dynamicFetch(path, 'eu'),
        dynamicFetch(path, 'us'),
    ]).then(([euData, usData]) =>
        [
            ...euData.realms.map((r) => mapper(r, 'eu')),
            ...usData.realms.map((r) => mapper(r, 'us')),
        ].sort((a, b) => a.name.localeCompare(b.name))
    );

    return cachedRealms;
}

export async function fetchCharacter(
    query: CharacterID
): Promise<Character | null> {
    return Promise.all([
        fetchCharacterMedia(query),
        fetchCharacter2v2(query),
        fetchCharacter3v3(query),
        fetchCharacterStatistics(query),
    ])
        .then(([media, twos, threes, statistics]) => ({
            name: media.character.name,
            realm: media.character.realm,
            region: query.region,
            media: reduceMedia(media),
            arena: reduceArenaStatistics({ twos, threes, statistics }),
        }))
        .catch((err: Error) => {
            console.error(`Failed to fetch character info`);
            return null;
        });
}

export async function fetchCharacterAchievements(query: CharacterID) {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/achievements`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterStatistics(
    query: CharacterID
): Promise<StatisticsCategory[]> {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/achievements/statistics`;
    return profileFetch(endpoint, region).then((data) => data.categories);
}

export async function fetchCharacter2v2(query: CharacterID) {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/pvp-bracket/2v2`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacter3v3(query: CharacterID) {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/pvp-bracket/3v3`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterPvpSummary(query: CharacterID) {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/pvp-summary`;
    return profileFetch(endpoint, region);
}

export async function fetchCharacterMedia(query: CharacterID) {
    const { region, realmSlug, characterName } = query;
    const endpoint = `${getCharacterEndpoint(
        realmSlug,
        characterName
    )}/character-media`;
    return profileFetch(endpoint, region);
}

function getCharacterEndpoint(realm: string, characterName: string) {
    return `/profile/wow/character/${encodeURIComponent(
        realm
    )}/${encodeURIComponent(characterName)}`;
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

    return fetch(url, { headers }).then((res) => {
        if (!res.ok) {
            throw new Error();
        }

        return res.json();
    });
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

function reduceArenaStatistics(character) {
    const arenaStatistics = character.statistics
        .find((category: any) => category.name === 'Player vs. Player')
        .sub_categories.find(
            (category: any) => category.name === 'Rated Arenas'
        ).statistics;

    return {
        twos: {
            cr: character.twos.rating,
            max: arenaStatistics.find(
                (statistic) => statistic.name === 'Highest 2v2 personal rating'
            ).quantity,
            wins: character.twos.season_match_statistics.won,
            losses: character.twos.season_match_statistics.lost,
        },
        threes: {
            cr: character.threes.rating,
            max: arenaStatistics.find(
                (statistic) => statistic.name === 'Highest 3v3 personal rating'
            ).quantity,
            wins: character.threes.season_match_statistics.won,
            losses: character.threes.season_match_statistics.lost,
        },
    };
}

function reduceMedia(media: any) {
    const avatarImageUrl = media.assets.find((a) => a.key === 'avatar').value;
    const characterImageUrl = media.assets.find((a) => a.key === 'main').value;
    return {
        avatarImageUrl,
        characterImageUrl,
    };
}
