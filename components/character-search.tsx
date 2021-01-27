import useSWR from 'swr';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '../hooks/click-outside';
import { Character, CharacterID, Realm } from '../lib/wow-api';
import { Button } from './button';
import { useDebounce } from '../hooks/debounce';

type Props = {
    realms: Realm[];
    defaultRegion?: string;
    onSearchStarted?: (character: CharacterID) => unknown;
    onSearchCompleted?: () => unknown;
};

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data;
};

export default function CharacterSearch({
    realms,
    defaultRegion = 'eu',
    onSearchStarted = null,
    onSearchCompleted = null,
}: Props) {
    const [inputVal, setInputVal] = useState('');
    const [isAutocompleteVisible, setAutocompleteVisibility] = useState(false);
    const debouncedInput = useDebounce(inputVal.trim(), 300);

    const router = useRouter();
    const ref = useRef();

    const handleRouteChangeComplete = () => {
        if (onSearchCompleted) {
            onSearchCompleted();
        }
    };
    useEffect(() => {
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
    });

    useOnClickOutside(ref, () => setAutocompleteVisibility(false));

    const { data: autocompleteItems } = useSWR(
        () =>
            debouncedInput.length > 1 &&
            `/api/character?searchTerm=${debouncedInput}`,
        fetcher
    );

    function handleInputChange(val: string) {
        setInputVal(val);
    }

    function handleButtonClick(e: React.MouseEvent) {
        e.preventDefault();
        let characterName;
        let realmSlug;
        const trimmedInput = inputVal.trim();
        const split = trimmedInput.split('-');
        if (split.length === 2) {
            characterName = split[0];
            const realmName = split[1];
            realmSlug = realms.find(
                (r) =>
                    r.name.toLowerCase() === realmName.toLowerCase() &&
                    r.region === defaultRegion
            )?.slug;
        }

        if (characterName && realmSlug) {
            goToCharacter({ characterName, realmSlug, region: defaultRegion });
        }
    }

    function handleAutocompleteClick(char: Character) {
        setInputVal(`${char.name}-${char.realm.name}`);
        setAutocompleteVisibility(false);
        goToCharacter({
            characterName: char.name,
            realmSlug: char.realm.slug,
            region: char.region,
        });
    }

    function goToCharacter(character: CharacterID) {
        if (character.characterName && character.realmSlug && character.region) {
            if (onSearchCompleted) {
                router.events.on(
                    'routeChangeComplete',
                    handleRouteChangeComplete
                );
            }
            router.push(
                `/${character.region}/${
                    character.realmSlug
                }/${encodeURIComponent(character.characterName)}`
            );
            if (onSearchStarted) {
                onSearchStarted(character);
            }
        }
    }

    return (
        <div className="flex items-center h-12 px-4 bg-surface space-x-2">
            <label htmlFor="character-search">Search character</label>
            <div className="relative flex-1">
                <input
                    value={inputVal}
                    onChange={(event) => handleInputChange(event.target.value)}
                    onFocus={() => setAutocompleteVisibility(true)}
                    id="character-search"
                    name="character-search"
                    type="text"
                    className="w-full"
                    placeholder="Imitation-Stormreaver"
                ></input>

                {isAutocompleteVisible && autocompleteItems && (
                    <ul
                        className="absolute w-full border-2 bg-surface rounded"
                        ref={ref}
                    >
                        {autocompleteItems.map((char, index) => (
                            <li
                                key={index}
                                className="cursor-pointer hover:bg-gray-700"
                                onClick={() => handleAutocompleteClick(char)}
                            >
                                {char.name}-{char.realm} (
                                {char.region.toUpperCase()})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Button onClick={(e) => handleButtonClick(e)}>Search</Button>
        </div>
    );
}
