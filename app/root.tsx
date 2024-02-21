import type {
	LinkDescriptor,
	LinksFunction,
	LoaderFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	LiveReload,
	Meta,
	NavLink,
	Outlet,
	Scripts,
	ScrollRestoration,
	json,
	redirect,
	useLoaderData,
	useNavigation,
	useSubmit,
} from '@remix-run/react'
import * as React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'

import appStylesHref from './app.css'
import { createEmptyContact, getContacts } from './data'

export const links: LinksFunction = () =>
	[
		{
			rel: 'stylesheet',
			href: appStylesHref,
		},
		/**
		 * Use the cssBundleHref to include the CSS bundle in the HTML.
		 *
		 * It should be conditionally included because the css imports could be empty.
		 */
		(cssBundleHref
			? { rel: 'stylesheet', href: cssBundleHref }
			: null) as LinkDescriptor,
	].filter(Boolean)

/**
 * @see https://remix.run/docs/en/main/route/loader
 *
 * A `loader function` provides data to the route when rendering.
 */
export async function loader(args: LoaderFunctionArgs) {
	const { request } = args

	const url = new URL(request.url)

	const q = url.searchParams.get('q')

	const contacts = await getContacts(q)

	return json({ contacts, q })
}

/**
 * @see https://remix.run/docs/en/main/route/action
 *
 * A `route action` is a server only function to handle data mutations and other actions.
 */
export async function action() {
	const contact = await createEmptyContact()

	return redirect(`/contacts/${contact.id}/edit`)
}

export default function App() {
	const { contacts, q } = useLoaderData<typeof loader>()

	const navigation = useNavigation()

	const submit = useSubmit()

	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	React.useEffect(() => {
		const searchField = document.getElementById('q')

		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
		const isFirstSearch = q === null

		submit(event.currentTarget, { replace: !isFirstSearch })
	}

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<div id="sidebar">
					<h1>Remix Contacts</h1>
					<div>
						<Form id="search-form" role="search" onChange={handleSearch}>
							<input
								id="q"
								aria-label="Search contacts"
								className={searching ? 'loading' : ''}
								defaultValue={q || ''}
								placeholder="Search"
								type="search"
								name="q"
							/>
							<div id="search-spinner" aria-hidden hidden={!searching} />
						</Form>
						<Form method="post">
							<button type="submit">New</button>
						</Form>
					</div>
					<nav>
						{contacts.length ? (
							<ul>
								{contacts.map(contact => (
									<li key={contact.id}>
										<NavLink
											className={({ isActive, isPending }) =>
												isActive ? 'active' : isPending ? 'pending' : ''
											}
											to={`contacts/${contact.id}`}
										>
											{contact.first || contact.last ? (
												<>
													{contact.first} {contact.last}
												</>
											) : (
												<i>No Name</i>
											)}{' '}
											{contact.favorite ? <span>★</span> : null}
										</NavLink>
									</li>
								))}
							</ul>
						) : (
							<p>
								<i>No contacts</i>
							</p>
						)}
					</nav>
				</div>
				<div
					id="detail"
					className={
						navigation.state === 'loading' && !searching ? 'loading' : ''
					}
				>
					<Outlet />
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
