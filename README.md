# Sitemap Meta Generator

A web-based SEO tool that processes XML sitemaps to automatically generate SEO-optimized Japanese page titles and meta descriptions with character counts, outputting results to CSV format.

## Purpose

This tool helps SEO professionals and content managers efficiently create optimized meta tags for Japanese websites by:
- Parsing XML sitemaps to extract URLs
- Fetching and analyzing each page's existing meta tags
- Improving meta tags using AI (OpenAI GPT-4o-mini) for Japanese SEO
- Calculating character counts to ensure SERP display compliance
- Exporting all data to a structured CSV file

## Features

- ✅ **Web Interface**: Simple drag-and-drop file upload
- ✅ **XML Sitemap Parsing**: Automatically extract URLs from sitemap files
- ✅ **AI-Powered Improvement**: Uses OpenAI to improve existing meta tags for Japanese SEO
- ✅ **Style Guide Compliance**: Validates content against configurable Japanese style rules (terminology, grammar, tone)
- ✅ **Smart Model Selection**: GPT-4o (fast/cheap) with automatic o1-mini retry on low compliance (<85%)
- ✅ **Compliance Scoring**: 0-100% score with detailed violation tracking
- ✅ **Character Count Validation**: Ensure optimal length for Google SERP display (30-35 chars for titles, 80-120 for descriptions)
- ✅ **Real-time Processing**: See progress as URLs are processed
- ✅ **CSV Export**: Clean, structured output with UTF-8 BOM for proper Japanese encoding
- ✅ **Error Handling**: Gracefully handle unreachable URLs or parsing errors

## Style Guide System

This tool enforces Japanese content quality through configurable style rules. See [docs/style-guide.md](docs/style-guide.md) for details.

### Quick Overview

**Rule Categories**:
- Forbidden terms (e.g., あなた - too informal)
- Required terms (e.g., 校正 for proofreading context)
- Forbidden grammar (e.g., ましょう - avoid suggestion form)
- Tone guidelines (professional, third-person)

**Validation Process**:
1. GPT-4o generates meta tags
2. Validator scores compliance (0-100%)
3. If < 85%, auto-retry with o1-mini
4. Results show score + violations in UI

**Cost Trade-off**:
- GPT-4o: Fast, cheap ($0.001/URL), ~70-80% compliance
- o1-mini: Slower, expensive ($0.015/URL), ~95-100% compliance

### Configuration

Edit `lib/style-guide.json`:

```json
{
  "terminology": {
    "forbidden": [{"term": "あなた", "reason": "Too informal"}],
    "required": [{"term": "校正", "note": "Use for proofreading"}]
  },
  "grammar": {
    "forbidden_forms": [{"form": "ましょう", "reason": "Avoid suggestions"}]
  },
  "tone": {
    "formality": "Professional/Academic",
    "pov": "Third person"
  }
}
```

## SEO Best Practices

### Japanese Title Tags
- **Optimal Length**: 30-35 characters
- **Best Practices**:
  - Include primary keywords naturally
  - Be compelling and descriptive
  - Avoid keyword stuffing
  - Front-load important terms

### Japanese Meta Descriptions
- **Optimal Length**: 80-120 characters
- **Best Practices**:
  - Provide clear value proposition
  - Include call-to-action when appropriate
  - Use natural language
  - Complement (don't duplicate) the title

## Output Format

CSV file with the following columns:
- `URL`: The page URL from the sitemap
- `Page Title`: SEO-optimized Japanese page title
- `Meta Description`: SEO-optimized Japanese meta description
- `Title Char Count`: Number of characters in the title
- `Description Char Count`: Number of characters in the description

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Runtime**: Node.js 18+
- **Styling**: Tailwind CSS
- **XML Parsing**: fast-xml-parser
- **Web Scraping**: Cheerio + Axios
- **CSV Generation**: PapaParse
- **AI Integration**: OpenAI GPT-4o-mini for Japanese meta tag improvement
- **Concurrency**: p-limit for rate-limited URL processing

## Getting Started

### Prerequisites
- Node.js 18 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/sam/sitemap-meta-generator.git
cd sitemap-meta-generator

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key:
# OPENAI_API_KEY=sk-...
```

### Usage

```bash
# Start the development server
npm run dev

# Open your browser to http://localhost:3000
# Upload your sitemap.xml file
# Wait for processing to complete
# Download the CSV with improved meta tags
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development with ClaudeKit

This project is built using [ClaudeKit](https://claudekit.cc/), which provides AI-powered agent orchestration for efficient development.

### Available Commands

- `/plan` - Create implementation plans
- `/cook` - Execute planned features
- `/test` - Run tests and validation
- `/review` - Perform code quality review
- `/docs` - Update documentation

### Project Structure

```
├── .claude/              # Claude Code configuration
├── .opencode/            # Agent definitions
├── docs/                 # Documentation
│   └── style-guide.md    # Style guide system docs
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   │   └── process/      # Sitemap processing endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page with compliance UI
├── lib/                  # Core functionality
│   ├── style-guide/      # Style guide system
│   │   ├── types.ts      # TypeScript interfaces
│   │   ├── config.ts     # Config loader
│   │   ├── validator.ts  # Compliance validation
│   │   └── prompt-builder.ts # Prompt injection
│   ├── style-guide.json  # Style rules config
│   ├── sitemap-parser.ts # XML sitemap parsing
│   ├── url-fetcher.ts    # URL fetching and meta extraction
│   └── meta-improver.ts  # LLM with GPT-4o/o1-mini retry
└── plans/                # Implementation plans
```

## How It Works

1. **Upload**: Drag and drop your sitemap.xml file
2. **Parse**: URLs are extracted from the sitemap (limited to 100 URLs in MVP)
3. **Fetch**: Each URL is fetched to extract existing title and meta description
4. **Improve**: OpenAI improves meta tags following Japanese style guide:
   - **First attempt**: GPT-4o (fast, ~$0.10 per 100 URLs)
   - **Auto-retry**: o1-mini if compliance < 85% (~$1.50 per 100 URLs)
   - Validates: forbidden terms, required terms, grammar rules, tone
   - Titles: 30-35 characters (optimal for Google SERP)
   - Descriptions: 80-120 characters (optimal for Google SERP)
5. **Validate**: Each result scored 0-100% on style compliance
6. **Export**: Download results as CSV with compliance scores and violations

## Limitations (MVP)

- Processes up to 100 URLs per sitemap
- Concurrent processing limited to 5 URLs at a time
- 10-second timeout per URL fetch
- Requires OpenAI API key
  - GPT-4o only: ~$0.10 per 100 URLs (if all pass first attempt)
  - With o1-mini retries: ~$0.10-1.50 per 100 URLs (depends on compliance rate)

## Future Enhancements

- [ ] Unlimited URL processing
- [ ] Advanced rate limiting with robots.txt respect
- [ ] Job persistence and history
- [ ] Progress tracking with websockets
- [ ] Sitemap index support (nested sitemaps)
- [ ] Batch job queue
- [ ] User authentication for team deployment
- [ ] Custom LLM configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue: https://github.com/sam/sitemap-meta-generator/issues
- Documentation: See `/docs` folder

---

Built with [ClaudeKit](https://claudekit.cc/) - AI-powered development workflows
