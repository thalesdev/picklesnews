import React from 'react';
import Link from 'next/link'
import { SiginInButton } from '../SignInButton';

import styles from './styles.module.scss';
import { useRouter } from 'next/dist/client/router';
import { ActiveLink } from '../ActiveLink';

export function Header() {

	const { asPath } = useRouter()

	return (
		<header className={styles.headerContainer}>
			<div className={styles.headerContent}>
				<img src="/images/logo.png" alt="ig.news" />
				<nav>
					<ActiveLink activeClassName={styles.active} href='/'>
						<a>Home</a>
					</ActiveLink>
					<ActiveLink activeClassName={styles.active} href='/posts' >
						<a>Posts</a>
					</ActiveLink>
					{/* <ActiveLink activeClassName={styles.active} href='/podcasts' >
						<a>Podcasts</a>
					</ActiveLink> */}
				</nav>
				<SiginInButton />
			</div>
		</header>
	);
}
