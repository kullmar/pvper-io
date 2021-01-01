import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { region, realm, characterName } = req.query;
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

}