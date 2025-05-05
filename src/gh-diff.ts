export interface CommitData {
  sha: string;
  commit: {
    message: string;
  };
}

export interface FileData {
  filename: string;
  status: string;
  raw_url: string;
  patch: string;
  sha: string;
}

const SCALAR_SEPARATOR = ',';

async function guardApiResponse(
  errMsg: string,
  response: { ok: boolean; statusText: string; text: () => Promise<string> }
) {
  if (!response.ok) {
    const repo = process.env.GITHUB_REPOSITORY;
    const token = process.env.GITHUB_TOKEN;
    const responseText = await response.text();
    throw new Error(`
      ${errMsg}: 
      ${responseText}
      Env:
      GITHUB_REPOSITORY: ${repo}
      GITHUB_TOKEN: ${token}`);
  }
}

export async function getCommits() {
  const repo = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.INPUT_PR_NUMBER;
  const dataSeparator = process.env.INPUT_DATA_SEPARATOR;
  const issuePattern = process.env.INPUT_ISSUE_PATTERN;
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'nodejs-action-script',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  const commitsUrl = `https://api.github.com/repos/${repo}/pulls/${prNumber}/commits`;
  const filesUrl = `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`;

  const filesResp = await fetch(filesUrl, {
    method: 'GET',
    headers
  });
  const commitsResp = await fetch(commitsUrl, {
    method: 'GET',
    headers
  });

  guardApiResponse('Failed to fetch commits', commitsResp);
  guardApiResponse('Failed to fetch files', filesResp);

  const files = (await filesResp.json()) as FileData[];
  const commits = (await commitsResp.json()) as CommitData[];

  const lastCommitSha = commits.length > 0 ? commits[commits.length - 1].sha : null;

  const commitMessages = commits.map((c) => `- ${c.commit.message}`).join(dataSeparator);

  const filenamesList: string[] = [];
  const patchesList: string[] = [];
  const rawFilesList: string[] = [];
  const issuesList: string[] = [];
  if (issuePattern) {
    const issueMatches = commitMessages.match(new RegExp(issuePattern, 'g'));
    if (issueMatches) {
      for (const match of issueMatches) {
        issuesList.push(match);
      }
    }
  }

  for (const file of files) {
    filenamesList.push(file.filename);
    patchesList.push(file.patch);
    if (!lastCommitSha) {
      continue;
    }
    const fileContentUrl = `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${lastCommitSha}`;
    console.log('fileContentUrl', fileContentUrl);
    const fileContentResp = await fetch(fileContentUrl, {
      method: 'GET',
      headers: {
        ...headers,
        Accept: 'application/vnd.github.v3.raw'
      }
    });
    guardApiResponse('Failed to fetch file content', fileContentResp);
    const rawFile = await fileContentResp.text();
    rawFilesList.push(rawFile);
  }

  const uniqueIssues = Array.from(new Set(issuesList));
  return {
    filenames: filenamesList.join(SCALAR_SEPARATOR),
    commitMessages: commitMessages,
    patches: patchesList.join(dataSeparator),
    rawFiles: rawFilesList.join(dataSeparator),
    issues: uniqueIssues.join(SCALAR_SEPARATOR)
  };
}
