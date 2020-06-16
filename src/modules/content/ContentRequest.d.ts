declare namespace ContentRequest {

	export interface Id {
		contentId: string;
	}

	export interface FaqId {
		faqId: string;
	}

	export interface Add {
		title: string;
		description: string;
		type: string;
		created?: number;
	}

	export interface Edit extends Add, Id { }

	export interface View {
		type: string;
	}

	export interface AddFaq {
		question: string;
		answer: string;
		type: string;
		created?: number;
	}

	export interface EditFaq extends FaqId {
		question: string;
		answer: string;
	}
}