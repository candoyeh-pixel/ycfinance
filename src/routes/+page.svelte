<script lang="ts">
	import { ArrowRight } from "lucide-svelte";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import { caseItems } from "$lib/cases";
	let scrollY = $state(0);

	let formData = $state({
		companyName: "",
		name: "",
		phone: "",
		email: "",
		industry: "",
		revenue: "",
	});

	let isSubmitting = $state(false);
	let isFormComplete = $derived(
		Boolean(
			formData.companyName &&
				formData.name &&
				formData.phone &&
				formData.email &&
				formData.industry &&
				formData.revenue,
		),
	);

	let activeCase = $state<number | null>(null);
	let activeDropdown = $state<string | null>(null);
	let mobileMenuOpen = $state(false);
	let industryOptions = [
		"電商",
		"製造",
		"科技",
		"餐飲",
		"房地產",
		"金融",
		"醫療",
		"教育",
		"其他",
	];
	let revenueOptions = [
		"台幣3000萬以下（先了解）",
		"台幣3000萬～1億",
		"台幣1億以上",
	];

	function toggleDropdown(dropdown: string) {
		activeDropdown = activeDropdown === dropdown ? null : dropdown;
	}

	function scrollToAnchor(e: Event, href: string) {
		e.preventDefault();
		const target = document.querySelector(href);
		if (target) {
			// Offset by 56px (h-14) for the fixed navbar
			const y = target.getBoundingClientRect().top + window.scrollY - 56;
			window.scrollTo({ top: y, behavior: "smooth" });
			window.history.pushState(null, "", href);
		}
	}

	function toggleFaq(index: number, event: Event) {
		activeFaq = activeFaq === index ? null : index;
		if (activeFaq === index) {
			const target = (event.currentTarget as HTMLElement).closest(
				".faq-item-wrap",
			);
			if (target) {
				setTimeout(() => {
					// Add an extra 20px padding from the nav bar
					const y =
						target.getBoundingClientRect().top +
						window.scrollY -
						76;
					window.scrollTo({ top: y, behavior: "smooth" });
				}, 150); // Start scrolling midway through the slide transition
			}
		}
	}

	function toggleCase(index: number, event: Event) {
		activeCase = activeCase === index ? null : index;
		if (activeCase === index) {
			const target = (event.currentTarget as HTMLElement).closest(
				".case-item-wrap",
			);
			if (target) {
				setTimeout(() => {
					const y =
						target.getBoundingClientRect().top +
						window.scrollY -
						76;
					window.scrollTo({ top: y, behavior: "smooth" });
				}, 150);
			}
		}
	}

	function selectOption(value: string, field: "industry" | "revenue") {
		if (field === "industry") {
			formData.industry = value;
		} else if (field === "revenue") {
			formData.revenue = value;
		}
		activeDropdown = null;
	}

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element | null;
			if (!target?.closest(".dropdown-container")) {
				activeDropdown = null;
			}
		};
		document.addEventListener("click", handleClickOutside);

		let chartAnimFrame: number | undefined;

		if (matrixCanvas) {
			const ctxMaybe = matrixCanvas.getContext("2d");
			if (!ctxMaybe)
				return () =>
					document.removeEventListener("click", handleClickOutside);
			const ctx: CanvasRenderingContext2D = ctxMaybe;
			const ASPECT = CW / CH;

			/* 掛載時拍下視窗尺寸後就鎖死，後續 resize 不再觸發 */
			const pinnedVw = window.innerWidth;
			const pinnedVh = window.innerHeight;
			const wrapperHeightPx = pinnedVh * 1.5;

			let logW = CW;
			let logH = CH;
			let padH = CHART_PADDING.top;
			let padV = CHART_PADDING.left;
			let cw = logW - padV * 2;
			let ch = logH - padH * 2;

			function applySize() {
				const dpr = window.devicePixelRatio || 1;
				const vw = pinnedVw;
				logW = vw * 2.5;
				logH = logW / ASPECT;
				padH = vw < 640 ? 30 : 80;
				padV = vw < 640 ? 30 : 80;
				cw = logW - padV * 2;
				ch = logH - padH * 2;
				matrixCanvas.width = Math.round(logW * dpr);
				matrixCanvas.height = Math.round(logH * dpr);
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}

			applySize();

			/* 把原本百分比/vh 的 CSS 換成 px，視窗縮放時位置不再位移 */
			pinnedWrapperHeight = wrapperHeightPx + "px";
			pinnedCanvasWidth = logW + "px";
			pinnedCanvasLeft = pinnedVw * -0.9 + "px";
			pinnedCanvasBottom = wrapperHeightPx * 0.15 + "px";

			function getPoints(data: number[]): [number, number][] {
				return data.map((y, i) => [
					padV + (i / (data.length - 1)) * cw,
					padH + (1 - y) * ch,
				]);
			}

			function drawLinePartial(
				points: [number, number][],
				color: string,
				alpha: number,
				drawT: number,
			) {
				if (points.length < 2 || drawT <= 0) return;
				const n = points.length;
				const totalSegs = n - 1;
				const segT = drawT * totalSegs;
				const fullSegs = Math.min(Math.floor(segT), totalSegs);
				const partial = segT - fullSegs;

				function cp(i: number) {
					const p0 = points[Math.max(0, i - 1)];
					const p1 = points[i];
					const p2 = points[i + 1];
					const p3 = points[Math.min(n - 1, i + 2)];
					return {
						c1x: p1[0] + (p2[0] - p0[0]) / 6,
						c1y: p1[1] + (p2[1] - p0[1]) / 6,
						c2x: p2[0] - (p3[0] - p1[0]) / 6,
						c2y: p2[1] - (p3[1] - p1[1]) / 6,
						ex: p2[0],
						ey: p2[1],
					};
				}

				ctx.beginPath();
				ctx.moveTo(points[0][0], points[0][1]);

				for (let i = 0; i < fullSegs; i++) {
					const { c1x, c1y, c2x, c2y, ex, ey } = cp(i);
					ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
				}

				if (fullSegs < totalSegs && partial > 0) {
					const { c1x, c1y, c2x, c2y, ex, ey } = cp(fullSegs);
					const ox = points[fullSegs][0];
					const oy = points[fullSegs][1];
					const t = partial;
					const ax = ox + t * (c1x - ox);
					const ay = oy + t * (c1y - oy);
					const bx = c1x + t * (c2x - c1x);
					const by = c1y + t * (c2y - c1y);
					const cx2 = c2x + t * (ex - c2x);
					const cy2 = c2y + t * (ey - c2y);
					const dx = ax + t * (bx - ax);
					const dy = ay + t * (by - ay);
					const ex2 = bx + t * (cx2 - bx);
					const ey2 = by + t * (cy2 - by);
					const fx = dx + t * (ex2 - dx);
					const fy = dy + t * (ey2 - dy);
					ctx.bezierCurveTo(ax, ay, dx, dy, fx, fy);
				}

				ctx.strokeStyle = `rgba(${color}, ${alpha})`;
				ctx.lineWidth = 2.5;
				ctx.lineJoin = "round";
				ctx.stroke();
			}

			const drawStart = Date.now();

			function tick() {
				/* 捲出英雄區（opacity 已到最低）時跳過繪製，節省 CPU */
				if (window.scrollY > 600) {
					chartAnimFrame = requestAnimationFrame(tick);
					return;
				}

				const elapsed = Date.now() - drawStart;
				const rawProgress = Math.min(1, elapsed / CHART_DRAW_MS);
				const t = elapsed / 1000;
				const fluctAmt =
					rawProgress >= 1
						? Math.min(1, (elapsed - CHART_DRAW_MS) / 1500) * 5
						: 0;

				ctx.clearRect(0, 0, logW, logH);

				for (let s = 0; s < seriesData.length; s++) {
					const delay = s * 0.07;
					const localRaw = Math.max(
						0,
						Math.min(1, (rawProgress - delay) / (1 - delay)),
					);
					const localEased = 1 - Math.pow(1 - localRaw, 2.5);

					const points = getPoints(seriesData[s]).map(
						([x, y], i) =>
							[
								x,
								y +
									Math.sin(t * 0.35 + i * 0.9 + s * 1.3) *
										fluctAmt,
							] as [number, number],
					);
					drawLinePartial(
						points,
						seriesColor[s],
						seriesAlpha[s],
						localEased,
					);
				}

				chartAnimFrame = requestAnimationFrame(tick);
			}

			chartAnimFrame = requestAnimationFrame(tick);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
			if (chartAnimFrame !== undefined)
				cancelAnimationFrame(chartAnimFrame);
		};
	});
	let submitMessage = $state("");

	const handleSubmit = async () => {
		if (!isFormComplete) {
			submitMessage = "請先完整填寫表單欄位。";
			return;
		}

		isSubmitting = true;
		submitMessage = "";

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			const result = await response.json().catch(() => null);

			if (response.ok) {
				submitMessage =
					result?.message ?? "預約成功！我們會盡快與您聯繫。";
				formData = {
					companyName: "",
					name: "",
					phone: "",
					email: "",
					industry: "",
					revenue: "",
				};
			} else {
				submitMessage = result?.message ?? "提交失敗，請稍後再試。";
			}
		} catch {
			submitMessage = "發生錯誤，請稍後再試。";
		}

		isSubmitting = false;
	};

	/* ── Scroll-reveal action ── */
	function reveal(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	/* ── Hero line chart ── */
	const CW = 1600;
	const CH = 700;
	const CHART_PADDING = { top: 80, bottom: 80, left: 80, right: 80 };
	const CHART_DRAW_MS = 2200;
	/* 色票：深藍（品牌主色）、朱紅、墨綠 */
	const NAVY = "22, 74, 115";
	const VERMILION = "168, 57, 47";
	const INK_GREEN = "31, 77, 63";

	const seriesData: number[][] = [
		[0.3, 0.4, 0.36, 0.46, 0.54, 0.5, 0.62, 0.68, 0.76, 0.82], // 穩健上升（中段小回）
		[0.55, 0.54, 0.56, 0.55, 0.57, 0.55, 0.56, 0.58, 0.56, 0.57], // 橫盤整理
		[0.42, 0.44, 0.43, 0.45, 0.5, 0.58, 0.7, 0.82, 0.9, 0.95], // 後段加速突破
		[0.65, 0.68, 0.56, 0.42, 0.34, 0.46, 0.6, 0.74, 0.83, 0.88], // V 型反轉
		[0.3, 0.45, 0.6, 0.72, 0.8, 0.78, 0.7, 0.58, 0.48, 0.42], // 倒 V，頭部回落
		[0.2, 0.35, 0.5, 0.62, 0.7, 0.74, 0.76, 0.78, 0.8, 0.82], // 朱紅主線：早段陡升後高位盤整
		[0.85, 0.82, 0.78, 0.74, 0.68, 0.6, 0.55, 0.48, 0.42, 0.36], // 墨綠主線：長線下行
		[0.72, 0.78, 0.68, 0.74, 0.7, 0.76, 0.72, 0.8, 0.74, 0.78], // 朱紅副線：高位震盪
		[0.18, 0.2, 0.32, 0.34, 0.3, 0.45, 0.48, 0.46, 0.62, 0.65], // 墨綠副線：階梯式攀升
	];
	const seriesColor = [
		NAVY,
		NAVY,
		NAVY,
		NAVY,
		NAVY,
		VERMILION,
		INK_GREEN,
		VERMILION,
		INK_GREEN,
	];
	const seriesAlpha = [0.55, 0.18, 0.4, 0.12, 0.28, 0.42, 0.32, 0.16, 0.18];

	let matrixCanvas: HTMLCanvasElement;

	/* 圖表容器與 canvas 的鎖定尺寸，掛載時計算為 px，之後不隨視窗縮放 */
	let pinnedWrapperHeight = $state("150vh");
	let pinnedCanvasWidth = $state("250%");
	let pinnedCanvasLeft = $state("-90%");
	let pinnedCanvasBottom = $state("15%");

	const navLinks = [
		{ href: "#about", label: "關於" },
		{ href: "#problem", label: "問題" },
		{ href: "#cases", label: "案例" },
		{ href: "#price", label: "流程費用" },
		{ href: "#faq", label: "常見問題" },
	];

	const problemCards = [
		{
			who: "多品牌電商",
			text: "會計人員流動快，",
			mark: "成長機會常在混亂中流失",
			rest: "。",
		},
		{
			who: "軟體服務新創",
			text: "準備融資或募資時，",
			mark: "財務數字無法被投資人與銀行採信",
			rest: "。",
		},
		{
			who: "製造加工企業",
			text: "收到稅局罰單或查核通知後，",
			mark: "經營模式存在重大合規風險",
			rest: "。",
		},
		{
			who: "連鎖餐飲品牌",
			text: "準備擴張新店與新通路時，",
			mark: "現金流與獲利模型不足以支撐決策",
			rest: "。",
		},
	];

	const impactStats = [
		{
			en: "Avg. Savings & Earnings",
			num: "200",
			unit: "萬+/年",
			label: "平均幫客戶省下或多賺",
		},
		{
			en: "Time to Insight",
			num: "30",
			unit: "秒",
			label: "老闆頁看完掌握全貌",
		},
		{
			en: "Blind Spot",
			num: "10–20",
			unit: "%",
			label: "憑經驗估 vs 實際成本差距",
		},
		{
			en: "Hidden Loss",
			num: "50–150",
			unit: "萬",
			label: "虧損門市 / 通路發現",
		},
		{ en: "Cost Waste", num: "30–80", unit: "萬", label: "費用結構優化" },
		{
			en: "Funding Inflow",
			num: "1–3",
			unit: "千萬",
			label: "貸款 / 募資到位",
		},
	];

	/* ── Counter animation ── */
	const COUNTER_DURATION = 1200;
	let statDisplay: string[] = $state(impactStats.map(() => ""));
	let statsAnimated = false;

	function parseStatNum(num: string): {
		isRange: boolean;
		a: number;
		b: number;
	} {
		if (num.includes("–")) {
			const [a, b] = num.split("–").map(Number);
			return { isRange: true, a, b };
		}
		return { isRange: false, a: Number(num), b: 0 };
	}

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	function animateCounters() {
		if (statsAnimated) return;
		statsAnimated = true;
		const start = performance.now();

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / COUNTER_DURATION, 1);
			const eased = easeOutCubic(progress);

			impactStats.forEach((s, i) => {
				const parsed = parseStatNum(s.num);
				if (parsed.isRange) {
					const curA = Math.round(parsed.a * eased);
					const curB = Math.round(parsed.b * eased);
					statDisplay[i] = `${curA}–${curB}`;
				} else {
					statDisplay[i] = String(Math.round(parsed.a * eased));
				}
			});

			if (progress < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	function counterReveal(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateCounters();
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.2 },
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	const processSteps = [
		{
			num: "1",
			title: "問題辨認",
			time: "2 小時",
			price: "NT$ 3,000",
			desc: "現金流、獲利、內控、合規四大面向快速盤點。產出風險評分與 Top 3 優先議題。",
			note: "簽約後全額抵扣",
		},
		{
			num: "2",
			title: "導入期",
			time: "2～4 週",
			price: "NT$ 30,000～50,000",
			desc: "了解你的帳、建立月報模板、把科目定義講清楚、定義追蹤單位。",
			note: "一次性費用，可折抵月費",
		},
		{
			num: "3",
			title: "每月交付內容",
			time: "持續",
			price: "NT$ 25,000～65,000/月",
			desc: "月財報與管理報表、現金流預測與異常分析、月會行動清單追蹤、LINE 群同步與合規提醒。",
			note: "每月交付，滾動優化",
		},
	];

	/* ── FAQ ── */
	let activeFaq = $state<number | null>(null);
	const faqItems = [
		{
			q: "我已經有會計了，還需要嗎？",
			a:
				"需要。會計與報稅照原本流程走，我們補上財務治理、管理分析與決策追蹤。" +
				"每月會把重點數字整理好，老闆可以直接拿來開會和決策。",
		},
		{
			q: "帳很亂可以合作嗎？",
			a:
				"可以，這很常見。我們會先做財務問題辨認，先看目前帳務能不能支撐管理，" +
				"再安排導入順序，把月結節奏和科目定義固定下來。",
		},
		{
			q: "每月實際會交付什麼？",
			a:
				"每月交付會依你們當下需求調整，常見內容包含月財報與管理報表、現金流預測與異常分析、月會行動清單與追蹤、" +
				"LINE 群同步與合規提醒。",
		},
		{
			q: "最短合作期間多久？",
			a:
				"建議以 6 個月為一個治理週期。前期先把規則與報表架起來，後續就能穩定追蹤與優化決策品質；" +
				"若交付內容與約定不符，可依合約終止。",
		},
		{
			q: "現在很多公司都在用 AI 記帳、AI 分析，你們還能幫上什麼？",
			a:
				"AI 工具可以加快整理與產出。真正卡住的通常是資料來源分散、規則不一致、歷史帳務沒清乾淨。" +
				"我們會先把這些底層問題處理好，再把報表和決策會議接起來，讓 AI 產出的數字可以直接拿來做經營判斷、融資溝通和每月追蹤。",
		},
		{
			q: "資料會保密嗎？",
			a:
				"會。合約包含完整保密條款，資料僅由授權人員在必要範圍內使用。原始可識別資料只用於本案交付；" +
				"若用於洞察分析，僅使用去識別化與彙總資料，且不影響你的服務權益。",
		},
		{
			q: "你們跟會計師事務所有什麼差別？",
			a:
				"會計師事務所主要處理法遵申報與簽證，我們主要處理經營治理與決策支持。" +
				"多數案件會一起合作，分工很清楚。",
		},
	];
</script>

<svelte:head>
	<title>奕成財創｜成長型企業財務治理</title>
	<meta
		name="description"
		content="從問題辨識、治理優化到分析上線與決策追蹤，協助成長型企業每月看清獲利、現金與風險。"
	/>
	<link rel="canonical" href="https://yicheng.finance" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://yicheng.finance" />
	<meta property="og:title" content="奕成財創｜成長型企業財務治理" />
	<meta
		property="og:description"
		content="協助年營收 3,000 萬以上、正在擴張的企業，把財務資料轉成可執行的經營決策。"
	/>
	<meta property="og:image" content="https://yicheng.finance/og-image.svg" />
	<meta property="og:image:type" content="image/svg+xml" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="zh_TW" />
	<meta property="og:site_name" content="奕成財創" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="奕成財創｜成長型企業財務治理" />
	<meta
		name="twitter:description"
		content="協助年營收 3,000 萬以上、正在擴張的企業，把財務資料轉成可執行的經營決策。"
	/>
	<meta name="twitter:image" content="https://yicheng.finance/og-image.svg" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ProfessionalService",
		name: "奕成財創",
		url: "https://yicheng.finance",
		email: "contact@yicheng.finance",
		description:
			"協助成長型企業把財務資料轉成可執行的經營決策，透過問題辨識、治理優化、分析上線與決策追蹤，讓老闆每月看清獲利、現金與風險。",
		serviceType: "財務治理顧問",
		areaServed: { "@type": "Country", name: "Taiwan" },
		inLanguage: "zh-Hant-TW",
		priceRange: "NT$25,000–65,000/月",
	})}</script>`}
</svelte:head>

<svelte:window bind:scrollY />

<div class="min-h-screen bg-transparent relative z-0 overflow-hidden">
	<!-- ─── NAV ─── -->
	<nav
		class="fixed top-0 inset-x-0 z-50 transition-all duration-300 {scrollY >
			20 || mobileMenuOpen
			? 'bg-white/95 backdrop-blur-md border-b border-[var(--line)] shadow-sm'
			: 'bg-transparent border-b border-transparent shadow-none'}"
	>
		<div
			class="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between"
		>
			<a href="/" aria-label="奕成財創" class="flex items-center">
				<img src="/yclogo.svg" alt="奕成財創 Logo" class="h-5 w-auto" />
			</a>
			<div class="hidden md:flex items-center gap-10">
				{#each navLinks as link}
					<a
						href={link.href}
						class="nav-link"
						onclick={(e) => scrollToAnchor(e, link.href)}
						>{link.label}</a
					>
				{/each}
			</div>
			<a
				href="#contact"
				class="nav-cta hidden md:block"
				onclick={(e) => scrollToAnchor(e, "#contact")}>聯絡我們</a
			>
			<!-- 漢堡按鈕 (手機版) -->
			<button
				class="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-2"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
				aria-expanded={mobileMenuOpen}
			>
				<span
					class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 origin-center {mobileMenuOpen
						? 'rotate-45 translate-y-[6px]'
						: ''}"
				></span>
				<span
					class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 {mobileMenuOpen
						? 'opacity-0'
						: ''}"
				></span>
				<span
					class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 origin-center {mobileMenuOpen
						? '-rotate-45 -translate-y-[6px]'
						: ''}"
				></span>
			</button>
		</div>
		<!-- 手機版展開選單 -->
		{#if mobileMenuOpen}
			<div
				transition:slide={{ duration: 250 }}
				class="md:hidden bg-white/95 backdrop-blur-md border-b border-[var(--line)]"
			>
				<div class="max-w-[980px] mx-auto px-6 py-2 flex flex-col">
					{#each navLinks as link}
						<a
							href={link.href}
							class="nav-link py-3.5 border-b border-[var(--line)]"
							onclick={(e) => {
								scrollToAnchor(e, link.href);
								mobileMenuOpen = false;
							}}>{link.label}</a
						>
					{/each}
					<a
						href="#contact"
						class="nav-link py-3.5"
						onclick={(e) => {
							scrollToAnchor(e, "#contact");
							mobileMenuOpen = false;
						}}>聯絡我們</a
					>
				</div>
			</div>
		{/if}
	</nav>

	<!-- ─── ABSOLUTE MATRIX BACKGROUND ─── -->
	<div
		class="absolute inset-0 pointer-events-none -z-10"
		style="perspective: 3000px; perspective-origin: 100% 100%; transform: translateY({scrollY *
			0.4}px); height: {pinnedWrapperHeight};"
	>
		<canvas
			bind:this={matrixCanvas}
			class="select-none absolute transition-opacity duration-300"
			aria-hidden="true"
			style="
				bottom: {pinnedCanvasBottom}; left: {pinnedCanvasLeft};
				width: {pinnedCanvasWidth}; height: auto;
				transform: rotateX(-20deg) rotateY(0deg) rotateZ(-20deg);
				transform-origin: center center;
				opacity: {Math.max(0.08, 1 - scrollY / 600)};
			"
		></canvas>
		<div
			class="absolute inset-x-0 top-0 bg-gradient-to-b from-white to-transparent"
			style="height: 15%;"
		></div>
	</div>

	<!-- ─── HERO ─── -->
	<section
		class="relative bg-transparent"
		style="height: 100vh; min-height: 600px;"
	>
		<div
			class="absolute bottom-10 right-8 md:bottom-16 md:right-16 text-right z-10 max-w-[520px]"
		>
			<p class="meta tracking-widest uppercase mb-3">
				Fractional CFO for SMBs
			</p>
			<h1
				class="font-[var(--font-serif)] text-[var(--text-body)] font-semibold text-[var(--ink)] tracking-[0.06em]"
				style="font-weight: 600; font-size: 19px; margin-bottom: 4px;"
			>
				<span style="font-family: var(--font-sans); font-weight: 600;"
					>奕成財創</span
				>｜成長型企業財務治理
			</h1>
			<p
				class="body-copy text-[var(--ink-2)] opacity-70 leading-snug"
				style="margin-top: 0; margin-bottom: 0;"
			>
				讓財務數字，支撐你的下一步決策
			</p>
			<div class="mt-6 flex flex-wrap justify-end gap-3">
				<a href="#contact" class="btn-primary">
					預約30分鐘訪談
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
		</div>
	</section>

	<!-- ─── PRINCIPLE ─── -->
	<section
		id="about"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					奕成財創<span class="sec-en">— About</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>
					很多成長中的公司都有財務資料，但真正要做決策時常常用不上，
					<br />
					老闆要看的重點，和報表呈現方式常常接不起來，
					<br />
					奕成財創把資料整理成經營上可以直接使用的數字。
				</p>
			</div>

			<div
				class="max-w-[980px] mx-auto grid md:grid-cols-2 gap-[clamp(40px,6vw,96px)]"
			>
				<div class="reveal" use:reveal>
					<h3 class="sub-title">
						我們相信的事<small>What we believe</small>
					</h3>
					<p class="body-copy mb-[18px]">
						公司進入成長期後，產品、通路、人員都在擴張，
						原本靠經驗就能管理的方式會快速失效。
						營收大家都會看，但獲利、現金與風險常常沒有即時畫面。
					</p>
					<p class="body-copy">
						真正有價值的財務資訊，是可以直接拿來做經營決定的資訊。
					</p>
				</div>
				<div class="reveal reveal-d1" use:reveal>
					<h3 class="sub-title">
						我們在做的事<small>What we do</small>
					</h3>
					<p class="body-copy mb-[18px]">
						我們協助成長型企業把財務數字轉成可執行的經營決策，
						透過標準化流程釐清問題、優化治理、建立分析與追蹤機制。
					</p>
					<p class="body-copy">
						我們每月把重點數字整理好，老闆看完就能決定下一步。
					</p>
				</div>
			</div>
			<div class="max-w-[980px] mx-auto mt-[clamp(52px,6vw,84px)]"></div>
		</div>
	</section>

	<!-- ─── PROBLEM ─── -->
	<section
		id="problem"
		class="border-t border-[var(--line)]"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					常見困境<span class="sec-en">— Problem</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>
					這四個問題，在很多中小企業都一直重複發生。<br
					/>很多老闆每天都在面對同樣的壓力。
				</p>
			</div>

			<div
				class="max-w-[1240px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
			>
				{#each problemCards as q, i}
					<div class="quote-cell reveal reveal-d{i}" use:reveal>
						<p class="quote-text mb-5">
							{q.text}<span class="quote-mark">{q.mark}</span
							>{q.rest}
						</p>
						<p class="quote-who">{q.who}</p>
					</div>
				{/each}
			</div>

			<div
				class="mt-[clamp(80px,8vw,120px)] text-center reveal"
				use:reveal
			>
				<span class="pull-quote-mark">&ldquo;</span>
				<p class="pull-quote">把財務治理做穩，擴張時就不會一路補洞。</p>
			</div>
		</div>
	</section>

	<!-- ─── CASES ─── -->
	<section
		id="cases"
		class="border-t border-[var(--line)]"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					案例分享<span class="sec-en">— Cases</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>
					真實情境改編，客戶資訊已匿名處理。
				</p>
			</div>

			<div class="border-t border-[var(--line)]">
				{#each caseItems as c, i}
					<div class="reveal case-item-wrap" use:reveal>
						<button
							class="w-full text-left case-row group cursor-pointer"
							onclick={(e) => toggleCase(i, e)}
							aria-expanded={activeCase === i}
						>
							<div
								class="meta uppercase pt-1 transition-opacity duration-300 {activeCase ===
								i
									? 'opacity-100'
									: 'opacity-60 group-hover:opacity-100'}"
							>
								{c.ind}
							</div>
							<div>
								<h3
									class="case-title transition-colors duration-300 {activeCase ===
									i
										? 'text-[var(--brand-primary)]'
										: 'group-hover:text-[var(--ink-2)]'}"
								>
									「{c.title}」
								</h3>
							</div>
							<div class="md:text-right md:min-w-[160px]">
								<div
									class="case-result transition-transform duration-300 {activeCase ===
									i
										? 'scale-105 origin-right'
										: 'group-hover:scale-105 origin-right'}"
								>
									{c.result}
								</div>
							</div>
						</button>
						{#if activeCase === i}
							<div
								transition:slide={{ duration: 400 }}
								class="pb-9 md:pb-11"
							>
								<p
									class="body-copy text-[var(--ink-2)] max-w-[760px]"
								>
									{c.desc}
								</p>
								<a
									href={`/cases/${c.slug}`}
									class="inline-flex items-center gap-2 mt-5 pb-1 border-b border-[var(--line-2)] text-[var(--ink)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors duration-200"
									style="font-family: var(--font-serif); font-size: 14px; letter-spacing: 0.08em;"
								>
									看完整案例
									<ArrowRight class="w-3.5 h-3.5" />
								</a>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── IMPACT & ROI ─── -->
	<section
		id="roi"
		class="bg-[var(--paper)] border-t border-b border-[var(--line)]"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div
				class="flex flex-wrap items-baseline justify-between gap-6 mb-[clamp(48px,5vw,72px)]"
			>
				<h2
					class="sec-title reveal"
					use:reveal
					style="font-size: clamp(22px, 2.4vw, 32px); letter-spacing: 0.14em;"
				>
					服務成果<span class="sec-en">— Impact & ROI</span>
				</h2>
				<p
					class="reveal"
					use:reveal
					style="font-family: var(--font-serif); font-size: var(--text-body); color: var(--muted); line-height: 1.8; max-width: 460px;"
				>
					以下數字來自代表性案例與保守估算，實際成效依產業型態與帳務基礎而異。
				</p>
			</div>

			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-t border-b border-[var(--line)]"
				use:counterReveal
			>
				{#each impactStats as s, i}
					<div
						class="stat-cell reveal reveal-d{i} {i % 3 !== 2
							? 'md:border-r border-[var(--line)]'
							: ''} {i < 3
							? 'md:border-b border-[var(--line)]'
							: ''}"
						use:reveal
					>
						<div class="meta uppercase mb-[18px]">{s.en}</div>
						<div class="stat-num text-[var(--brand-primary)]">
							{statDisplay[i] || s.num}<span class="unit"
								>{s.unit}</span
							>
						</div>
						<div class="body-copy mt-5">{s.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── PROCESS ─── -->
	<section
		id="price"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					流程&費用<span class="sec-en">— Price</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>
					奕成財創以獨創並持續迭代的 4P 財務治理框架™，
					透過問題辨識（Probe）、治理優化（Process）、
					分析上線（Pilot）與決策追蹤（Performance），
					協助企業解決前述困境。
				</p>
			</div>

			<div
				class="grid md:grid-cols-3 border-t border-l border-[var(--line)]"
			>
				{#each processSteps as s, i}
					<div class="step-cell reveal reveal-d{i}" use:reveal>
						<div class="step-num">{s.num}</div>
						<h3
							class="sub-title"
							style="border: none; padding: 0; margin-bottom: 8px;"
						>
							{s.title}
						</h3>
						<div class="meta uppercase mb-1">{s.time}</div>
						<div class="step-price">{s.price}</div>
						<p class="body-copy mb-4">{s.desc}</p>
						<span class="step-tag">{s.note}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── FAQ ─── -->
	<section
		id="faq"
		class="border-t border-[var(--line)]"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="max-w-[920px] mx-auto">
				<h2
					class="sec-title reveal mb-[clamp(48px,6vw,80px)]"
					use:reveal
				>
					常見問題<span class="sec-en">— FAQ</span>
				</h2>
			</div>

			<div class="max-w-[920px] mx-auto divide-y divide-[var(--line)]">
				{#each faqItems as faq, i}
					<div class="py-8 reveal faq-item-wrap" use:reveal>
						<button
							class="w-full text-left flex justify-between items-center group cursor-pointer"
							onclick={(e) => toggleFaq(i, e)}
						>
							<h3
								class="faq-q group-hover:text-[var(--brand-primary)] transition-colors duration-300 m-0"
							>
								{faq.q}
							</h3>
							<div class="faq-icon" class:open={activeFaq === i}>
								<div class="faq-icon-line-h"></div>
								<div class="faq-icon-line-v"></div>
							</div>
						</button>
						{#if activeFaq === i}
							<div
								transition:slide={{
									duration: 400,
									easing: easeOutCubic,
								}}
							>
								<p class="body-copy max-w-[640px] pt-6">
									{faq.a}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── CTA ─── -->
	<section
		id="contact"
		class="bg-[var(--paper)] border-t border-[var(--line)]"
		style="padding-top: var(--sec-top); padding-bottom: clamp(64px,7vw,96px);"
	>
		<div class="wrap">
			<div class="mb-[clamp(40px,4vw,64px)] text-center">
				<h2 class="sec-title reveal" use:reveal>
					聯絡我們<span class="sec-en">— Contact</span>
				</h2>
			</div>

			<div class="max-w-[800px] mx-auto">
				<div class="text-center mb-12">
					<h3 class="cta-headline mb-6 reveal" use:reveal>
						現在最簡單的一步，<br />是先做一次<span
							class="border-b-2 border-[var(--rule)] pb-1"
							>30 分鐘訪談</span
						>。
					</h3>
					<p class="body-copy">
						先快速了解您的公司階段、目前困境與目標，並讓您了解我們的服務。
						訪談後會提供初步建議與合作方向。
					</p>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					class="space-y-6"
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div
							class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2"
						>
							<label
								for="field-company"
								class="whitespace-nowrap"
								style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);"
								>公司名稱</label
							>
							<input
								id="field-company"
								type="text"
								bind:value={formData.companyName}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none focus-visible:outline-1 focus-visible:outline-[var(--brand-primary)]"
							/>
						</div>

						<div
							class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2"
						>
							<label
								for="field-name"
								class="whitespace-nowrap"
								style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);"
								>姓名</label
							>
							<input
								id="field-name"
								type="text"
								bind:value={formData.name}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none focus-visible:outline-1 focus-visible:outline-[var(--brand-primary)]"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div
							class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2"
						>
							<label
								for="field-phone"
								class="whitespace-nowrap"
								style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);"
								>電話</label
							>
							<input
								id="field-phone"
								type="tel"
								bind:value={formData.phone}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none focus-visible:outline-1 focus-visible:outline-[var(--brand-primary)]"
							/>
						</div>

						<div
							class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2"
						>
							<label
								for="field-email"
								class="whitespace-nowrap"
								style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);"
								>Email</label
							>
							<input
								id="field-email"
								type="email"
								bind:value={formData.email}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none focus-visible:outline-1 focus-visible:outline-[var(--brand-primary)]"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="relative dropdown-container">
							<div
								role="button"
								tabindex="0"
								aria-haspopup="listbox"
								aria-expanded={activeDropdown === "industry"}
								aria-controls="industry-listbox"
								aria-label="產業別：{formData.industry ||
									'請選擇'}"
								onclick={() => toggleDropdown("industry")}
								onkeydown={(e) =>
									(e.key === "Enter" || e.key === " ") &&
									(e.preventDefault(),
									toggleDropdown("industry"))}
								class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2 cursor-pointer select-none"
							>
								<span
									class="whitespace-nowrap"
									style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);"
									>產業別</span
								>
								<span
									class="flex-1"
									style="font-family: var(--font-serif); font-size: 0.95rem; color: {formData.industry
										? 'var(--ink)'
										: 'var(--muted)'};"
									>{formData.industry || "請選擇"}</span
								>
								<svg
									class="w-3 h-3"
									style="color: var(--line-2);"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1"
								>
									<polyline points="6 9 12 15 18 9"
									></polyline>
								</svg>
							</div>
							{#if activeDropdown === "industry"}
								<div
									id="industry-listbox"
									role="listbox"
									aria-label="產業別"
									class="absolute top-full left-0 right-0 mt-1 z-20 border border-[var(--line)]"
									style="background-color: var(--bg);"
								>
									{#each industryOptions as option}
										<div
											role="option"
											tabindex="0"
											aria-selected={formData.industry ===
												option}
											onclick={() =>
												selectOption(
													option,
													"industry",
												)}
											onkeydown={(e) =>
												(e.key === "Enter" ||
													e.key === " ") &&
												(e.preventDefault(),
												selectOption(
													option,
													"industry",
												))}
											class="px-4 py-2 cursor-pointer hover:bg-[var(--paper)] transition-colors"
											style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);"
										>
											{option}
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<div class="relative dropdown-container">
							<div
								role="button"
								tabindex="0"
								aria-haspopup="listbox"
								aria-expanded={activeDropdown === "revenue"}
								aria-controls="revenue-listbox"
								aria-label="營收規模：{formData.revenue ||
									'請選擇'}"
								onclick={() => toggleDropdown("revenue")}
								onkeydown={(e) =>
									(e.key === "Enter" || e.key === " ") &&
									(e.preventDefault(),
									toggleDropdown("revenue"))}
								class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2 cursor-pointer select-none"
							>
								<span
									class="whitespace-nowrap"
									style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);"
									>營收規模</span
								>
								<span
									class="flex-1"
									style="font-family: var(--font-serif); font-size: 0.95rem; color: {formData.revenue
										? 'var(--ink)'
										: 'var(--muted)'};"
									>{formData.revenue || "請選擇"}</span
								>
								<svg
									class="w-3 h-3"
									style="color: var(--line-2);"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1"
								>
									<polyline points="6 9 12 15 18 9"
									></polyline>
								</svg>
							</div>
							{#if activeDropdown === "revenue"}
								<div
									id="revenue-listbox"
									role="listbox"
									aria-label="營收規模"
									class="absolute top-full left-0 right-0 mt-1 z-20 border border-[var(--line)]"
									style="background-color: var(--bg);"
								>
									{#each revenueOptions as option}
										<div
											role="option"
											tabindex="0"
											aria-selected={formData.revenue ===
												option}
											onclick={() =>
												selectOption(option, "revenue")}
											onkeydown={(e) =>
												(e.key === "Enter" ||
													e.key === " ") &&
												(e.preventDefault(),
												selectOption(
													option,
													"revenue",
												))}
											class="px-4 py-2 cursor-pointer hover:bg-[var(--paper)] transition-colors"
											style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);"
										>
											{option}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<div class="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
						<button
							type="submit"
							disabled={isSubmitting}
							class="btn-primary"
						>
							{isSubmitting ? "提交中..." : "預約30分鐘訪談"}
							{#if !isSubmitting}
								<ArrowRight class="w-3.5 h-3.5" />
							{/if}
						</button>
						<div class="flex items-center gap-3">
							<img
								src="/line-qrcode.png"
								alt="奕成財創官方 LINE QR Code"
								width="72"
								height="72"
								class="border border-[var(--line)] p-1 shrink-0"
							/>
							<span class="meta" style="line-height: 1.7; font-style: normal; letter-spacing: 0.1em;">官方 LINE<br />掃碼加入</span>
						</div>
					</div>

					{#if submitMessage}
						<p
							class="text-center text-sm mt-6 {submitMessage.includes(
								'成功',
							)
								? 'text-green-600'
								: 'text-red-600'}"
						>
							{submitMessage}
						</p>
					{/if}
				</form>
			</div>
		</div>
	</section>

	<!-- ─── FOOTER ─── -->
	<footer
		class="bg-[var(--bg-deep)] border-t border-[var(--line)]"
		style="padding: clamp(28px,4vw,44px) 0 24px;"
	>
		<div class="wrap">
			<div
				class="max-w-[980px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6"
			>
				<div>
					<div class="flex items-center gap-4">
						<a
							href="/"
							class="inline-block shrink-0"
							aria-label="奕成財創"
						>
							<img
								src="/yclogo.svg"
								alt="奕成財創 Logo"
								class="h-6 w-auto opacity-90 hover:opacity-100 transition-opacity"
							/>
						</a>
						<p class="body-copy m-0 max-w-[440px]">
							協助台灣成長型企業，把財務資料轉成可執行的經營決策。
						</p>
					</div>
					<div class="meta mt-4" style="line-height: 1.8;">
						<a
							href="mailto:contact@yicheng.finance"
							class="hover:text-[var(--ink)] transition-colors duration-200"
							>contact@yicheng.finance</a
						>
					</div>

				</div>
				<div class="foot-meta md:text-right" style="line-height: 1.8;">
					<div>&copy; 2026 奕成財創</div>
					<div>Fractional CFO · 財務治理與決策支持</div>
					<div>資料保密與隱私保護</div>
				</div>
			</div>
		</div>
	</footer>
</div>
