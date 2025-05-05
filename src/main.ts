import * as core from '@actions/core';
import { getCommits, GetCommitsInput } from './gh-diff.js';
const MAX_RAW_FILES_SIZE_KB = 100;
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(new Date().toTimeString());
    const repo = process.env.GITHUB_REPOSITORY ?? '';
    const prNumber = process.env['INPUT_PR-NUMBER'] ?? '';
    const dataSeparator = process.env['INPUT_DATA-SEPARATOR'] ?? ',';
    const issuePattern = process.env['INPUT_ISSUE-PATTERN'];
    const token = process.env.GITHUB_TOKEN ?? '';

    core.debug(`repo: ${repo}`);
    core.debug(`prNumber: ${prNumber}`);
    core.debug(`dataSeparator: ${dataSeparator}`);
    core.debug(`issuePattern: ${issuePattern}`);

    if (prNumber === '') {
      core.info('PR number is not provided. Exiting.');
      return;
    }
    if (repo === '') {
      core.info('Repository is not provided. Exiting.');
      return;
    }
    if (token === '') {
      core.info('GitHub token is not provided. Exiting.');
      return;
    }

    const commitArgs: GetCommitsInput = {
      repo,
      prNumber,
      dataSeparator,
      issuePattern,
      token
    };
    const result = await getCommits(commitArgs);
    core.debug(result.issues);

    core.setOutput('commit-messages', result.commitMessages);
    core.setOutput('files', result.filenames);
    core.setOutput('patches', result.patches);
    const sizeInKB = Math.ceil(result.rawFiles.length / 1024);
    core.info('Raw files length (kB): ' + sizeInKB);
    if (sizeInKB > MAX_RAW_FILES_SIZE_KB) {
      core.warning(`Raw files length exceeds ${MAX_RAW_FILES_SIZE_KB}kB.`);
      core.info('Dropping raw files output.');
      core.setOutput('raw-files', '');
    } else {
      core.setOutput('raw-files', result.rawFiles);
    }
    core.setOutput('issues', result.issues);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
