import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>PvPer.IOd</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="flex justify-between items-center h-12 bg-black text-white px-4">
        <a>Logo</a>

        <ul>
          <li>Home</li>
        </ul>

        <div>
          X connected users
        </div>
      </nav>
    </div>
  )
}
