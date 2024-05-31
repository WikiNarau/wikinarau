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
	border-bottom: solid 1px var(--sl-color-primary-600);
}


@media only screen and (max-width: 700px) {
	h1 {
		font-size: 2rem;
	}

	h2 {
		font-size: 1.8rem;
	}

	h3 {
		font-size: 1.6rem;
	}

	h4 {
		font-size: 1.4rem;
	}

	h5 {
		font-size: 1.2rem;
	}
}

@media only screen and (max-width: 500px) {
	h1 {
		font-size: 1.6rem;
	}

	h2 {
		font-size: 1.4rem;
	}

	h3 {
		font-size: 1.2rem;
	}

	h4 {
		font-size: 1.1rem;
	}

	h5, h6 {
		font-size: 1rem;
	}
}


a {
	text-decoration: none;
	color: var(--sl-color-primary-700);
}

a:focus,
a:hover {
	text-decoration: underline;
}

p {
	font-size: 1rem;
	line-height: 1.4em;
	margin: 0 0 1rem;
}

p:last-child {
	margin-bottom:0;
}

img {
	display: block;
	width: 100%;
	height: auto;
}
`;
