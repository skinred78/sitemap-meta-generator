# Quick Setup Guide

## 1. Prerequisites

- Node.js 18+ installed
- OpenAI API key

## 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

## 3. Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local and add your API key
# OPENAI_API_KEY=sk-your-key-here
```

## 4. Run the App

```bash
# Development mode
npm run dev

# Open http://localhost:3000 in your browser
```

## 5. Usage

1. Drag and drop your `sitemap.xml` file
2. Click "Generate Meta Tags"
3. Wait for processing (1-2 minutes for 100 URLs)
4. Review results in the table
5. Click "Download CSV" to get your file

## Cost Estimate

- ~$0.10-0.20 per 100 URLs using GPT-4o-mini
- First-time OpenAI users get $5 free credits

## Troubleshooting

### "Processing failed" error
- Check that your OpenAI API key is correct in `.env.local`
- Make sure you have credits in your OpenAI account
- Verify the sitemap.xml file is valid

### URLs not loading
- Some URLs may be behind firewalls or down
- These will show as errors but won't stop processing
- Failed URLs will have error messages in the results

### Japanese characters not displaying in CSV
- Open CSV with Excel or Google Sheets
- The file includes UTF-8 BOM for proper encoding
- If issues persist, import as UTF-8 encoded file

## Production Deployment

### Docker (Recommended)

```bash
# Build
docker build -t sitemap-meta-generator .

# Run
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... sitemap-meta-generator
```

### Vercel/Railway

```bash
# Add environment variable in platform settings:
# OPENAI_API_KEY=sk-...

# Deploy
npm run build
```

## Support

For issues: https://github.com/sam/sitemap-meta-generator/issues
