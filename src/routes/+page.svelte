<script lang="ts">
	import { ArrowRight } from "lucide-svelte";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
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
	let isFormComplete = $derived(Boolean(
		formData.companyName &&
		formData.name &&
		formData.phone &&
		formData.email &&
		formData.industry &&
		formData.revenue
	));

	let activeCase = $state<number | null>(null);
	let activeDropdown = $state<string | null>(null);
	let mobileMenuOpen = $state(false);
	let industryOptions = ['電商', '製造', '科技', '餐飲', '房地產', '金融', '醫療', '教育', '其他'];
	let revenueOptions = ['台幣3000萬以下（先了解）', '台幣3000萬～1億', '台幣1億以上'];

	function toggleDropdown(dropdown: string) {
		activeDropdown = activeDropdown === dropdown ? null : dropdown;
	}

	function scrollToAnchor(e: Event, href: string) {
		e.preventDefault();
		const target = document.querySelector(href);
		if (target) {
			// Offset by 56px (h-14) for the fixed navbar
			const y = target.getBoundingClientRect().top + window.scrollY - 56;
			window.scrollTo({ top: y, behavior: 'smooth' });
			window.history.pushState(null, '', href);
		}
	}

	function toggleFaq(index: number, event: Event) {
		activeFaq = activeFaq === index ? null : index;
		if (activeFaq === index) {
			const target = (event.currentTarget as HTMLElement).closest('.faq-item-wrap');
			if (target) {
				setTimeout(() => {
					// Add an extra 20px padding from the nav bar
					const y = target.getBoundingClientRect().top + window.scrollY - 76; 
					window.scrollTo({ top: y, behavior: 'smooth' });
				}, 150); // Start scrolling midway through the slide transition
			}
		}
	}

	function toggleCase(index: number, event: Event) {
		activeCase = activeCase === index ? null : index;
		if (activeCase === index) {
			const target = (event.currentTarget as HTMLElement).closest('.case-item-wrap');
			if (target) {
				setTimeout(() => {
					const y = target.getBoundingClientRect().top + window.scrollY - 76; 
					window.scrollTo({ top: y, behavior: 'smooth' });
				}, 150);
			}
		}
	}

	function selectOption(value: string, field: 'industry' | 'revenue') {
		if (field === 'industry') {
			formData.industry = value;
		} else if (field === 'revenue') {
			formData.revenue = value;
		}
		activeDropdown = null;
	}

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element | null;
			if (!target?.closest('.dropdown-container')) {
				activeDropdown = null;
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
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
				submitMessage = result?.message ?? "預約成功！我們會盡快與您聯繫。";
				formData = { companyName: "", name: "", phone: "", email: "", industry: "", revenue: "" };
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
						entry.target.classList.add('visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	const allChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "$"];
	const COLS = 30;
	const ROWS = 30;

	/* Final target — random each page load */
	const targetGrid = Array.from({ length: ROWS }, () =>
		Array.from({ length: COLS }, () =>
			allChars[Math.floor(Math.random() * allChars.length)]
		)
	);

	let gridRows: string[][] = $state(
		Array.from({ length: ROWS }, () =>
			Array.from({ length: COLS }, () =>
				allChars[Math.floor(Math.random() * allChars.length)]
			)
		)
	);

	/* ── Hero matrix: scramble → snap ── */
	const SCRAMBLE_DURATION = 1800;
	const SCRAMBLE_INTERVAL = 60;

	onMount(() => {
		const start = Date.now();
		const timer = setInterval(() => {
			if (Date.now() - start >= SCRAMBLE_DURATION) {
				/* Snap: instantly freeze on target */
				for (let r = 0; r < ROWS; r++) {
					for (let c = 0; c < COLS; c++) {
						gridRows[r][c] = targetGrid[r][c];
					}
				}
				clearInterval(timer);
				return;
			}
			/* Scramble: randomise all cells */
			for (let r = 0; r < ROWS; r++) {
				for (let c = 0; c < COLS; c++) {
					gridRows[r][c] = allChars[Math.floor(Math.random() * allChars.length)];
				}
			}
		}, SCRAMBLE_INTERVAL);
		return () => clearInterval(timer);
	});

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
			text: "會計人員高流動，讓公司錯過",
			mark: "爆發性成長市場機會",
			rest: "。",
		},
		{
			who: "軟體服務新創",
			text: "進入融資或募資階段，才發現",
			mark: "財務數字無法被投資人與銀行採信",
			rest: "。",
		},
		{
			who: "製造加工企業",
			text: "收到稅局罰稅或查核時，才意識到",
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

	const caseItems = [
		{
			ind: "加工出口製造",
			title: "收到罰稅/查核後，完全不清楚為什麼被罰了天價稅款。",
			desc: "多年沿用同一申報模式，查核時才暴露交易與稅務邏輯斷層。",
			result: "罰款降96%",
			sub: "釐清稅務風險",
		},
		{
			ind: "跨境金融科技",
			title: "我們要募資了，但財務資料混亂，經不起查核。",
			desc: "跨美台中營運口徑不一致，募資前資料無法快速採信。",
			result: "募得400萬美金",
			sub: "通過四大查核",
		},
		{
			ind: "跨境遊戲公司",
			title: "跨國交易衍生許多稅務成本，大幅削減獲利能力。",
			desc: "多法域交易流未優化，稅務成本與合規風險同步放大。",
			result: "稅負降46%",
			sub: "跨境合規化",
		},
		{
			ind: "軟體新創公司",
			title: "仍在草創階段，資源有限，無暇顧及財稅管理問題。",
			desc: "先建最低可運作治理，再隨成長節奏逐步升級。",
			result: "營收達1400萬",
			sub: "取得900萬投資",
		},
		{
			ind: "活動公關公司",
			title: "只記現金流水帳，數字無法支撐經營決策。",
			desc: "專案多、節奏亂，原有帳務看不到專案真實損益。",
			result: "專案損益可視",
			sub: "報表雙軸上線",
		},
		{
			ind: "國際貿易公司",
			title: "財會人員缺乏經營邏輯，做不出老闆要的管理報表。",
			desc: "帳務偏合規導向，無法回答獲利來源與現金壓力。",
			result: "管報上線",
			sub: "穩定月報節奏",
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
	let statDisplay: string[] = $state(impactStats.map(() => ''));
	let statsAnimated = false;

	function parseStatNum(num: string): { isRange: boolean; a: number; b: number } {
		if (num.includes('–')) {
			const [a, b] = num.split('–').map(Number);
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
			{ threshold: 0.2 }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	const processSteps = [
		{
			num: "01",
			title: "問題辨認",
			time: "2 小時",
			price: "NT$ 3,000",
			desc: "現金流、獲利、內控、合規四大面向快速盤點。產出風險評分與 Top 3 優先議題。",
			note: "簽約後全額抵扣",
		},
		{
			num: "02",
			title: "導入期",
			time: "2～4 週",
			price: "NT$ 30,000～50,000",
			desc: "了解你的帳、建立月報模板、對齊科目口徑、定義追蹤單位。",
			note: "一次性費用，可全額折抵月費（單月上限 NT$2,500）",
		},
		{
			num: "03",
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
				"需要，而且是互補關係。我們不取代會計與報稅，而是補上財務治理、管理分析與決策追蹤，" +
				"讓老闆每月看得懂數字、用得了數字。",
		},
		{
			q: "帳很亂可以合作嗎？",
			a:
				"可以，這正是常見起點。我們會先做財務問題辨認，判斷目前帳務可用性與風險，" +
				"再規劃導入順序，先把月結節奏與口徑穩定下來。",
		},
		{
			q: "每月實際會交付什麼？",
			a:
				"視實際需求提供每月交付，可包含月財報與管理報表、現金流預測與異常分析、月會行動清單與追蹤、" +
				"LINE 群同步與合規提醒。",
		},
		{
			q: "最短合作期間多久？",
			a:
				"建議以 6 個月為一個治理週期。前期完成口徑對齊與報表上線，中後期才能穩定追蹤與優化決策品質；" +
				"若交付內容與約定不符，可依合約終止。",
		},
		{
			q: "資料會保密嗎？",
			a:
				"會。合約包含完整保密條款，資料僅由授權人員在必要範圍內使用。原始可識別資料只用於本案交付；" +
				"若用於洞察分析，僅採去識別化與彙總資料，且不影響你的服務權益。",
		},
		{
			q: "你們跟會計師事務所有什麼差別？",
			a:
				"會計師事務所重點在法遵申報與簽證，我們重點在經營治理與決策支持。實務上通常是協作關係：" +
				"事務所確保法遵，我們確保數字能支撐經營決策。",
		},
	];

	const footerColumns = [
		{
			title: "服務",
			en: "Service",
			links: [
				{ label: "財務快篩", href: "#contact" },
				{ label: "導入期", href: "#price" },
				{ label: "每月財務治理", href: "#price" },
				{ label: "LINE 群同步", href: "#price" },
			],
		},
		{
			title: "資源",
			en: "Resources",
			links: [
				{ label: "案例研究", href: "#cases" },
				{ label: "服務成果", href: "#roi" },
				{ label: "常見問題", href: "#faq" },
			],
		},
		{
			title: "公司",
			en: "Company",
			links: [
				{ label: "關於我們", href: "#about" },
				{ label: "聯絡我們", href: "#contact" },
			],
		},
	];
</script>

<svelte:head>
	<title>奕成財創｜成長型企業財務治理</title>
	<meta name="description" content="從問題辨識、治理優化到分析上線與決策追蹤，協助成長型企業每月看清獲利、現金與風險。" />
	<link rel="canonical" href="https://yicheng.finance" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://yicheng.finance" />
	<meta property="og:title" content="奕成財創｜成長型企業財務治理" />
	<meta property="og:description" content="協助年營收 3,000 萬以上、正在擴張的企業，把財務資料轉成可執行的經營決策。" />
	<meta property="og:image" content="https://yicheng.finance/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="zh_TW" />
	<meta property="og:site_name" content="奕成財創" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="奕成財創｜成長型企業財務治理" />
	<meta name="twitter:description" content="協助年營收 3,000 萬以上、正在擴張的企業，把財務資料轉成可執行的經營決策。" />
	<meta name="twitter:image" content="https://yicheng.finance/og-image.png" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "ProfessionalService",
		"name": "奕成財創",
		"url": "https://yicheng.finance",
		"email": "contact@yicheng.finance",
		"description": "協助成長型企業把財務資料轉成可執行的經營決策，透過問題辨識、治理優化、分析上線與決策追蹤，讓老闆每月看清獲利、現金與風險。",
		"serviceType": "財務治理顧問",
		"areaServed": { "@type": "Country", "name": "Taiwan" },
		"inLanguage": "zh-Hant-TW",
		"priceRange": "NT$25,000–65,000/月"
	})}</script>`}
</svelte:head>

<svelte:window bind:scrollY />

<div class="min-h-screen bg-transparent relative z-0 overflow-hidden">
	<!-- ─── NAV ─── -->
	<nav
		class="fixed top-0 inset-x-0 z-50 transition-all duration-300 {scrollY > 20 || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-b border-[var(--line)] shadow-sm' : 'bg-transparent border-b border-transparent shadow-none'}"
	>
		<div class="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between">
			<a href="/" aria-label="奕成財創" class="flex items-center">
				<img src="/yclogo.svg" alt="奕成財創 Logo" class="h-6 w-auto" />
			</a>
			<div class="hidden md:flex items-center gap-10">
				{#each navLinks as link}
					<a href={link.href} class="nav-link" onclick={(e) => scrollToAnchor(e, link.href)}>{link.label}</a>
				{/each}
			</div>
			<a href="#contact" class="nav-link hidden md:block" onclick={(e) => scrollToAnchor(e, '#contact')}>聯絡我們</a>
			<!-- 漢堡按鈕 (手機版) -->
			<button
				class="md:hidden flex flex-col justify-center gap-[5px] p-2 -mr-2"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
				aria-expanded={mobileMenuOpen}
			>
				<span class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 origin-center {mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}"></span>
				<span class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''}"></span>
				<span class="block w-5 h-px bg-[var(--ink)] transition-all duration-300 origin-center {mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}"></span>
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
							onclick={(e) => { scrollToAnchor(e, link.href); mobileMenuOpen = false; }}
						>{link.label}</a>
					{/each}
					<a
						href="#contact"
						class="nav-link py-3.5"
						onclick={(e) => { scrollToAnchor(e, '#contact'); mobileMenuOpen = false; }}
					>聯絡我們</a>
				</div>
			</div>
		{/if}
	</nav>

	<!-- ─── ABSOLUTE MATRIX BACKGROUND ─── -->
	<div
		class="absolute inset-0 pointer-events-none -z-10"
		style="perspective: 3000px; perspective-origin: 100% 100%; transform: translateY({scrollY * 0.4}px); height: 150vh;"
	>
		<div
			class="select-none absolute transition-opacity duration-300"
			aria-hidden="true"
			style="
				bottom: 15%; left: -90%;
				width: 250%; height: 250%;
				display: flex; flex-direction: column; align-items: center; justify-content: center;
				transform: rotateX(-20deg) rotateY(0deg) rotateZ(-20deg);
				transform-origin: center center;
				font-family: var(--font-serif);
				font-size: 36px;
				line-height: 1.7;
				letter-spacing: 0.3em;
				font-weight: 800;
				color: #666666;
				white-space: nowrap;
				opacity: {Math.max(0.08, 1 - scrollY / 600)};
			"
		>
			{#each gridRows as row}
				<div class="flex gap-[0.3em] justify-center">
					{#each row as char}
						<span
							class="inline-block w-[1.2em] text-center overflow-hidden"
							>{char}</span
						>
					{/each}
				</div>
			{/each}
		</div>
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
				<span style="font-family: var(--font-sans); font-weight: 600;">奕成財創</span>｜成長型企業財務治理
			</h1>
			<p class="body-copy text-[var(--ink-2)] opacity-70 leading-snug" style="margin-top: 0; margin-bottom: 0;">
				每月看清獲利、現金與風險，讓擴張決策有數字依據
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
					許多成長中的公司雖有財務資料，但卻無法支撐決策，
					<br />
					老闆不熟悉會計語言，會計人員沒有經營視角，
					<br />
					奕成財創幫你把「財務資料」轉成「決策依據」。
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
						老闆看得到營收，卻不一定看得清獲利、現金與風險。
					</p>
					<p class="body-copy">
						真正有價值的財務資訊，不只要正確，還要能主導經營決策。
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
						重點不是多一份報表，而是讓老闆每個月都能看清方向，知道下一步該做什麼。
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
					同樣的四個問題，每天在老闆心裡反覆出現。<br
					/>這不是你的問題，這是大多數中小企業主的日常。
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

			<div class="mt-[clamp(80px,8vw,120px)] text-center reveal" use:reveal>
				<span class="pull-quote-mark">&ldquo;</span>
				<p class="pull-quote">
					讓財務治理不再是經營的絆腳石，而是<strong
						class="pull-quote-em">成長的墊腳石</strong
					>。
				</p>
			</div>
		</div>
	</section>

	<!-- ─── CASES ─── -->
	<section id="cases" class="border-t border-[var(--line)]" style="padding-top: var(--sec-top); padding-bottom: var(--sec);">
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					案例分享<span class="sec-en">— Cases</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>真實情境改編，客戶資訊已匿名處理。</p>
			</div>

			<div class="border-t border-[var(--line)]">
				{#each caseItems as c, i}
					<div class="reveal case-item-wrap" use:reveal>
						<button 
							class="w-full text-left case-row group cursor-pointer"
							onclick={(e) => toggleCase(i, e)}
						>
							<div class="meta uppercase pt-1 transition-opacity duration-300 {activeCase === i ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}">{c.ind}</div>
							<div>
								<h3 class="case-title transition-colors duration-300 {activeCase === i ? 'text-[var(--brand-primary)]' : 'group-hover:text-[var(--ink-2)]'}">「{c.title}」</h3>
								{#if activeCase === i}
									<div transition:slide={{ duration: 400 }}>
										<p class="body-copy mt-4 text-[var(--ink-2)]">{c.desc}</p>
									</div>
								{/if}
							</div>
							<div class="md:text-right md:min-w-[160px]">
								<div class="case-result transition-transform duration-300 {activeCase === i ? 'scale-105 origin-right' : 'group-hover:scale-105 origin-right'}">{c.result}</div>
								<div class="meta mt-1 opacity-60">{c.sub}</div>
							</div>
						</button>
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
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
					服務成果<span class="sec-en">— Impact & ROI</span>
				</h2>
				<p class="sec-intro reveal" use:reveal>
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
							{statDisplay[i] || s.num}<span class="unit">{s.unit}</span>
						</div>
						<div class="body-copy mt-5">{s.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── PROCESS ─── -->
	<section id="price" style="padding-top: var(--sec-top); padding-bottom: var(--sec);">
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
						<div class="meta mb-6">{s.num}</div>
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
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title reveal" use:reveal>
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
							<h3 class="faq-q group-hover:text-[var(--brand-primary)] transition-colors duration-300 m-0">{faq.q}</h3>
							<div class="faq-icon" class:open={activeFaq === i}>
								<div class="faq-icon-line-h"></div>
								<div class="faq-icon-line-v"></div>
							</div>
						</button>
						{#if activeFaq === i}
							<div transition:slide={{ duration: 400, easing: easeOutCubic }}>
								<p class="body-copy max-w-[640px] pt-6">{faq.a}</p>
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
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
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

				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2">
							<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);">公司名稱</span>
							<input 
								type="text" 
								bind:value={formData.companyName}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none"
							/>
						</div>

						<div class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2">
							<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);">姓名</span>
							<input 
								type="text" 
								bind:value={formData.name}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2">
							<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);">電話</span>
							<input 
								type="tel" 
								bind:value={formData.phone}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none"
							/>
						</div>

						<div class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2">
							<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: var(--text-nav); color: var(--ink);">Email</span>
							<input 
								type="email" 
								bind:value={formData.email}
								required
								class="flex-1 min-w-0 bg-transparent text-[var(--ink)] focus:outline-none"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="relative dropdown-container">
							<div 
								role="button"
								tabindex="0"
								onclick={() => toggleDropdown('industry')}
								onkeydown={(e) => e.key === 'Enter' && toggleDropdown('industry')}
								class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2 cursor-pointer select-none"
							>
								<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);">產業別</span>
								<span class="flex-1" style="font-family: var(--font-serif); font-size: 0.95rem; color: {formData.industry ? 'var(--ink)' : 'var(--muted)'};">{formData.industry || '請選擇'}</span>
								<svg class="w-3 h-3" style="color: var(--line-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</div>
							{#if activeDropdown === 'industry'}
								<div 
									class="absolute top-full left-0 right-0 mt-1 z-20 border border-[var(--line)]"
									style="background-color: var(--bg);"
								>
									{#each industryOptions as option}
										<div
											role="button"
											tabindex="0"
											onclick={() => selectOption(option, 'industry')}
											onkeydown={(e) => e.key === 'Enter' && selectOption(option, 'industry')}
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
								onclick={() => toggleDropdown('revenue')}
								onkeydown={(e) => e.key === 'Enter' && toggleDropdown('revenue')}
								class="flex items-baseline gap-2 border-b border-[var(--line)] pb-2 cursor-pointer select-none"
							>
								<span class="whitespace-nowrap" style="font-family: var(--font-serif); font-size: 0.95rem; color: var(--ink);">營收規模</span>
								<span class="flex-1" style="font-family: var(--font-serif); font-size: 0.95rem; color: {formData.revenue ? 'var(--ink)' : 'var(--muted)'};">{formData.revenue || '請選擇'}</span>
								<svg class="w-3 h-3" style="color: var(--line-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
									<polyline points="6 9 12 15 18 9"></polyline>
								</svg>
							</div>
							{#if activeDropdown === 'revenue'}
								<div 
									class="absolute top-full left-0 right-0 mt-1 z-20 border border-[var(--line)]"
									style="background-color: var(--bg);"
								>
									{#each revenueOptions as option}
										<div
											role="button"
											tabindex="0"
											onclick={() => selectOption(option, 'revenue')}
											onkeydown={(e) => e.key === 'Enter' && selectOption(option, 'revenue')}
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

					<div class="flex justify-center pt-8">
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
					</div>

					{#if submitMessage}
						<p class="text-center text-sm mt-6 {submitMessage.includes('成功') ? 'text-green-600' : 'text-red-600'}">
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
		style="padding: clamp(80px,8vw,120px) 0 44px;"
	>
		<div class="wrap grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
			<div>
				<a href="/" class="inline-block" aria-label="奕成財創">
					<img src="/yclogo.svg" alt="奕成財創 Logo" class="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
				</a>
				<p class="body-copy mt-6 max-w-[340px]">
					協助台灣成長型企業，<br
					/>把財務資料轉成可執行的經營決策。
				</p>
				<div class="meta mt-7" style="line-height: 2;">
					contact@yicheng.finance
				</div>
			</div>
			{#each footerColumns as col}
				<div>
					<h5 class="foot-heading">
						{col.title}<small>{col.en}</small>
					</h5>
					<ul class="list-none p-0 m-0">
						{#each col.links as link}
							<li class="mb-3">
								<a href={link.href} class="foot-link">{link.label}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}

			<div
				class="col-span-full mt-[60px] pt-6 border-t border-[var(--line-2)] flex justify-between flex-wrap gap-4 foot-meta"
			>
				<span>&copy; 2026 奕成財創</span>
				<span>Fractional CFO · 財務治理與決策支持 · 保密條款</span>
			</div>
		</div>
	</footer>
</div>
