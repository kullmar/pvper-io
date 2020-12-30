import Head from 'next/head';
import Navbar from '../components/navbar';
import Button from '../components/button';
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { CharacterQuery, fetchCharacter } from '../lib/wow-api';
import CurrentRating from '../components/current-rating';

export default function Home(props) {
    const [inputVal, setInputVal] = useState('');

    return (
        <>
            <Head>
                <title>PvPer.IO</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar></Navbar>

            <div className="container mx-auto mt-40 flex flex-wrap space-x-2">
                <div className="flex flex-col flex-1 flex-shrink-0 space-y-2">
                    <div className="flex items-center h-12 px-4 bg-surface space-x-2">
                        <label htmlFor="character-search">
                            Search character
                        </label>
                        <input
                            value={inputVal}
                            onChange={(val) => setInputVal(val.target.value)}
                            id="character-search"
                            name="character-search"
                            type="text"
                            className="flex-1"
                        ></input>
                        <Button>Search</Button>
                    </div>

                    <div className="character-background bg-surface flex flex-col p-8 space-y-8">
                        <div>
                            <img className="avatar" src={props.media.avatarImageUrl}/>
                        </div>

                        <div className="flex justify-around">
                            <CurrentRating bracket="2v2" cr={props.arena.twos.cr} wins={props.arena.twos.wins} losses={props.arena.twos.losses} />
                            <CurrentRating bracket="3v3" cr={props.arena.threes.cr} wins={props.arena.threes.wins} losses={props.arena.threes.losses} />
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
                        background-image: url(${props.media.characterImageUrl});
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props = {
        props: {},
    };

    if (containsCharacterQuery(context.query)) {
        const { region, realm, characterName } = context.query;
        console.info(
            `Fetching character info for ${characterName}-${realm}-${region}`
        );
        const character = await fetchCharacter(
            (context.query as unknown) as CharacterQuery
        );
        if (character) {
            const arenaStatistics = reduceArenaStatistics(character);
            const media = reduceMedia(character.media);

            props = {
                props: {
                    arena: arenaStatistics,
                    media,
                },
            };
        }
    }

    return props;
};

function containsCharacterQuery(query: ParsedUrlQuery): boolean {
    return (
        Boolean(query.region) &&
        Boolean(query.realm) &&
        Boolean(query.characterName)
    );
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
            losses: character.twos.season_match_statistics.lost
        },
        threes: {
            cr: character.threes.rating,
            max: arenaStatistics.find(
                (statistic) => statistic.name === 'Highest 3v3 personal rating'
            ).quantity,
            wins: character.threes.season_match_statistics.won,
            losses: character.threes.season_match_statistics.lost
        },
    };
}

function reduceMedia(media: any) {
    const avatarImageUrl = media.assets.find(a => a.key === "avatar").value;
    const characterImageUrl = media.assets.find((a) => a.key === 'main').value;
    return {
        avatarImageUrl,
        characterImageUrl,
    };
}
