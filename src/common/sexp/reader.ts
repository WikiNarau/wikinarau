interface ReadContext {
	str: string;
	i: number;
	len: number;
}

const skipWhiteSpace = (ctx: ReadContext) => {
	for (let n = ctx.i; n < ctx.len; n++) {
		const c = ctx.str.charCodeAt(n);
		if (c <= 32) {
			continue;
		} // Don't care for unicode spaces, for now
		ctx.i = n;
		return;
	}
};

const searchWhiteSpace = (ctx: ReadContext) => {
	for (let n = ctx.i; n < ctx.len; n++) {
		const c = ctx.str.charCodeAt(n);
		if (c > 32) {
			continue;
		} // Don't care for unicode spaces, for now
		ctx.i = n;
		return;
	}
};

const readNumber = (ctx: ReadContext): number => {
	const { i } = ctx;
	searchWhiteSpace(ctx);
	const str = ctx.str.substring(i, ctx.i);
	return str.indexOf(".") >= 0 ? parseFloat(str) : parseInt(str);
};

const readString = (ctx: ReadContext): string => {
	const { str, len } = ctx;
	let escape = false;
	let ret = "";
	let lastI = ctx.i;
	for (let i = ctx.i; i < len; i++) {
		const c = str.codePointAt(i);
		if (escape) {
			escape = false;
			lastI = i;
		} else if (c === 92) {
			// Backslash
			ret += str.substring(lastI, i);
			escape = true;
		} else if (c === 34) {
			// Double Quote
			if (lastI !== i) {
				ret += str.substring(lastI, i);
			}
			ctx.i = i + 1;
			return ret;
		}
	}
	ctx.i = ctx.len;
	if (lastI !== ctx.i) {
		ret += str.substring(lastI, ctx.i);
	}
	return ret;
};

const readKeyword = (ctx: ReadContext): string => {
	const { i } = ctx;
	searchWhiteSpace(ctx);
	return ":" + ctx.str.substring(i, ctx.i);
};

const readSymbol = (ctx: ReadContext): string => {
	const { i } = ctx;
	searchWhiteSpace(ctx);
	return ctx.str.substring(i, ctx.i);
};

const readValue = (ctx: ReadContext): any => {
	const { i } = ctx;
	const fc = ctx.str.charAt(i);
	switch (fc) {
		case "(":
			ctx.i++;
			return readList(ctx);
		case '"':
			ctx.i++;
			return readString(ctx);
		case ":":
			ctx.i++;
			return readKeyword(ctx);
		case "0":
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			return readNumber(ctx);
		default:
			return readSymbol(ctx);
	}
};

const readList = (ctx: ReadContext): any[] => {
	const ret: any[] = [];
	while (ctx.i < ctx.len - 1) {
		skipWhiteSpace(ctx);
		const c = ctx.str.charCodeAt(ctx.i);
		if (c === 41) {
			// Closing paren
			ctx.i++;
			return ret;
		} else if (!c) {
			return ret;
		} else {
			ret.push(readValue(ctx));
		}
	}
	return ret;
};

export const read = (str: string) => {
	return readList({
		str,
		i: 0,
		len: str.length,
	});
};

const example = `
(Header :h2 "Welcome!")
(Text (p "Just a simple placeholder page containing a single element."))
(Img "https://nujel.net/img/berries.jpg")
(Text (p "What color does the blackcurrant berry actually have?"))
(MultipleChoice
  (Option "Black")
  (Option :correct "Very dark purple")
  (Option "Blue"))
`;

console.time("read");
console.log(read(example));
console.timeEnd("read");
