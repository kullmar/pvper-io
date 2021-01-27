import Head from 'next/head';
import { GetServerSideProps } from 'next';
import CharacterSearch from '../components/character-search';
import Navbar from '../components/navbar';
import { fetchAllRealms, fetchCharacter } from '../lib/wow-api';
import Character from '../components/character';
import { useRouter } from 'next/router';
import { upsertCharacterCache, getRecentChecks } from '../lib/redis';
import React, { useState } from 'react';
import { LoadingSpinner } from '../components/loading-spinner';
import Link from 'next/link';

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
                    <CharacterSearch
                        realms={realms}
                        onSearchStarted={() => setLoading(true)}
                        onSearchCompleted={() => setLoading(false)}
                    />

                    <div className="character-background bg-surface flex justify-center">
                        {isLoading && <LoadingSpinner></LoadingSpinner>}
                        {showNotFound && <h2 className="mt-8">Not found</h2>}
                        <Character character={character} />
                    </div>
                </div>

                <div className="flex-1 flex-shrink-0 flex-col bg-surface">
                    <h2>Recent searches</h2>
                    {recent.length > 0 && (
                        <ul>
                            {recent.map((char, index) => (
                                <li key={index}>
                                    <Link
                                        href={`/${char.region}/${encodeURIComponent(char.realm)}/${encodeURIComponent(char.name)}`}
                                    ><a>{char.name}-{char.realm}-{char.region}</a></Link>
                                </li>
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
        const [region, realmSlug, characterName] = query.character;
        if (Boolean(region) && Boolean(realmSlug) && Boolean(characterName)) {
            console.info(
                `Fetching character info for ${characterName}-${realmSlug}-${region}`
            );
            const character = await fetchCharacter({
                region,
                realmSlug,
                characterName,
            });
            console.info(JSON.stringify(character))

            if (character) {
                props.props['character'] = character;
                upsertCharacterCache(character);
            }
        }
    }

    return props;
};
