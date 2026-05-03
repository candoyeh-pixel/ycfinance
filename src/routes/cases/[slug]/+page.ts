import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { getCaseBySlug } from "$lib/cases";

export const load: PageLoad = ({ params }) => {
	const caseStudy = getCaseBySlug(params.slug);
	if (!caseStudy) {
		throw error(404, "找不到案例");
	}

	return {
		caseStudy,
	};
};
