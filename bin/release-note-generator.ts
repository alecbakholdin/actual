import { existsSync, writeFile } from 'node:fs';
import { exit } from 'node:process';

import prompts from 'prompts';

async function run() {
  const result = await prompts([
    {
      name: 'pullRequestNumber',
      message: 'Existing PR number (if applicable)',
      type: 'number',
    },
    {
      name: 'releaseNoteType',
      message: 'Release Note Type',
      type: 'select',
      choices: [
        { title: 'Features', value: 'Features' },
        { title: 'Enhancements', value: 'Enhancements' },
        { title: 'Bugfix', value: 'Bugfix' },
        { title: 'Maintenance', value: 'Maintenance' },
      ],
    },
    {
      name: 'oneLineSummary',
      message: 'Brief Summary',
      type: 'text',
    },
    {
      name: 'githubUsername',
      message: 'Comma-separated GitHub username(s)',
      type: 'text',
    },
  ]);

  if (
    !result.githubUsername ||
    !result.oneLineSummary ||
    !result.releaseNoteType
  ) {
    console.log('All questions must be answered. Exiting');
    exit(1);
  }

  const fileContents = getFileContents(
    result.releaseNoteType,
    result.githubUsername,
    result.oneLineSummary,
  );

  let prNumber = result.pullRequestNumber || (await getNextPrNumber());
  // Ensure PR number is a positive integer
  prNumber = String(parseInt(String(prNumber), 10));
  if (!/^\d+$/.test(prNumber)) {
    console.error('Invalid PR number format. Exiting.');
    exit(1);
  }

  const filepath = `./upcoming-release-notes/${prNumber}.md`;
  if (existsSync(filepath)) {
    const { confirm } = await prompts({
      name: 'confirm',
      type: 'confirm',
      message: `This will overwrite the existing release note ${filepath} Are you sure?`,
    });
    if (!confirm) {
      console.log('Exiting');
      exit(1);
    }
  }

  writeFile(filepath, fileContents, err => {
    if (err) {
      console.error('Failed to write release note file:', err);
      exit(1);
    } else {
      console.log(
        `Release note generated successfully: ./upcoming-release-notes/${prNumber}.md`,
      );
    }
  });
}

async function getNextPrNumber(): Promise<number> {
  try {
    const resp = await fetch(
      'https://internal.floralily.dev/next-pr-number-api/?owner=actualbudget&name=actual',
    );
    if (!resp.ok) {
      throw new Error(`API responded with status: ${resp.status}`);
    }
    const prNumberText = await resp.text();
    return parseInt(prNumberText);
  } catch (error) {
    console.error('Failed to fetch next PR number:', error);
    exit(1);
  }
}

function getFileContents(type: string, username: string, summary: string) {
  return `---
category: ${type}
authors: [${username}]
---

${summary}
`;
}

run();
