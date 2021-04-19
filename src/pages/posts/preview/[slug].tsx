import { GetStaticPaths, GetStaticProps } from "next";
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from "prismic-dom";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from '../post.module.scss';
import { getPrismicClient } from "../../../services/prismic";
import { useSession } from "next-auth/client";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";

interface PostPreviewProps {
	post: {
		slug: string;
		title: string;
		author: string;
		estimatedReadingTime: string;
		updatedAt: string;
		createdAt: string;
		content: string;
	}
}

export default function PostPreview({ post }: PostPreviewProps) {
	const [session] = useSession()
	const router = useRouter()

	useEffect(() => {
		if (session?.activeSubscription) {
			router.push(`/posts/${post.slug}`)
		}
	}, [session])

	return (
		<>
			<Head>
				<title>
					Pickles News - {post.title}
				</title>
			</Head>
			<main className={styles.container}>
				<article className={styles.post}>
					<h1>{post.title}</h1>
					<section className={styles.postTimeSection}>
						<div>
							<span>
								<FiCalendar />
								{post.createdAt}
							</span>
							<span>
								<FiUser />
								{post.author}
							</span>

							<span>
								<FiClock />
								{post.estimatedReadingTime}
							</span>
						</div>
						{post.updatedAt && (
							<span>
								{post.updatedAt}
							</span>
						)}
					</section>
					<div
						className={`${styles.postContent} ${styles.previewContent}`}
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>
					<div className={styles.continueReading}>
						Wanna continue reading?
						<Link href="/">
							<a href="#">Subscribe now 🤗</a>
						</Link>
					</div>
				</article>
			</main>
		</>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: 'blocking'
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { slug } = params;


	const prismic = getPrismicClient()
	const response = await prismic.getByUID('publication', String(slug), {});

	const timeToRead = Math.ceil(
		RichText.asText(response.data.content).split(' ').length / 200
	);

	const post = {
		slug,
		title: RichText.asText(response.data.title),
		content: RichText.asHtml(response.data.content.splice(0, 3)),
		author: response.data.author,
		updatedAt: response.last_publication_date !== response.first_publication_date ?
			format(
				new Date(response.last_publication_date),
				"'\* editado em' d MMM yyyy', ás' hh:mm", {
				locale: ptBR
			}) : '',
		createdAt: format(
			new Date(response.first_publication_date),
			"d MMM yyyy", {
			locale: ptBR
		}),
		estimatedReadingTime: `${timeToRead} min`
	};


	return {
		props: {
			post,
		},
		revalidate: 60 * 30, // 30 minutes
	}
}