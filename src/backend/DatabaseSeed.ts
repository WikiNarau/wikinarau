export const dbSeed = new Map<string, string>();

dbSeed.set("/",
`---
title = "WikiLearn - learn, teach? both!"
format = "JSON"
description = "A platform for creating, sharing, teaching and learning. Together!"
---
[{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"WikiLearn is a platform where you can"},{"T":"b","C":[{"T":"","text":"create"}]},{"T":"","text":"collaborative learning materials and"},{"T":"b","C":[{"T":"","text":"share"}]},{"T":"","text":"it with the world. Since we believe in anonymous collaboration, every material on this platform can be changed by"},{"T":"b","C":[{"T":"","text":"anyone"}]},{"T":"","text":", you don't even need any sort of account. Just click on the Edit button and you can start improving that particular material as you see fit."}]},{"T":"p","C":[{"T":"","text":"As an example of what you can build here, you can look at the following simple task:"},{"T":"a","C":[{"T":"","text":"Multiple-Choice"}],"href":"/wiki/berry"}]}]}]
`);

dbSeed.set("/how-to",
`---
title = "How to"
format = "JSON"
---
[{"T":"Header","C":[{"T":"","text":"Create a new page"}],"h":"h4"},{"T":"Text","C":[{"T":"","text":"The easiest way would be to use the"},{"T":"i","C":[{"T":"","text":"New Page"}]},{"T":"","text":"button on the left. After providing a title you will be redirected to the newly created page where you can use the Edit button to write content."}]},{"T":"Header","C":[{"T":"","text":"Edit a page"}],"h":"h4"},{"T":"Text","C":[{"T":"","text":"By pressing the Edit button on the top you can change any page."}]},{"T":"Header","C":[{"T":"","text":"Find content"}],"h":"h4"},{"T":"Text","C":[{"T":"","text":"You can use the search bar on the top of the screen, although it currently only looks at the URL's of content, so it is highly unlikely to find anything of value. This will probably be fixed in a couple of days."}]}]
`);

dbSeed.set("/contact-us",
`---
title = "Contact us"
format = "JSON"
---
[{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"The best way to contact us right now is via our"},{"T":"a","C":[{"T":"","text":"Discord channel"}],"href":"https://discord.gg/qYfRfNVH"},{"T":"","text":". If you have found a bug or another technical issue you can open an issue on"},{"T":"a","C":[{"T":"","text":"GitHub"}],"href":"https://github.com/WikiNarau/wikinarau"},{"T":"","text":", if you are a programmer you can also get the source code there and open pull requests which we'd love to merge."}]}]}]
`);

dbSeed.set("/privacy",
`---
title = "Privacy policy"
format = "JSON"
---
[{"T":"Text","C":[{"T":"","text":"1. We respect and try to protect your privacy as much as possible."},{"T":"div","C":[{"T":"","text":"2. No private information will be shared with third parties. This includes server logs, user data and information not publicly shared."}]},{"T":"div","C":[{"T":"","text":"3. This service is hosted in Germany on servers provided by DigitalOcean, we may be required to comply with legal requests to identify people for commiting illegal activities on this site."}]},{"T":"div","C":[{"T":"","text":"4. Be careful about adding private and/or personal information to your profile or content you create because we keep a full history of every edit."}]},{"T":"div","C":[{"T":"","text":"5. Do not post other people's private information without their explicit consent."}]}]}]
`);

dbSeed.set("/terms-of-use",
`---
title = "Terms of use"
format = "JSON"
---
[{"T":"Text","C":[{"T":"div","C":[{"T":"div","C":[{"T":"","text":"1. Please, do not upload any illegal content or create courses explaining how to do anything illegal."}]},{"T":"div","C":[{"T":"","text":"2. Be nice to each other, debates can get heated but this is no excuse to be rude towards one another."}]},{"T":"div","C":[{"T":"","text":"3. Be careful not to upload any content that you are not allowed to redistribute under an open license, like Creative Commons."}]},{"T":"div","C":[{"T":"","text":"4. If you notice anything inappropriate/illegal please contact us and we'll make sure to resolve that issue as soon as possible."}]},{"T":"div","C":[{"T":"","text":"5. Since anyone can create and/or edit content here we are not liable for any copyright infringement / illegal content posted here, we are a small group of volunteers and try our best to ensure that site is filled with high-quality content, however sometimes things might slip past us."}]}]}]}]
`);

dbSeed.set("/wiki/berry",
`---
title = "Multiple-Choice example"
format = "JSON"
---
[{"T":"Header","C":[{"T":"","text":"Welcome!!!"}],"h":"h2"},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"Just a simple placeholder page containing a single element."}]}]},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"Have some boxes!"}]}]},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"sky","summary":"Testbox asd"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"emerald","summary":"Testbox - primary"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"gray","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"red","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"Test"}]}],"variant":"amber","summary":"Testbox"},{"T":"Box","C":[{"T":"Text","C":[{"T":"","text":"asdqweqwe"}]}],"variant":"pink","summary":"Box"},{"T":"Text","C":[{"T":"p","C":[{"T":"","text":"What color does the blackcurrant berry actually have?"}]}]},{"T":"MultipleChoice","C":[{"T":"Option","C":[{"T":"","text":"Black"}],"correct":false},{"T":"Option","C":[{"T":"","text":"Very dark purple"}],"correct":true},{"T":"Option","C":[{"T":"","text":"Blue"}],"correct":false},{"T":"Option","C":[{"T":"","text":"asdqwe"}],"correct":false}],"multiple":false}]
`);
