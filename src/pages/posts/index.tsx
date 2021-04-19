import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { getPrismicClient } from '../../services/prismic'
import styles from './styles.module.scss'
import moment from 'moment'

type Post = {
	slug: string;
	title: string;
	excerpt: string;
	updatedAt: string;
}

interface PostProps {
	posts: Post[];
}

export default function Posts({ posts }: PostProps) {
	return (
		<>
			<Head>
				<title>Pickles News - Posts</title>
			</Head>
			<main className={styles.container}>
				<div className={styles.posts}>
					{posts.map(post => (
						<Link key={post.slug} href={`/posts/${post.slug}`}>
							<a>
								<time>{post.updatedAt}</time>
								<strong>{post.title}</strong>
								<span>{post.excerpt}</span>
							</a>
						</Link>
					))}
				</div>
			</main>
		</>
	)
};


export const getStaticProps: GetStaticProps = async () => {

	const prismic = getPrismicClient()

	const response = await prismic.query([
		Prismic.Predicates.at('document.type', 'publication')
	], {
		fetch: ['publication.title', 'publication.content'],
		pageSize: 100,
	})
	const posts = response.results.map(post => {
		return {
			slug: post.uid,
			title: RichText.asText(post.data.title),
			excerpt: post.data.content.find(el => el.type === "paragraph")?.text ?? '',
			updatedAt: moment(new Date(post.last_publication_date)).locale('pt-br').format('LL')
		}
	})

	return {
		props: {
			posts,
		}
	}
}