const params = new URLSearchParams(document.location.search);
export const isEmbed = params.get("embed")?.toLowerCase() === "true";

export interface IframeMessage {
	T: "WikiNarauResize";
}

export interface IframeResizeMessage extends IframeMessage {
	T: "WikiNarauResize";
	width: number;
	height: number;
}

export const sendIframeMessage = (msg: IframeMessage) => {
	parent.postMessage(msg, "*");
};

if (isEmbed) {
	document.body.classList.add("embed");
	let lastWidth = 0;
	let lastHeight = 0;
	const main = document.querySelector("body > main");
	if (main) {
		setInterval(() => {
			const rect = main.getBoundingClientRect();
			const { width, height } = rect;
			if (width === lastWidth && height === lastHeight) {
				return;
			}
			lastWidth = width;
			lastHeight = height;
			sendIframeMessage(<IframeResizeMessage>{
				T: "WikiNarauResize",
				width,
				height,
			});
		}, 100);
	}
}
