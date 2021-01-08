import Head from 'next/head';
import { GetServerSideProps } from 'next';
import CharacterSearch from '../components/character-search';
import Navbar from '../components/navbar';
import { CharacterQuery, fetchAllRealms, fetchCharacter } from '../lib/wow-api';
import Character from '../components/character';
import { useRouter } from 'next/router';

export const previousSearches: Map<string, Set<CharacterQuery>> = new Map();

export default function Home({ character, realms, recent }) {
    const router = useRouter();

    const showNotFound = router.asPath !== '/' && !character;

    return (
        <>
            <Head>
                <title>PvPer.IO</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar></Navbar>

            <div className="container mx-auto mt-40 flex flex-wrap space-y-2 md:space-x-2 md:space-y-0">
                <div className="flex flex-col flex-1 flex-shrink-0 space-y-2 min-w-full md:min-w-0">
                    <CharacterSearch realms={realms} />

                    <div className="character-background bg-surface">
                        {showNotFound && <h2>Not found</h2>}
                        <Character character={character} />
                    </div>
                </div>

                <div className="flex-1 flex-shrink-0 flex-col bg-surface">
                    Recent searches
                    {recent.length > 0 && (
                        <ul>
                            {recent.map((r) => (
                                <li key={r}>{r}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <style jsx>
                {`
                    .character-background {
                        background-image: url(${character
                            ? character.media.characterImageUrl
                            : ''});
                        background-size: cover;
                        background-position: center;
                        min-height: 800px;
                    }
                `}
            </style>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    let props = {
        props: {
            realms: await fetchAllRealms(),
            recent: Array.from(previousSearches.keys()),
        },
    };

    if (
        query.character &&
        Array.isArray(query.character) &&
        query.character.length === 3
    ) {
        const [region, realm, characterName] = query.character;
        if (Boolean(region) && Boolean(realm) && Boolean(characterName)) {
            console.info(
                `Fetching character info for ${characterName}-${realm}-${region}`
            );
            const character = await fetchCharacter({
                region,
                realm,
                characterName,
            });

            if (character) {
                props.props['character'] = character;
            }

            if (previousSearches.has(characterName)) {
                previousSearches
                    .get(characterName)
                    .add({ characterName, realm, region });
            } else {
                previousSearches.set(
                    characterName,
                    new Set([{ characterName, realm, region }])
                );
            }
        }
    }

    return props;
};
