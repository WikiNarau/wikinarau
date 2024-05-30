export interface SerializedElement {
	T: string;
	C?: SerializedElement[];
	[key: string]: any;
}

// ToDo: proper escaping, and making sure only safe attributes/tags can be used
export const renderJSONElement = (ele: SerializedElement): string => {
	if (!ele) {
		return "";
	}

	switch (ele.T) {
		case "":
			return ele.text;
		case "MultipleChoice":
			return `<i6q-multiple-choice ${ele.multiple ? "multiple" : ""}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</i6q-multiple-choice>`;
		case "Option":
			return `<i6q-multiple-choice-option ${ele.correct ? "correct" : ""}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</i6q-multiple-choice-option>`;
		case "Box":
			return `<i6q-box summary="${ele.summary || ""}" variant="${
				ele.variant || ""
			}">${ele.C ? renderJSONList(ele.C) : ""}</i6q-box>`;
		case "Header":
			return `<i6q-header h=${ele.h}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</i6q-header>`;
		case "Img":
			return `<i6q-img src="${ele.src}" width="${ele.width}" width="${ele.height}"></i6q-img>`;
		case "Audio":
			return `<i6q-audio src="${ele.src}" ></i6q-audio>`;
		case "Video":
			return `<i6q-video src="${ele.src}" ></i6q-video>`;
		case "StemCell":
			return `<i6q-stem-cell></i6q-stem-cell>`;
		case "Text":
			return `<i6q-text>${ele.C ? renderJSONList(ele.C) : ""}</i6q-text>`;
		default:
			const fc = ele.T.charAt(0);
			if (fc !== fc.toLowerCase()) {
				return "";
			}
			let atts = "";
			for (const k of Object.keys(ele)) {
				if (k === "T" || k === "C") {
					continue;
				}
				atts += ` ${k}="${ele[k]}"`;
			}
			return `<${ele.T}${atts}>${ele.C ? renderJSONList(ele.C) : ""}</${
				ele.T
			}>`;
	}
};

export const renderJSONList = (list: SerializedElement[]): string => {
	return Array.isArray(list) ? list.map(renderJSONElement).join("\n") : "";
};

export const renderJSONElementToText = (ele: SerializedElement): string => {
	if (!ele) {
		return "";
	}

	switch (ele.T) {
		case "":
			return ele.text;
		case "Box":
			return ele.summary + "\n" + (ele.C ? renderJSONListToText(ele.C) : "");
		case "Header":
			return ele.C ? renderJSONListToText(ele.C) : "";
		case "Img":
		case "Audio":
		case "Video":
		case "StemCell":
			return "";
		default:
		case "MultipleChoice":
		case "Option":
		case "Text":
			return ele.C ? renderJSONListToText(ele.C) : "";
	}
};

export const renderJSONListToText = (list: SerializedElement[]): string => {
	return Array.isArray(list) ? list.map(renderJSONElementToText).join("\n") : "";
}