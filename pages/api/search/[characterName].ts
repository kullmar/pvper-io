import { NextApiRequest, NextApiResponse } from "next";
import { CharacterQuery } from "../../../lib/wow-api";
import { previousSearches } from "../../[[...character]]";

export default function handler(req: NextApiRequest, res: NextApiResponse<CharacterQuery[]>) {
    const { characterName } = req.query;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ data: previousSearches.get(characterName as string) || [] }))
}