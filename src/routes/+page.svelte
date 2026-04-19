<script lang="ts">
	import { ArrowRight } from "lucide-svelte";

	const allChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "$"];
	const COLS = 30;
	const ROWS = 30;
	const gridRows: string[][] = [];
	for (let r = 0; r < ROWS; r++) {
		const row: string[] = [];
		for (let c = 0; c < COLS; c++) {
			row.push(allChars[(r * 7 + c * 13) % allChars.length]);
		}
		gridRows.push(row);
	}

	const navLinks = [
		{ href: "#about", label: "理念" },
		{ href: "#problem", label: "痛點" },
		{ href: "#cases", label: "案例" },
		{ href: "#roi", label: "費用" },
		{ href: "#faq", label: "FAQ" }
	];

	const aboutPainCards = [
		{ title: "財務人員異動", desc: "交接混亂，帳務品質與節奏失控" },
		{ title: "融資或募資前", desc: "需要財務資料時，才發現數字不可用" },
		{ title: "稅務壓力或查核", desc: "開始意識到合規與交易風險" },
		{ title: "業務擴張期", desc: "新店/新通路決策放大現金與獲利風險" }
	];

	const problemCards = [
		{
			who: "多品牌電商",
			text: "會計人員高流動，讓公司錯過",
			mark: "爆發性成長市場機會",
			rest: "。"
		},
		{
			who: "軟體服務新創",
			text: "進入融資或募資階段，才發現",
			mark: "財務數字無法被投資人與銀行採信",
			rest: "。"
		},
		{
			who: "製造加工企業",
			text: "收到稅局罰稅或查核時，才意識到",
			mark: "經營模式存在重大合規風險",
			rest: "。"
		},
		{
			who: "連鎖餐飲品牌",
			text: "準備擴張新店與新通路時，",
			mark: "現金流與獲利模型不足以支撐決策",
			rest: "。"
		}
	];

	const caseItems = [
		{
			ind: "加工出口製造",
			title: "收到罰稅/查核後，完全不清楚為什麼被罰了天價稅款。",
			desc: "多年沿用同一申報模式，查核時才暴露交易與稅務邏輯斷層。",
			result: "罰款降96%",
			sub: "釐清稅務風險"
		},
		{
			ind: "跨境金融科技",
			title: "我們要募資了，但財務資料混亂，經不起查核。",
			desc: "跨美台中營運口徑不一致，募資前資料無法快速採信。",
			result: "募得400萬美金",
			sub: "通過四大查核"
		},
		{
			ind: "跨境遊戲公司",
			title: "跨國交易衍生許多稅務成本，大幅削減獲利能力。",
			desc: "多法域交易流未優化，稅務成本與合規風險同步放大。",
			result: "稅負降46%",
			sub: "跨境合規化"
		},
		{
			ind: "軟體新創公司",
			title: "仍在草創階段，資源有限，無暇顧及財稅管理問題。",
			desc: "先建最低可運作治理，再隨成長節奏逐步升級。",
			result: "營收達1400萬",
			sub: "取得900萬投資"
		},
		{
			ind: "活動公關公司",
			title: "只記現金流水帳，數字無法支撐經營決策。",
			desc: "專案多、節奏亂，原有帳務看不到專案真實損益。",
			result: "專案損益可視",
			sub: "報表雙軸上線"
		},
		{
			ind: "國際貿易公司",
			title: "財會人員缺乏經營邏輯，做不出老闆要的管理報表。",
			desc: "帳務偏合規導向，無法回答獲利來源與現金壓力。",
			result: "管報上線",
			sub: "穩定月報節奏"
		}
	];

	const impactStats = [
		{
			en: "Avg. Savings & Earnings",
			num: "200",
			unit: "萬+/年",
			label: "平均幫客戶省下或多賺"
		},
		{ en: "Time to Insight", num: "30", unit: "秒", label: "老闆頁看完掌握全貌" },
		{
			en: "Blind Spot",
			num: "10–20",
			unit: "%",
			label: "憑經驗估 vs 實際成本差距"
		},
		{
			en: "Hidden Loss",
			num: "50–150",
			unit: "萬",
			label: "虧損門市 / 通路發現"
		},
		{ en: "Cost Waste", num: "30–80", unit: "萬", label: "費用結構優化" },
		{
			en: "Funding Inflow",
			num: "1~3",
			unit: "千萬",
			label: "貸款 / 募資到位"
		}
	];

	const processSteps = [
		{
			num: "01",
			title: "財務問題辨認",
			time: "2 小時",
			price: "NT$ 3,000",
			desc: "現金流、獲利、內控、合規四大面向快速盤點。產出風險評分與 Top 3 優先議題。",
			note: "簽約後全額抵扣"
		},
		{
			num: "02",
			title: "導入期",
			time: "2～4 週",
			price: "NT$ 30,000～50,000",
			desc: "了解你的帳、建立月報模板、對齊科目口徑、定義追蹤單位。",
			note: "一次性費用，50%可抵維護月費"
		},
		{
			num: "03",
			title: "每月經營診斷",
			time: "持續",
			price: "NT$ 25,000～65,000/月",
			desc: "月財報 + 行動清單 + LINE 群同步 + 每月檢討會議。",
			note: "視實際需求調整"
		}
	];

	const faqItems = [
		{
			q: "我已經有會計了，還需要嗎？",
			a:
				"我們不取代你的會計。記帳士做報稅，我們做經營診斷。" +
				"大多數老闆合作後說的是：「我終於看得懂我的數字了。」"
		},
		{
			q: "帳很亂可以合作嗎？",
			a:
				"可以，這正是我們最常遇到的情況。快篩的目的就是先判斷帳的狀況，" +
				"再決定最適合的導入方式。"
		},
		{
			q: "最短合作期間多久？",
			a:
				"建議半年約。前 2 個月我們還在熟悉你的帳，第 3 個月起才能發揮最大價值。" +
				"快篩是一次性服務，沒有綁約。"
		},
		{
			q: "資料會保密嗎？",
			a: "合約中包含完整保密條款，所有財務資訊僅用於服務交付。"
		},
		{
			q: "你們跟會計師事務所是什麼關係？",
			a:
				"互補。法定簽證與稅務申報仍由你的事務所做，我們負責管理報表和經營分析。" +
				"很多事務所反而歡迎我們，因為帳務品質提升讓他們工作也更順。"
		}
	];

	const ctaTags = ["快篩費可抵月費", "半年約 9 折", "LINE 群即時推送", "保密條款"];

	const footerColumns = [
		{
			title: "服務",
			en: "Service",
			links: ["財務快篩", "導入期", "每月經營診斷", "LINE 群同步"]
		},
		{
			title: "資源",
			en: "Resources",
			links: ["案例研究", "服務說明書", "定價策略"]
		},
		{ title: "公司", en: "Company", links: ["關於我們", "隱私政策"] }
	];
</script>

<svelte:head>
	<title>奕成財創｜每月經營診斷服務</title>
	<meta
		name="description"
		content="你的生意，每個月到底賺多少？記帳士管報稅，我們管讓你看懂自己的生意。"
	/>
</svelte:head>

<div class="min-h-screen bg-[var(--bg)]">
	<!-- ─── NAV ─── -->
	<nav
		class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[var(--line)]"
	>
		<div
			class="max-w-[980px] mx-auto px-6 h-14 flex items-center justify-between"
		>
			<a href="/" class="text-sm font-semibold tracking-wide">奕成財創</a>
			<div class="hidden md:flex items-center gap-10">
				{#each navLinks as link}
					<a href={link.href} class="nav-link">{link.label}</a>
				{/each}
			</div>
			<a href="#contact" class="nav-link">Contact</a>
		</div>
	</nav>

	<!-- ─── HERO ─── -->
	<section
		class="relative overflow-hidden bg-white"
		style="height: 100vh; min-height: 600px;"
	>
		<div
			class="absolute inset-0 overflow-hidden"
			style="perspective: 3000px; perspective-origin: 100% 100%;"
		>
			<div
				class="select-none absolute"
				style="
					bottom: 15%; left: -90%;
					width: 250%; height: 250%;
					display: flex; flex-direction: column; align-items: center; justify-content: center;
					transform: rotateX(-20deg) rotateY(0deg) rotateZ(-20deg);
					transform-origin: center center;
					font-size: 36px;
					line-height: 1.7;
					letter-spacing: 0.3em;
					font-weight: 800;
					color: var(--line-2);
					white-space: nowrap;
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
		</div>
		<div
			class="absolute inset-x-0 top-14 bg-gradient-to-b from-white to-transparent pointer-events-none"
			style="height: 10%;"
		></div>
		<div
			class="absolute bottom-12 right-8 md:bottom-16 md:right-16 text-right z-10 max-w-[420px]"
		>
			<p class="meta tracking-widest uppercase mb-3">
				Fractional CFO for SMBs
			</p>
			<h1
				class="font-[var(--font-serif)] text-[var(--text-nav)] font-medium text-[var(--ink)] tracking-[0.06em] mb-1"
			>
				奕成財創｜企業成長的財務夥伴
			</h1>
			<p class="body-copy text-[var(--ink-2)] opacity-70 leading-snug">
				把財務數字，變成支撐成長的經營工具
			</p>
		</div>
	</section>

	<!-- ─── PRINCIPLE ─── -->
	<section
		id="about"
		style="padding-top: var(--sec-top); padding-bottom: var(--sec);"
	>
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title">
					奕成財創 について<span class="sec-en">— About</span>
				</h2>
				<p class="sec-intro">
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
				<div>
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
				<div>
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
			<div class="max-w-[980px] mx-auto mt-[clamp(52px,6vw,84px)]">
				<p class="about-trigger-intro">
					奕成財創最常在成長型企業面臨以下四大困境時被找進來：
				</p>
				<div class="about-trigger-grid">
					{#each aboutPainCards as pain}
						<div class="about-trigger-card">
							<h4>{pain.title}</h4>
							<p>{pain.desc}</p>
						</div>
					{/each}
				</div>
				<p class="about-closing body-copy">
					奕成財創以獨創並持續迭代的 4P
					財務治理框架™，
					透過問題辨識（Probe）、治理優化（Process）、
					分析上線（Pilot）與決策追蹤（Performance），
					協助企業解決前述困境。
				</p>
			</div>
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
				<h2 class="sec-title">
					老闆の疑問<span class="sec-en">— Problem</span>
				</h2>
				<p class="sec-intro">
					同樣的四個問題，每天在老闆心裡反覆出現。<br
					/>這不是你的問題，這是大多數中小企業主的日常。
				</p>
			</div>

			<div
				class="max-w-[1240px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
			>
				{#each problemCards as q}
					<div class="quote-cell">
						<p class="quote-text mb-5">
							{q.text}<span class="quote-mark">{q.mark}</span
							>{q.rest}
						</p>
						<p class="quote-who">{q.who}</p>
					</div>
				{/each}
			</div>

			<div class="mt-[clamp(80px,8vw,120px)] text-center">
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
	<section id="cases" style="padding-bottom: var(--sec);">
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title">
					事例紹介<span class="sec-en">— Cases</span>
				</h2>
				<p class="sec-intro">真實情境改編，客戶資訊已匿名處理。</p>
			</div>

			<div class="border-t border-[var(--line)]">
				{#each caseItems as c}
					<div class="case-row">
						<div class="meta uppercase pt-1">{c.ind}</div>
						<div>
							<h3 class="case-title">「{c.title}」</h3>
							<p class="body-copy">{c.desc}</p>
						</div>
						<div class="md:text-right md:min-w-[160px]">
							<div class="case-result">{c.result}</div>
							<div class="meta mt-1">{c.sub}</div>
						</div>
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
				<h2 class="sec-title">
					数字で見る<span class="sec-en">— Impact & ROI</span>
				</h2>
				<p class="sec-intro">
					以下數字來自代表性案例與保守估算，實際成效依產業型態與帳務基礎而異。
				</p>
			</div>

			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border-t border-b border-[var(--line)]"
			>
				{#each impactStats as s, i}
					<div
						class="stat-cell {i % 3 !== 2
							? 'md:border-r border-[var(--line)]'
							: ''} {i < 3
							? 'md:border-b border-[var(--line)]'
							: ''}"
					>
						<div class="meta uppercase mb-[18px]">{s.en}</div>
						<div class="stat-num">
							{s.num}<span class="unit">{s.unit}</span>
						</div>
						<div class="body-copy mt-5">{s.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── PROCESS ─── -->
	<section style="padding-top: var(--sec-top); padding-bottom: var(--sec);">
		<div class="wrap">
			<div class="text-center mb-[clamp(60px,7vw,100px)]">
				<h2 class="sec-title">
					始め方<span class="sec-en">— Process</span>
				</h2>
				<p class="sec-intro">
					快篩費用可全額抵扣第一個月月費。等於免費試用。
				</p>
			</div>

			<div
				class="grid md:grid-cols-3 border-t border-l border-[var(--line)]"
			>
				{#each processSteps as s}
					<div class="step-cell">
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
				<h2 class="sec-title">
					よくある質問<span class="sec-en">— FAQ</span>
				</h2>
			</div>

			<div class="max-w-[920px] mx-auto divide-y divide-[var(--line)]">
				{#each faqItems as faq}
					<div class="py-8">
						<h3 class="faq-q">{faq.q}</h3>
						<p class="body-copy max-w-[640px]">{faq.a}</p>
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
		<div class="wrap text-center">
			<div class="mb-[clamp(40px,4vw,64px)]">
				<h2 class="sec-title">
					お問い合わせ<span class="sec-en">— Contact</span>
				</h2>
			</div>

			<h3 class="cta-headline">
				現在最簡單的一步，<br />是一次<span
					class="border-b-2 border-[var(--rule)] pb-1">財務快篩</span
				>。
			</h3>
			<p class="body-copy max-w-[620px] mx-auto mb-14">
				2 小時，你就能知道——你的帳現在在什麼狀態、最該先處理的 3
				個問題、適合你的合作方案。<br />NT$ 18,000，簽約月費後全額抵扣。
			</p>
			<div class="flex gap-6 justify-center flex-wrap items-center">
				<a href="mailto:contact@yicheng.finance" class="btn-primary">
					預約財務快篩
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
			<div class="cta-tags">
				{#each ctaTags as tag}
					<span>＋ {tag}</span>
				{/each}
			</div>
		</div>
	</section>

	<!-- ─── FOOTER ─── -->
	<footer
		class="bg-[var(--bg-deep)] border-t border-[var(--line)]"
		style="padding: clamp(80px,8vw,120px) 0 44px;"
	>
		<div class="wrap grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
			<div>
				<a href="/" class="foot-brand">奕成財創</a>
				<p class="body-copy mt-6 max-w-[340px]">
					成為台灣中小企業的外包財務長。<br
					/>記帳士管報稅，我們管讓你看懂自己的生意。
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
								<a href="#contact" class="foot-link">{link}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}

			<div
				class="col-span-full mt-[60px] pt-6 border-t border-[var(--line-2)] flex justify-between flex-wrap gap-4 foot-meta"
			>
				<span>&copy; 2026 奕成財創</span>
				<span>Fractional CFO · 每月經營診斷 · 保密條款</span>
			</div>
		</div>
	</footer>
</div>
