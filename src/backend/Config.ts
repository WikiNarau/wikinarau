export class Config {
	public devMode = false;
	public port = 2600;
	public bindAddress = "localhost";
	public baseUri = "http://localhost:2600";

	// This doesn't belong in Config, it should go into the DB in the long run
	public footer = `All content is available under the Creative Commons <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.en">CC BY-SA 4.0 License</a>.<br/>
	By using this site, you agree to the <a href="/terms-of-use">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.`;

	private checkEnvVars() {
		if(process.env.DEV_MODE?.toLowerCase() === "true"){
			this.devMode = true;
		}
		if(process.env.PORT){
			try {
				const num = parseInt(process.env.PORT);
				if((num <= 0) || (num >= 65535)){
					console.error(`Port number ${num} is out of range, choose another one`);
				} else {
					this.port = num;
				}
			} catch {
				console.error(`Invalid PORT Environment variable: "${process.env.PORT}"`);
			}
		}
		if(process.env.BIND_ADDRESS){
			this.bindAddress = process.env.BIND_ADDRESS;
		}
		if(process.env.BASE_URI){
			this.baseUri = process.env.BASE_URI;
			if(this.baseUri.endsWith("/")){
				throw new Error("Base URI's shouldn't end with a slash, please change your config!!!")
			}
		}
	}

	constructor() {
		if(process.env.NODE_ENV === "development"){
			this.devMode = true;
			this.bindAddress = "localhost";
		}
		this.checkEnvVars();
	}
}