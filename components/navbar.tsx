import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center h-12 bg-surface px-8">
            <Link href="/">Logo</Link>

            <div>X connected users</div>
        </nav>
    );
}
