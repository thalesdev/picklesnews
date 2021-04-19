import { GetServerSideProps } from "next";
import Head from 'next/head';
import { getSession } from "next-auth/client";
import { RichText } from "prismic-dom";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import styles from './post.module.scss';
import { getPrismicClient } from "../../services/prismic";
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import { useEffect } from "react";

interface PostProps {
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

export default function Post({ post }: PostProps) {

	useEffect(() => {
		const script = document.createElement("script");
		const anchor = document.getElementById("pickles-comments");
		script.setAttribute("src", "https://utteranc.es/client.js");
		script.setAttribute("crossorigin", "anonymous");
		script.setAttribute("async", "true");
		script.setAttribute("repo", "thalesdev/picklesnews");
		script.setAttribute("issue-term", `post-${post.slug}`);
		script.setAttribute("theme", "github-dark");
		anchor.appendChild(script);
	}, [])


	return (
		<>
			<Head>
				<title>
					Pickles News - {post.title}
				</title>
			</Head>
			<main className={styles.container}>
				<article className={styles.post}>
					<h1>
						{post.title}
					</h1>
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
						className={styles.postContent}
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>
					<div id="pickles-comments"></div>
				</article>
			</main>
		</>
	);
}


export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
	const session = await getSession({ req });
	const { slug } = params;

	if (!session?.activeSubscription) {
		return {
			redirect: {
				destination: `/posts/preview/${slug}`,
				permanent: false
			}
		}
	}

	const prismic = getPrismicClient(req)
	const response = await prismic.getByUID('publication', String(slug), {});


	// 200 words per minute

	const timeToRead = Math.ceil(
		RichText.asText(response.data.content).split(' ').length / 200
	);
	const post = {
		slug,
		title: RichText.asText(response.data.title),
		author: response.data.author,
		content: RichText.asHtml(response.data.content),
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
		}
	}
}