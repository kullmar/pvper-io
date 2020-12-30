import ReactTooltip from 'react-tooltip';

export default function CurrentRating({ cr, bracket, wins, losses }) {
    return (
        <>
            <div data-tip data-for="current-rating">
                <h3>{bracket}</h3>
                <em>{cr}</em>
            </div>

            <ReactTooltip id="current-rating">
                <ul className="flex flex-col">
                    <li>Wins: {wins}</li>
                    <li>Losses: {losses}</li>
                    <li>Total: {wins + losses}</li>
                </ul>
            </ReactTooltip>
        </>
    );
}
