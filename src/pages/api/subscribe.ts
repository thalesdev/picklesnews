import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
	ref: {
		id: string;
	},
	data: {
		stripe_customer_id: string;
	}
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

	if (req.method === "POST") {
		try {
			const session = await getSession({ req })
			const user = await fauna.query<User>(
				q.Get(
					q.Match(
						q.Index('user_by_email'),
						q.Casefold(session.user.email)
					)
				)
			)

			let customerId = user.data.stripe_customer_id;

			if (!customerId) {

				const striperCustomer = await stripe.customers.create({
					email: session.user.email,
				});

				if (!striperCustomer) throw new Error('Stripe Customer Create Error!')

				await fauna.query(
					q.Update(
						q.Ref(q.Collection('users'), user.ref.id),
						{
							data: {
								stripe_customer_id: striperCustomer.id,
							}
						}
					)
				)

				customerId = striperCustomer.id;
			}



			const stripeCheckoutSession = await stripe.checkout.sessions.create({
				customer: customerId,
				payment_method_types: ['card'],
				billing_address_collection: 'required',
				line_items: [
					{ price: 'price_1IiYTEIbAuKiUaJWf8zOBQPj', quantity: 1 }
				],
				mode: 'subscription',
				allow_promotion_codes: true,
				success_url: process.env.STRIPE_SUCESS_URL,
				cancel_url: process.env.STRIPE_CANCEL_URL,
			});
			if (!stripeCheckoutSession) throw new Error('Stripe Checkout Session Error!')
			return res.status(200).json({
				sessionId: stripeCheckoutSession.id,
			})

		} catch (err) {
			return res.status(500).json({
				message: err?.message
			})
		}
	} else {
		res.setHeader('Allow', 'POST')
		res.status(405).end('Method not allowed')
	}
}