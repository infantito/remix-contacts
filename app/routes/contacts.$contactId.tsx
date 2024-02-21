import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { getContact, type ContactRecord, updateContact } from '../data'

export async function loader(args: LoaderFunctionArgs) {
	const { contactId } = args.params

	invariant(contactId, 'Missing contactId param')

	const contact = await getContact(contactId)

	if (!contact) {
		throw new Response('Contact not found', { status: 404 })
	}

	return json({ contact })
}

export async function action(args: ActionFunctionArgs) {
	const { params, request } = args

	invariant(params.contactId, 'Missing contactId param')

	const formData = await request.formData()

	return updateContact(params.contactId, {
		favorite: formData.get('favorite') === 'true',
	})
}

export default function Contact() {
	const { contact } = useLoaderData<typeof loader>()

	return (
		<div id="contact">
			<div>
				<img
					alt={`${contact.first} ${contact.last} avatar`}
					key={contact.avatar}
					src={contact.avatar}
				/>
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}{' '}
					<Favorite contact={contact} />
				</h1>

				{contact.twitter ? (
					<p>
						<a href={`https://twitter.com/${contact.twitter}`}>
							{contact.twitter}
						</a>
					</p>
				) : null}

				{contact.notes ? <p>{contact.notes}</p> : null}

				<div>
					<Form action="edit">
						<button type="submit">Edit</button>
					</Form>

					<Form
						action="destroy"
						method="post"
						onSubmit={event => {
							const response = confirm(
								'Please confirm you want to delete this record.',
							)
							if (!response) {
								event.preventDefault()
							}
						}}
					>
						<button type="submit">Delete</button>
					</Form>
				</div>
			</div>
		</div>
	)
}

type FavoriteProps = {
	contact: Pick<ContactRecord, 'favorite'>
}

const Favorite = (props: FavoriteProps) => {
	const { contact } = props

	const favorite = contact.favorite

	const fetcher = useFetcher()

	return (
		<fetcher.Form method="post">
			<button
				aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
				name="favorite"
				value={favorite ? 'false' : 'true'}
			>
				{favorite ? '★' : '☆'}
			</button>
		</fetcher.Form>
	)
}
