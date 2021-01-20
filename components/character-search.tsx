import useSWR from 'swr'
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '../hooks/click-outside';
import { Character, Realm } from '../lib/wow-api';
import { Button } from './button';
import { useDebounce } from '../hooks/debounce';

type Props = {
    realms: Realm[];
    onSearchStarted?: (character: Character) => unknown;
    onSearchCompleted?: () => unknown;
};

const fetcher = async (url) => {
    const res = await fetch(url)
    const data = await res.json()
  
    if (res.status !== 200) {
      throw new Error(data.message)
    }
    return data
  }

export default function CharacterSearch({
    realms,
    onSearchStarted = null,
    onSearchCompleted = null,
}: Props) {
    console.log('Render');
    const [inputVal, setInputVal] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [realm, setRealm] = useState('');
    const [region, setRegion] = useState('eu');
    const [isAutocompleteVisible, setAutocompleteVisibility] = useState(false);
    const debouncedInput = useDebounce(inputVal.trim(), 300);
    console.log('Debounced input: ' + debouncedInput);

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

    const { data: autocompleteItems } = useSWR(() => debouncedInput.length > 1 && `/api/character?searchTerm=${debouncedInput}`, fetcher);

    function handleInputChange(val: string) {
        setInputVal(val);
        const v = val.trim();
        const split = v.split('-');
        if (split.length === 2) {
            const [characterNameInput, realmInput] = split;
            setCharacterName(characterNameInput);
            setRealm(realmInput.toLowerCase());
        } else {
            setCharacterName(v);
        }
    }

    function handleButtonClick(e: React.MouseEvent) {
        e.preventDefault();
        goToCharacter({ name: characterName, realm, region });
    }

    function handleAutocompleteClick(
        selectedRealm: string,
        selectedRegion: string
    ) {
        setInputVal(`${characterName}-${selectedRealm}`);
        setRealm(selectedRealm);
        setRegion(selectedRegion);
        setAutocompleteVisibility(false);
        goToCharacter({
            name: characterName,
            realm: selectedRealm,
            region: selectedRegion,
        });
    }

    function goToCharacter(character: Character) {
        if (character.name && character.realm && character.region) {
            if (onSearchCompleted) {
                router.events.on(
                    'routeChangeComplete',
                    handleRouteChangeComplete
                );
            }
            router.push(
                `/${character.region}/${encodeURIComponent(
                    character.realm
                )}/${encodeURIComponent(character.name)}`
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
                    id="character-search"
                    name="character-search"
                    type="text"
                    className="w-full"
                ></input>

                {isAutocompleteVisible && (
                    <ul
                        className="absolute w-full border-2 bg-surface rounded"
                        ref={ref}
                    >
                        {autocompleteItems.map((realm, index) => (
                            <li
                                key={index}
                                className="cursor-pointer hover:bg-gray-700"
                                onClick={() =>
                                    handleAutocompleteClick(
                                        realm.name,
                                        realm.region
                                    )
                                }
                            >
                                {characterName}-{realm.name} (
                                {realm.region.toUpperCase()})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Button onClick={(e) => handleButtonClick(e)}>Search</Button>
        </div>
    );
}
