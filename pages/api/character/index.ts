import { NextApiRequest, NextApiResponse } from "next";
import { findCharacters } from "../../../lib/redis";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { searchTerm } = req.query;
    if (typeof searchTerm === 'string') {
        const autoSuggestions = await findCharacters(searchTerm);
        res.status(200).json(autoSuggestions);
    } else {
        res.status(200).json([]);
    }
}