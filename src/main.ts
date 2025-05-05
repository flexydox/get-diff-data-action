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
    const prNumber = process.env.INPUT_PR_NUMBER ?? '';
    const dataSeparator = process.env.INPUT_DATA_SEPARATOR ?? ',';
    const issuePattern = process.env.INPUT_ISSUE_PATTERN;
    const token = process.env.GITHUB_TOKEN ?? '';

    core.debug(`repo: ${repo}`);
    core.debug(`prNumber: ${prNumber}`);
    core.debug(`dataSeparator: ${dataSeparator}`);
    core.debug(`issuePattern: ${issuePattern}`);
    core.debug(`envs: ${JSON.stringify(process.env)}`);

    const commitArgs: GetCommitsInput = {
      repo,
      prNumber,
      dataSeparator,
      issuePattern,
      token
    };
    const result = await getCommits(commitArgs);
    core.debug(result.issues);

    //core.setOutput('commit-messages', result.commitMessages);
    core.setOutput('files', result.filenames);
    //core.setOutput('patches', result.patches);
    //core.setOutput('raw-files', result.rawFiles);
    // core.setOutput('issues', result.issues);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
