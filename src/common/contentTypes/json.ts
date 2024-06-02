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
			return `<wn-multiple-choice ${ele.multiple ? "multiple" : ""}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</wn-multiple-choice>`;
		case "Option":
			return `<wn-multiple-choice-option ${ele.correct ? "correct" : ""}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</wn-multiple-choice-option>`;
		case "Box":
			return `<wn-box summary="${ele.summary || ""}" variant="${
				ele.variant || ""
			}">${ele.C ? renderJSONList(ele.C) : ""}</wn-box>`;
		case "Header":
			return `<wn-header h=${ele.h}>${
				ele.C ? renderJSONList(ele.C) : ""
			}</wn-header>`;
		case "Img":
			return `<wn-img src="${ele.src}" width="${ele.width}" width="${ele.height}"></wn-img>`;
		case "Audio":
			return `<wn-audio src="${ele.src}" ></wn-audio>`;
		case "Video":
			return `<wn-video src="${ele.src}" ></wn-video>`;
		case "StemCell":
			return `<wn-stem-cell></wn-stem-cell>`;
		case "Text":
			return `<wn-text>${ele.C ? renderJSONList(ele.C) : ""}</wn-text>`;
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
	return Array.isArray(list)
		? list.map(renderJSONElementToText).join("\n")
		: "";
};
