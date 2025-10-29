# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Sitemap Meta Generator

A tool that processes XML sitemaps to generate SEO-optimized Japanese page titles and meta descriptions.

### Core Requirements
- **Input**: XML sitemap file containing URLs
- **Processing**: For each URL, fetch the page and generate/extract:
  - Japanese page title (SEO optimized)
  - Japanese meta description (SEO optimized)
  - Character counts for both
- **Output**: CSV file with columns: URL, Page Title, Meta Description, Title Char Count, Description Char Count

### SEO Best Practices
- Japanese title length: 30-35 characters (optimal for Google SERP display)
- Japanese meta description length: 80-120 characters (optimal for Google SERP display)
- Titles should be compelling and include primary keywords
- Descriptions should provide clear value proposition

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.claude/workflows/primary-workflow.md`
- Development rules: `./.claude/workflows/development-rules.md`
- Orchestration protocols: `./.claude/workflows/orchestration-protocol.md`
- Documentation management: `./.claude/workflows/documentation-management.md`

**IMPORTANT:** You must follow strictly the development rules in `./.claude/workflows/development-rules.md` file.
**IMPORTANT:** Before you plan or proceed any implementation, always read the `./README.md` file first to get context.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.

## Documentation Management

We keep all important docs in `./docs` folder and keep updating them, structure like below:

```
./docs
├── project-overview-pdr.md
├── code-standards.md
├── codebase-summary.md
├── design-guidelines.md
├── deployment-guide.md
├── system-architecture.md
└── project-roadmap.md
```