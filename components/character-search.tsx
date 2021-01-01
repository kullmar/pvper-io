import { useRouter } from 'next/router';
import { useState } from 'react';

export default function CharacterSearch({ realms }) {
    const initialAutocompleteRealms = realms.slice(0, 10);
    const [inputVal, setInputVal] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [realm, setRealm] = useState('');
    const [autocompleteRealms, setAutocompleteRealms] = useState(initialAutocompleteRealms);

    const router = useRouter();

    function handleInputChange(val: string) {
        setInputVal(val);
        const v = val.trim();
        const split = v.split('-');
        if (split.length === 2) {
            const [cname, realmInput] = split;
            setCharacterName(cname);
            setRealm(realmInput);
            setAutocompleteRealms(realms.filter(r => r.name.toLowerCase().startsWith(realmInput.toLowerCase())).slice(0, 10));
        } else {
            setCharacterName(val);
            setAutocompleteRealms(initialAutocompleteRealms);
        }
    }

    function handleButtonClick(e: React.MouseEvent) {
        e.preventDefault();
        if (characterName && realm) {
            router.push(`/eu/${realm}/${characterName}`);
        }
    }

    function handleAutocompleteClick(item) {
        setInputVal(`${item.characterName}-${item.realm}`);
        setRealm(item.realm);
        router.push(`/${item.region}/${item.realm.toLowerCase()}/${item.characterName}`);
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

                {inputVal.length > 2 && 
                    (
                        <ul className="absolute w-full border-2 bg-surface rounded">
                            {autocompleteRealms.map((r, index) => (
                                <li
                                    key={index}
                                    className="cursor-pointer hover:bg-gray-700"
                                    onClick={() =>
                                        handleAutocompleteClick({
                                            characterName,
                                            realm: r.name,
                                            region: r.region,
                                        })
                                    }
                                >
                                    {characterName}-{r.name} ({r.region.toUpperCase()})
                                </li>
                            ))}
                        </ul>
                    )
                }
            </div>

            <button onClick={(e) => handleButtonClick(e)}>Search</button>
        </div>
    );
}
