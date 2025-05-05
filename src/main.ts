import * as core from '@actions/core';
import { getCommits } from './gh-diff.js';

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(new Date().toTimeString());
    const result = await getCommits();
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
