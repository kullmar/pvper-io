import Head from 'next/head';
import { GetServerSideProps } from 'next';
import CharacterSearch from '../components/character-search';
import Navbar from '../components/navbar';
import { fetchAllRealms, fetchCharacter } from '../lib/wow-api';
import Character from '../components/character';
import { useRouter } from 'next/router';
import { addRecentCheck, getRecentChecks } from '../lib/redis';
import { useState } from 'react';
import { LoadingSpinner } from '../components/loading-spinner';

export default function Home({ character, realms, recent }) {
    const [isLoading, setLoading] = useState(false);

    const router = useRouter();

    const showNotFound = !isLoading && router.asPath !== '/' && !character;

    return (
        <>
            <Head>
                <title>PvPer.IO</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar></Navbar>

            <div className="container mx-auto mt-40 flex flex-wrap space-y-2 md:space-x-2 md:space-y-0">
                

                <div className="flex flex-col flex-1 flex-shrink-0 space-y-2 min-w-full md:min-w-0">
                    <CharacterSearch realms={realms} onSearchStarted={() => setLoading(true)} onSearchCompleted={() => setLoading(false)} />

                    <div className="character-background bg-surface flex justify-center">
                        {isLoading && <LoadingSpinner></LoadingSpinner>}
                        {showNotFound && <h2 className="mt-8">Not found</h2>}
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
            recent: await getRecentChecks(),
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
                addRecentCheck(character);
            }
        }
    }

    return props;
};
