import React from 'react';
import { SiginInButton } from '../SignInButton';

import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';
import Link from 'next/link';

export function Header() {


	return (
		<header className={styles.headerContainer}>
			<div className={styles.headerContent}>
				<Link href="/">
					<img src="/images/logo.svg" alt="pickles news" />
				</Link>
				<nav>
					<ActiveLink activeClassName={styles.active} href='/'>
						<a>Inicio</a>
					</ActiveLink>
					<ActiveLink activeClassName={styles.active} href='/posts' >
						<a>Publicações</a>
					</ActiveLink>
				</nav>
				<SiginInButton />
			</div>
		</header>
	);
}
