import type { LinkDescriptor, LinksFunction } from '@remix-run/node'
import {
	Form,
	Links,
	LiveReload,
	Meta,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'

import appStylesHref from './app.css'
import { cssBundleHref } from '@remix-run/css-bundle'

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

export default function App() {
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
						<ul>
							<li>
								<a href={`/contacts/1`}>Your Name</a>
							</li>
							<li>
								<a href={`/contacts/2`}>Your Friend</a>
							</li>
						</ul>
					</nav>
				</div>

				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
