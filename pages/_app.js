import '../styles/globals.css'
import { SWRConfig } from 'swr'
import axios from 'axios'

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher: (url) => axios.get(url).then(r => r.data) }}>
      <Component {...pageProps} />
    </SWRConfig>
  )
}

export default MyApp
