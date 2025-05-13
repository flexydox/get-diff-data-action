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
  url: string,
  response: { ok: boolean; statusText: string; text: () => Promise<string> }
) {
  if (!response.ok) {
    const repo = process.env.GITHUB_REPOSITORY;
    const token = process.env.GITHUB_TOKEN;
    const responseText = await response.text();
    throw new Error(`
      url: ${url}
      ${errMsg}: 
      ${responseText}
      Env:
      GITHUB_REPOSITORY: ${repo}
      GITHUB_TOKEN: ${token}`);
  }
}

export interface GetCommitsInput {
  repo: string;
  prNumber: string;
  dataSeparator: string;
  issuePattern?: string;
  token: string;
}

export interface GetCommitsOutput {
  filenames: string;
  commitMessages: string;
  patches: string;
  rawFiles: string;
  issues: string;
}

function inferIssues(text: string, issuePattern: string): string[] {
  if (!text) {
    return [];
  }
  console.log('text', text);
  console.log('issuePattern', issuePattern);
  const issuesList: string[] = [];
  const issueMatches = text.match(new RegExp(issuePattern, 'g'));
  if (issueMatches) {
    for (const match of issueMatches) {
      issuesList.push(match);
    }
  }
  return issuesList;
}

export async function getCommits(data: GetCommitsInput): Promise<GetCommitsOutput> {
  const { repo, prNumber, dataSeparator, issuePattern, token } = data;
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'nodejs-action-script',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  const commitsUrl = `https://api.github.com/repos/${repo}/pulls/${prNumber}/commits`;
  const filesUrl = `https://api.github.com/repos/${repo}/pulls/${prNumber}/files`;
  const prUrl = `https://api.github.com/repos/${repo}/pulls/${prNumber}`;

  const prResp = await fetch(prUrl, {
    method: 'GET',
    headers
  });

  const filesResp = await fetch(filesUrl, {
    method: 'GET',
    headers
  });
  const commitsResp = await fetch(commitsUrl, {
    method: 'GET',
    headers
  });

  await guardApiResponse('Failed to fetch PR', prUrl, prResp);
  await guardApiResponse('Failed to fetch commits', commitsUrl, commitsResp);
  await guardApiResponse('Failed to fetch files', filesUrl, filesResp);

  const prData = (await prResp.json()) as {
    title: string;
    body: string;
  };

  const files = (await filesResp.json()) as FileData[];
  const commits = (await commitsResp.json()) as CommitData[];

  const lastCommitSha = commits.length > 0 ? commits[commits.length - 1].sha : null;

  const commitMessages = commits.map((c) => `- ${c.commit.message}`).join(dataSeparator);

  const filenamesList: string[] = [];
  const patchesList: string[] = [];
  const rawFilesList: string[] = [];
  const issuesList: string[] = [];

  if (issuePattern) {
    issuesList.push(...inferIssues(prData.title, issuePattern));
    issuesList.push(...inferIssues(prData.body, issuePattern));
    issuesList.push(...inferIssues(commitMessages, issuePattern));
  }

  for (const file of files) {
    filenamesList.push(file.filename);
    patchesList.push(file.patch);
    if (!lastCommitSha) {
      continue;
    }
    const fileContentUrl = `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${lastCommitSha}`;
    const fileContentResp = await fetch(fileContentUrl, {
      method: 'GET',
      headers: {
        ...headers,
        Accept: 'application/vnd.github.v3.raw'
      }
    });
    try {
      if (fileContentResp.status === 404) {
        continue;
      }
      await guardApiResponse('Failed to fetch file content', fileContentUrl, fileContentResp);
      const rawFile = await fileContentResp.text();
      rawFilesList.push(rawFile);
    } catch (error) {
      console.warn('Failed to fetch file content', error);
    }
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
