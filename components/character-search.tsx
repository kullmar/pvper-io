import { useRouter } from "next/router";
import { useState } from "react";

export default function CharacterSearch() {
    const [inputVal, setInputVal] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [region, setRegion] = useState('eu');
    const [realm, setRealm] = useState('');

    const router = useRouter();

    function handleInputChange(val: string) {
        setInputVal(val);
        const v = val.trim();
        const split = v.split('-');
        if (split.length === 2) {
            const [characterName, realm] = split;
            setRealm(realm);
            setCharacterName(characterName);
        }
    }

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        if (region && characterName && realm) {
            router.push(`/${region}/${realm}/${characterName}`);
        }
    }

    return (
        <div className="flex items-center h-12 px-4 bg-surface space-x-2">
            <label htmlFor="character-search">Search character</label>
            <input
                value={inputVal}
                onChange={(event) => handleInputChange(event.target.value)}
                id="character-search"
                name="character-search"
                type="text"
                className="flex-1"
            ></input>
            <button onClick={(e) => handleClick(e)}>Search</button>
        </div>
    );
}
