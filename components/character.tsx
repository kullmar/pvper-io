import CurrentRating from "./current-rating";

export default function Character({character}) {
    if (!character) {
        return null;
    }

    return (
            <div className="flex flex-col p-8 space-y-8">
                <div>
                    <img
                        className="w-24 h-24"
                        src={character.media.avatarImageUrl}
                    />
                </div>

                <div className="flex justify-around">
                    <CurrentRating
                        bracket="2v2"
                        cr={character.arena.twos.cr}
                        wins={character.arena.twos.wins}
                        losses={character.arena.twos.losses}
                    />
                    <CurrentRating
                        bracket="3v3"
                        cr={character.arena.threes.cr}
                        wins={character.arena.threes.wins}
                        losses={character.arena.threes.losses}
                    />
                </div>
            </div>
        );
}