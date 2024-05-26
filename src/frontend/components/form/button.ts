import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("i6q-button")
export class Button extends LitElement {
	render() {
		return html`<slot></slot>`;
	}

	static styles = css`
:host {
  display: inline-block;
  position: relative;
  padding: 6px 16px;
  font-size: 1.2rem;
  border-radius: 4px;
  color: var(--color-primary-text);
  background: var(--sl-color-primary-600);
  cursor: pointer;
  user-select: none;
  transition: background-color 200ms;
  box-sizing: border-box;
}

:host(.narrow) {
  padding-left: 0;
  padding-right: 0;
}

:host(:focus),
:host(:hover) {
  background: var(--color-primary-dark);
}

:host(.secondary) {
  background: var(--color-secondary);
}

:host(.secondary:focus),
:host(.secondary:hover) {
  background: var(--color-secondary-dark);
}

:host(.correct) {
  background: var(--color-correct);
}

:host(.correct:focus),
:host(.correct:hover) {
  background: var(--color-correct-dark);
}

:host(.error) {
  background: var(--color-error);
}

:host(.error:focus),
:host(.error:hover) {
  background: var(--color-error-dark);
}

:host(.small) {
  font-size: 1rem;
  padding: 2px 6px;
}

:host::after {
  content:'';
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 8px;
  width: 100%;
  height: 2px;
  background: var(--sl-color-primary-600);
  transform: scaleX(0);
  transition: transform 300ms;
}

:host(.active)::after {
  transform: scaleX(1);
}

:host(.flat) {
  background: transparent !important;
  color: var(--sl-color-primary-600);
}

:host(.flat:hover),
:host(.flat:focus) {
  background: transparent !important;
  color: var(--sl-color-primary-500);
}
`;
}
