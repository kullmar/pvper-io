import Head from 'next/head';
import Navbar from '../components/navbar';
import { useState } from 'react';
import CharacterSearch from '../components/character-search';

export default function Home(props) {
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
                    </div>
                </div>

                <div className="flex-1 flex-shrink-0 bg-surface">
                    Recent searches
                </div>
            </div>

            <style jsx>
                {`
                    .character-background {
                        min-height: 800px;
                    }
                `}
            </style>
        </>
    );
}