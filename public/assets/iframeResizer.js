(() => {
	if(window.WikiNarauResizerEnabled){return;}
	window.WikiNarauResizerEnabled = true;
	window.addEventListener("message", (e) => {
		if(e?.data?.T === "WikiNarauResize"){
			for(const frame of document.getElementsByTagName('iframe')){
				if(frame.contentWindow === e.source){
					frame.height = `${e.data.height}px`;
					return;
				}
			}
		}
	});
})();
