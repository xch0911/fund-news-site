import '../styles/globals.css'
import { SWRConfig } from 'swr'
import axios from 'axios'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher: (url) => axios.get(url).then(r => r.data) }}>
      <Head>
        <link rel="icon" href="/asiafund.png" />
      </Head>
      <Component {...pageProps} />
    </SWRConfig>
  )
}

export default MyApp
