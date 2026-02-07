/**
 * Script to test which catalog sources are working
 * Run with: npx ts-node scripts/testSources.ts
 */

import { sourceCatalog } from '../lib/data/sourceCatalog';

interface TestResult {
  id: string;
  name: string;
  url: string;
  status: 'ok' | 'error';
  error?: string;
  articleCount?: number;
}

async function testSource(source: typeof sourceCatalog[0]): Promise<TestResult> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'InfoNexus/1.0 (RSS Reader)',
        Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        id: source.id,
        name: source.name,
        url: source.url,
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();

    // Basic check: does it look like XML?
    if (!text.includes('<?xml') && !text.includes('<rss') && !text.includes('<feed')) {
      return {
        id: source.id,
        name: source.name,
        url: source.url,
        status: 'error',
        error: 'Not valid XML/RSS',
      };
    }

    // Count items/entries
    const itemCount = (text.match(/<item/gi) || []).length + (text.match(/<entry/gi) || []).length;

    return {
      id: source.id,
      name: source.name,
      url: source.url,
      status: 'ok',
      articleCount: itemCount,
    };
  } catch (err) {
    return {
      id: source.id,
      name: source.name,
      url: source.url,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('Testing catalog sources...\n');

  const results: TestResult[] = [];

  for (const source of sourceCatalog) {
    process.stdout.write(`Testing ${source.name}... `);
    const result = await testSource(source);
    results.push(result);

    if (result.status === 'ok') {
      console.log(`✅ OK (${result.articleCount} articles)`);
    } else {
      console.log(`❌ FAIL: ${result.error}`);
    }
  }

  console.log('\n--- SUMMARY ---');
  const working = results.filter(r => r.status === 'ok');
  const broken = results.filter(r => r.status === 'error');

  console.log(`Working: ${working.length}/${results.length}`);
  console.log(`Broken: ${broken.length}/${results.length}`);

  if (broken.length > 0) {
    console.log('\nBroken sources:');
    broken.forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
}

main().catch(console.error);
