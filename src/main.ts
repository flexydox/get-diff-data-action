import * as core from '@actions/core';
import { getCommits, GetCommitsInput } from './gh-diff.js';

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

    if (result.rawFiles.length > 0) {
      core.info('Raw files length: ' + result.rawFiles.length);
    }

    core.setOutput('raw-files', result.rawFiles);
    core.setOutput('issues', result.issues);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
