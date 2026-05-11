import { spawn } from 'node:child_process';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const CONTACT_TO_EMAIL = env.CONTACT_TO_EMAIL ?? 'cando.yeh@ycfinance.tw';
const CONTACT_FROM_EMAIL = env.CONTACT_FROM_EMAIL ?? 'contact-form@yicheng.finance';
const SENDMAIL_PATH = env.SENDMAIL_PATH ?? '/usr/sbin/sendmail';

/* ── Rate limiting (in-memory, per IP) ── */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateMap.get(ip);
	if (!entry || now > entry.resetAt) {
		rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return true;
	}
	if (entry.count >= RATE_LIMIT) return false;
	entry.count++;
	return true;
}

type ContactPayload = {
	companyName: string;
	name: string;
	phone: string;
	email: string;
	industry: string;
	revenue: string;
};

function normalizeText(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function sanitizeHeader(value: string) {
	return value.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function buildContactPayload(data: Record<string, unknown>): ContactPayload {
	return {
		companyName: normalizeText(data.companyName),
		name: normalizeText(data.name),
		phone: normalizeText(data.phone),
		email: normalizeText(data.email),
		industry: normalizeText(data.industry),
		revenue: normalizeText(data.revenue)
	};
}

function validatePayload(data: ContactPayload) {
	const requiredEntries = Object.entries(data);
	for (const [field, value] of requiredEntries) {
		if (!value) {
			return `缺少必填欄位：${field}`;
		}
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(data.email)) {
		return 'Email 格式不正確';
	}

	const maxLengths: Record<keyof ContactPayload, number> = {
		companyName: 120,
		name: 80,
		phone: 40,
		email: 120,
		industry: 40,
		revenue: 80
	};

	for (const [field, limit] of Object.entries(maxLengths) as Array<[keyof ContactPayload, number]>) {
		if (data[field].length > limit) {
			return `${field} 長度超過限制`;
		}
	}

	return null;
}

function buildEmailContent(data: ContactPayload) {
	const subject = sanitizeHeader(`【網站預約】${data.companyName} / ${data.name}`);
	const plainText = [
		'奕成財創網站收到新的 30 分鐘訪談預約。',
		'',
		`公司名稱：${data.companyName}`,
		`姓名：${data.name}`,
		`電話：${data.phone}`,
		`Email：${data.email}`,
		`產業別：${data.industry}`,
		`營收規模：${data.revenue}`
	].join('\n');

	const html = `
		<h2>奕成財創網站收到新的 30 分鐘訪談預約</h2>
		<table style="border-collapse:collapse;">
			<tr><td style="padding:6px 12px 6px 0;"><strong>公司名稱</strong></td><td>${escapeHtml(data.companyName)}</td></tr>
			<tr><td style="padding:6px 12px 6px 0;"><strong>姓名</strong></td><td>${escapeHtml(data.name)}</td></tr>
			<tr><td style="padding:6px 12px 6px 0;"><strong>電話</strong></td><td>${escapeHtml(data.phone)}</td></tr>
			<tr><td style="padding:6px 12px 6px 0;"><strong>Email</strong></td><td>${escapeHtml(data.email)}</td></tr>
			<tr><td style="padding:6px 12px 6px 0;"><strong>產業別</strong></td><td>${escapeHtml(data.industry)}</td></tr>
			<tr><td style="padding:6px 12px 6px 0;"><strong>營收規模</strong></td><td>${escapeHtml(data.revenue)}</td></tr>
		</table>
	`.trim();

	return { subject, plainText, html };
}

async function sendViaResend(data: ContactPayload) {
	const apiKey = env.RESEND_API_KEY;
	const resendFromEmail = env.RESEND_FROM_EMAIL;

	if (!apiKey || !resendFromEmail) {
		return false;
	}

	const { subject, plainText, html } = buildEmailContent(data);
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: resendFromEmail,
			to: [CONTACT_TO_EMAIL],
			reply_to: data.email,
			subject,
			text: plainText,
			html
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Resend API error: ${response.status} ${errorText}`);
	}

	return true;
}

async function sendViaSendmail(data: ContactPayload) {
	const { subject, plainText, html } = buildEmailContent(data);
	const boundary = `boundary_${Date.now().toString(36)}`;
	const message = [
		`To: ${sanitizeHeader(CONTACT_TO_EMAIL)}`,
		`From: ${sanitizeHeader(CONTACT_FROM_EMAIL)}`,
		`Reply-To: ${sanitizeHeader(data.email)}`,
		`Subject: ${subject}`,
		'MIME-Version: 1.0',
		`Content-Type: multipart/alternative; boundary="${boundary}"`,
		'',
		`--${boundary}`,
		'Content-Type: text/plain; charset="UTF-8"',
		'Content-Transfer-Encoding: 8bit',
		'',
		plainText,
		'',
		`--${boundary}`,
		'Content-Type: text/html; charset="UTF-8"',
		'Content-Transfer-Encoding: 8bit',
		'',
		html,
		'',
		`--${boundary}--`,
		''
	].join('\n');

	await new Promise<void>((resolve, reject) => {
		const child = spawn(SENDMAIL_PATH, ['-t', '-i']);
		let stderr = '';

		child.stderr.on('data', (chunk) => {
			stderr += chunk.toString();
		});

		child.on('error', reject);
		child.on('close', (code) => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`sendmail exited with code ${code}: ${stderr}`));
		});

		child.stdin.write(message);
		child.stdin.end();
	});
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		const ip = getClientAddress();
		if (!checkRateLimit(ip)) {
			return json(
				{ success: false, message: '請求過於頻繁，請稍後再試。' },
				{ status: 429 }
			);
		}

		const rawData = (await request.json()) as Record<string, unknown>;
		const data = buildContactPayload(rawData);
		const validationError = validatePayload(data);

		if (validationError) {
			return json({ success: false, message: validationError }, { status: 400 });
		}

		const sentViaResend = await sendViaResend(data);
		if (!sentViaResend) {
			await sendViaSendmail(data);
		}

		return json({ success: true, message: '提交成功' });
	} catch (err) {
		console.error('Contact form error:', err);
		return json(
			{
				success: false,
				message: `寄信失敗，請稍後再試，或直接來信至 ${CONTACT_TO_EMAIL}`
			},
			{ status: 500 }
		);
	}
};
