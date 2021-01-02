import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '../effects/click-outside';

export default function CharacterSearch({ realms }) {
    const initialAutocompleteItems = realms.slice(0, 10);
    const [inputVal, setInputVal] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [realm, setRealm] = useState('');
    const [autocompleteItems, setAutocompleteItems] = useState(initialAutocompleteItems);
    const [isAutocompleteVisible, setAutocompleteVisible] = useState(false);

    const router = useRouter();
    const ref = useRef();

    useOnClickOutside(ref, () => setAutocompleteVisible(false));

    function handleInputChange(val: string) {
        setInputVal(val);
        const v = val.trim();
        const split = v.split('-');
        if (split.length === 2) {
            const [cname, realmInput] = split;
            setCharacterName(cname);
            setRealm(realmInput);
            setAutocompleteItems(realms.filter(r => r.name.toLowerCase().startsWith(realmInput.toLowerCase())).slice(0, 10));
        } else {
            setCharacterName(v);
            setAutocompleteItems(initialAutocompleteItems);
        }

        setAutocompleteVisible(v.length >= 2);
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
        setAutocompleteVisible(false);
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

                {isAutocompleteVisible && 
                    (
                        <ul className="absolute w-full border-2 bg-surface rounded" ref={ref}>
                            {autocompleteItems.map((r, index) => (
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
