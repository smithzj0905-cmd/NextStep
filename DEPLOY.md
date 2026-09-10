# Deploy NextStep for the first live beta

## 1. Create the AI API key
Create an OpenAI API key in the OpenAI developer dashboard. Keep it secret; it belongs only in the server environment variable `OPENAI_API_KEY`.

## 2. Test locally
```bash
npm install
cp .env.example .env.local
# Put your key in .env.local
npm run dev
```
Open http://localhost:3000.

## 3. Deploy
Push this folder to a GitHub repository, then import that repository into Vercel. Vercel automatically detects Next.js projects.

Set these environment variables in the Vercel project:
- OPENAI_API_KEY = your key
- OPENAI_MODEL = gpt-5.6-luna (or another model available to your account)

Deploy. Vercel will give the site a live URL.

## 4. Before inviting strangers
- Add a privacy policy and terms page.
- Add a clear deletion policy.
- Do not log uploaded document contents or API responses in production.
- Keep `store: false` in the OpenAI request.
- Consider adding rate limits before public launch.
- Do not market the tool as legal, tax, medical, immigration, or financial advice.
