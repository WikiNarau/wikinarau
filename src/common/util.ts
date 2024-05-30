export const utime = (date = new Date()) => {
	return Math.floor(+date / 1000);
};