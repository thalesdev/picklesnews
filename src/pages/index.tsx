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

				<img src="/images/avatar.svg" alt="Girl coding" />
				<section className={styles.hero}>
					<span>Olá, bem vindo ao Pickles!</span>
					<h1>
						Aqui você tem acesso a diversos conteúdos sobre problemas de <span>programação</span>.
					</h1>
					<p>
						Tenha acesso a todas as publicações<br />
						<span>por apenas {product.amount} por mês</span>
					</p>
					<SubscribeButton priceId={product.priceId} />
				</section>
			</main>
		</>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const price = await stripe.prices.retrieve('price_1IiYTEIbAuKiUaJWf8zOBQPj');

	const product = {
		priceId: price.id,
		amount: new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'

		}).format(price.unit_amount / 100),

	};

	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24, // 24 hours
	}
};
