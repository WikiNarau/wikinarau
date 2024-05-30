import { create, insert, remove, search } from '@orama/orama';
import type { Entry } from './Entry';

export interface SearchResult {
	T: "Entry";
	uri: string;
	score: number;
}

export class SearchIndex {
	private content?: any;

	async init() {
		this.content = await create({
			schema: {
				uri: 'string',
				content: 'string',
			}
		});
	}

	async updateEntry(entry: Entry) {
		const res = await search(this.content, {
			term: entry.uri,
			properties: ['uri'],
			exact: true,
		});
		if(res.count){
			for(const hit of res.hits){
				await remove(this.content, hit.id);
			}
		}

		await insert(this.content, {
			uri: entry.uri,
			content: entry.renderText()
		})
	}

	async searchForEntry(term: string): Promise<SearchResult[]> {
		const res = await search(this.content, {
			term: term,
		});
		const ret: SearchResult[] = [];
		for(const hit of res.hits){
			const res = <SearchResult>{
				uri: hit.document.uri,
				score: hit.score
			};
			ret.push(res);
		}
		return ret;
	}


}