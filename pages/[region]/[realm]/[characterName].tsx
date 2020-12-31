import Head from 'next/head';
import { useRouter } from 'next/router'
import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { fetchCharacter, CharacterQuery } from '../../../lib/wow-api';
import CurrentRating from '../../../components/current-rating';
import Navbar from '../../../components/navbar';
import CharacterSearch from '../../../components/character-search';

export default function Character({ arena, media }) {
    return (
        <>
            <Head>
                <title>PvPer.IO</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar></Navbar>

            <div className="container mx-auto mt-40 flex flex-wrap space-x-2">
                <div className="flex flex-col flex-1 flex-shrink-0 space-y-2">
                    <CharacterSearch />

                    <div className="character-background bg-surface flex flex-col p-8 space-y-8">
                        <div>
                            <img
                                className="avatar"
                                src={media.avatarImageUrl}
                            />
                        </div>

                        <div className="flex justify-around">
                            <CurrentRating
                                bracket="2v2"
                                cr={arena.twos.cr}
                                wins={arena.twos.wins}
                                losses={arena.twos.losses}
                            />
                            <CurrentRating
                                bracket="3v3"
                                cr={arena.threes.cr}
                                wins={arena.threes.wins}
                                losses={arena.threes.losses}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex-shrink-0 bg-surface">
                    Recent searches
                </div>
            </div>

            <style jsx>
                {`
                    .character-background {
                        background-image: url(${media.characterImageUrl});
                        background-size: cover;
                        background-position: center;
                        min-height: 800px;
                    }

                    .avatar {
                        height: 90px;
                        width: 90px;
                    }
                `}
            </style>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    let props = {
        props: {},
    };

    const { region, realm, characterName } = query;
    console.info(
        `Fetching character info for ${characterName}-${realm}-${region}`
    );
    const data = await fetchCharacter(
        query as unknown as CharacterQuery
    );

    if (data) {
        const arenaStatistics = reduceArenaStatistics(data);
        const media = reduceMedia(data.media);

        props = {
            props: {
                arena: arenaStatistics,
                media,
            },
        };
    }

    return props;
};

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
