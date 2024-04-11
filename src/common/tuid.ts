export const generateTypeUID = (T: string) => {
	const n = (Math.random() * 100000) | 0;
	return `${T}-${n}`;
};

export const titleToURI = (title: string): string => {
	return title
		.replace(/([a-z])([A-Z])/g, "$1_$2")
		.toLowerCase()
		.replace(/\s/g, "_")
		.replace(/_+/g, "_")
		.replace(/[^a-z_0-9]/g, "")
		.replace(/_+$/, "")
		.replace(/^_+/, "");
};
