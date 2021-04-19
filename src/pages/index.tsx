import Head from 'next/head'
import { GetStaticProps } from 'next'
import { SubscribeButton } from '../components/SubscribeButton'
import styles from './home.module.scss'
import { stripe } from '../services/stripe'

interface HomeProps {
	product: {
		priceId: string;
		amount: number;
	}
}

export default function Home({ product }: HomeProps) {
	return (
		<>
			<Head>
				<title>Pickles News - Home</title>
			</Head>
			<main className={styles.contentContainer}>
				<section className={styles.hero}>
					<span>👏 Hey, Welcome</span>
					<h1>
						News about the <span>React</span> world.
					</h1>
					<p>
						Get all acess to all the publications <br />
						<span>for {product.amount} mounth</span>
					</p>
					<SubscribeButton priceId={product.priceId} />
				</section>
				<img src="/images/avatar.svg" alt="Girl coding" />
			</main>
		</>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve('price_1IgWtJIbAuKiUaJWb3q4T61b');

	const product = {
		priceId: price.id,
		amount: new Intl.NumberFormat('en-us', {
			style: 'currency',
			currency: 'USD'

		}).format(price.unit_amount / 100),

	};

	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24, // 24 hours
	}
};
