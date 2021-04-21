import { useCallback, useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/dist/client/router';
import { ImSpinner2 } from 'react-icons/im';

import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
	priceId: string
}
interface ErrorType {
	message?: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
	const [pending, setPending] = useState(false)
	const [error, setError] = useState<ErrorType | null>(null)
	const modalRef = useRef<HTMLDialogElement>(null)
	const [session] = useSession()
	const router = useRouter()

	const handleSubscribe = useCallback(async () => {
		if (pending) return;

		if (!session) {
			signIn('github')
			return;
		}
		setPending(true)
		if (session.activeSubscription) {
			router.push('/');
			return;
		}

		try {
			const response = await api.post('/subscribe')
			const { sessionId } = response.data;
			const stripe = await getStripeJs()
			setPending(false)
			await stripe.redirectToCheckout({ sessionId })
		} catch (err) {
			console.log(err.response)
			setError(err.message)
		}
	}, [pending, session])

	const handleCloseModal = useCallback(() => {
		if (error && modalRef.current) {
			modalRef.current.close()
			setPending(false)
			setError(null)
		}
	}, [modalRef, error])

	const handleTryAgain = useCallback(() => {
		if (error && modalRef.current) {
			modalRef.current.close()
			setPending(false)
			setError(null)
			handleSubscribe()
		}
	}, [modalRef, error])


	useEffect(() => {
		if (modalRef.current) {
			if (error) {
				if (!modalRef.current.open)
					modalRef.current.showModal()
			} else {
				modalRef.current.close()
			}
		}
	}, [modalRef, error])

	return (
		<>
			<button
				type="button"
				className={styles.subscribeButton}
				onClick={handleSubscribe}
				disabled={pending}
			>
				Inscrever-se
			{pending && <ImSpinner2 className={styles.spin} />}
			</button>
			{error && (
				<dialog ref={modalRef} className={styles.modal}>
					<header>
						<h1>Oops! Aconteceu um erro!</h1>
					</header>
					<section>
						{error.message ?? "Houve um erro inesperado, tente novamente."}
					</section>
					<footer>
						<button onClick={handleCloseModal}>Fechar</button>
						<button className={styles.primary} onClick={handleTryAgain}>
							Tentar Novamente
						</button>
					</footer>
				</dialog>
			)
			}
		</>
	)
}