import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validate required fields
		const required = ['companyName', 'name', 'phone', 'email', 'industry', 'revenue'];
		for (const field of required) {
			if (!data[field]) {
				return error(400, `Missing required field: ${field}`);
			}
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(data.email)) {
			return error(400, 'Invalid email format');
		}

		// TODO: Send email or save to database
		// For now, just log the data
		console.log('Contact form submission:', data);

		// TODO: Integrate with email service (Sendgrid, Resend, etc.)
		// or database (Supabase, Firebase, etc.)

		return json({ success: true, message: '提交成功' });
	} catch (err) {
		console.error('Contact form error:', err);
		return error(500, 'Internal server error');
	}
};
