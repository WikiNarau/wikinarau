/* This file mostly contains general typographic rules, if you want you can personalize this file to custimze the appearance
 * of your instance further.
 */
import { css } from "lit";

export const typographicStyles = css`
h1,h2,h3 {
	font-family: var(--header-font-family);
	font-weight: 300;
}
h4,h5,h6,p,ul,ol {
	font-family: var(--font-family);
}

h1 {
	font-size: 3rem;
	margin: 0 0 0rem;
}

h2 {
	font-size: 2.4rem;
	margin: 0 0 1rem;
}

h3 {
	font-size: 2rem;
	margin: 0 0 1rem;
}

h4 {
	font-size: 1.5rem;
	margin: 0 0 0.5rem;
}

h5 {
	font-size: 1.2rem;
	margin: 0 0 0.5rem;
	font-weight: normal;
}

h6 {
	font-size: 1rem;
	margin: 0 0 0.25rem;
	font-weight: normal;
	display: block;
	border-bottom: solid 1px var(--color-primary);
}

a {
	text-decoration: none;
	color: var(--color-primary);
}

p {
	font-size: 1rem;
	line-height: 1.35em;
}
`;
