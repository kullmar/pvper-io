import ReactTooltip from 'react-tooltip';

export default function CurrentRating({ cr, bracket, wins, losses }) {
    const tooltipId = `current-rating-tooltip--${bracket}`;

    return (
        <>
            <div data-tip data-for={tooltipId} className="bg-black bg-opacity-50 p-4 w-52 h-30">
                <h3>{bracket}</h3>
                <em>{cr}</em>
            </div>

            <ReactTooltip id={tooltipId}>
                <ul className="flex flex-col">
                    <li>Wins: {wins}</li>
                    <li>Losses: {losses}</li>
                    <li>Total: {wins + losses}</li>
                </ul>
            </ReactTooltip>
        </>
    );
}
