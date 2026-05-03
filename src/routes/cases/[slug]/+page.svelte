<script lang="ts">
	import type { PageData } from "./$types";
	import { ArrowLeft, ArrowRight } from "lucide-svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.caseStudy.ind}｜奕成財創案例</title>
	<meta
		name="description"
		content={`${data.caseStudy.ind}案例：${data.caseStudy.title}`}
	/>
</svelte:head>

<main class="min-h-screen bg-[var(--bg)]">
	<header class="border-b border-[var(--line)] bg-white/95 backdrop-blur-sm">
		<div class="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between">
			<a href="/" class="inline-flex items-center" aria-label="回首頁">
				<img src="/yclogo.svg" alt="奕成財創 Logo" class="h-6 w-auto" />
			</a>
			<a
				href="/#cases"
				class="inline-flex items-center gap-2 text-[var(--ink)] hover:text-[var(--brand-primary)] transition-colors duration-200"
				style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 0.08em;"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				回案例列表
			</a>
		</div>
	</header>

	<section style="padding-top: clamp(52px,6vw,84px); padding-bottom: clamp(72px,8vw,120px);">
		<div class="max-w-[860px] mx-auto px-6">
			<p class="meta uppercase opacity-70 mb-4">{data.caseStudy.ind}</p>
			<h1
				class="font-[var(--font-serif)] text-[var(--ink)] mb-6"
				style="font-size: clamp(30px,4vw,46px); line-height: 1.5; letter-spacing: 0.06em; font-weight: 500;"
			>
				{data.caseStudy.title}
			</h1>

			<div class="border-l-2 border-[var(--line-2)] pl-5 mb-12">
				<p class="body-copy text-[var(--ink)]">老闆說：「{data.caseStudy.ownerQuote}」</p>
			</div>

			<div class="space-y-7">
				{#each data.caseStudy.story as paragraph}
					<p class="body-copy text-[var(--ink-2)]">{paragraph}</p>
				{/each}
			</div>

			<div class="mt-12 pt-8 border-t border-[var(--line)]">
				<h2
					class="font-[var(--font-serif)] text-[var(--ink)] mb-5"
					style="font-size: 20px; letter-spacing: 0.08em; font-weight: 500;"
				>
					成果
				</h2>
				<ul class="space-y-3 pl-5">
					{#each data.caseStudy.outcomes as outcome}
						<li class="body-copy text-[var(--ink-2)]">{outcome}</li>
					{/each}
				</ul>
			</div>

			<div class="mt-14">
				<a href="/#contact" class="btn-primary inline-flex items-center gap-2">
					預約30分鐘訪談
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
		</div>
	</section>
</main>
