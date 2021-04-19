import { AppProps } from 'next/app'
import { Header } from '../components/Header'
import { Provider as NexthAuthProvider } from 'next-auth/client'

import '../styles/global.scss'
function MyApp({ Component, pageProps }: AppProps) {
	return (
		<NexthAuthProvider session={pageProps.session}>
			<Header />
			<Component {...pageProps} />
		</NexthAuthProvider>
	)
}

export default MyApp
