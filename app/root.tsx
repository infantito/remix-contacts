import type { LinkDescriptor, LinksFunction } from '@remix-run/node'
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
} from '@remix-run/react'
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
export async function loader() {
	const contacts = await getContacts()

	return json({ contacts })
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
	const { contacts } = useLoaderData<typeof loader>()

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
						<Form id="search-form" role="search">
							<input
								id="q"
								aria-label="Search contacts"
								placeholder="Search"
								type="search"
								name="q"
							/>
							<div id="search-spinner" aria-hidden hidden={true} />
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
				<div id="detail">
					<Outlet />
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
