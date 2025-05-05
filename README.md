# get-diff-data-action

![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)

Use this template to bootstrap the creation of a TypeScript action. :rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.

If you are new, there's also a simpler introduction in the
[Hello world JavaScript action repository](https://github.com/actions/hello-world-javascript-action).

## Create Your Own Action

To create your own action, you can use this repository as a template! Just follow the below instructions:

1. Click the **Use this template** button at the top of the repository
1. Select **Create a new repository**
1. Select an owner and name for your new repository
1. Click **Create repository**
1. Clone your new repository

## Initial Setup

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

2. :building_construction: Package the TypeScript for distribution

   ```bash
   npm run bundle
   ```

3. :white_check_mark: Run the tests

   ```bash
   npm test
   ```

4. (Optional) Test your action locally

   The [`@github/local-action`](https://github.com/github/local-action) utility can be used to test your action locally.
   It is a simple command-line tool that "stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run your
   TypeScript action locally without having to commit and push your changes to a repository.

   The `local-action` utility can be run in the following ways:

   - Visual Studio Code Debugger

     Make sure to review and, if needed, update [`.vscode/launch.json`](./.vscode/launch.json)

   - Terminal/Command Prompt

     ```bash
     # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
     npx @github/local-action . src/main.ts .env
     ```

   You can provide a `.env` file to the `local-action` CLI to set environment variables used by the GitHub Actions
   Toolkit. For example, setting inputs and event payload data used by your action. For more information, see the
   example file, [`.env.example`](./.env.example), and the
   [GitHub Actions Documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).

Your action is now published! :rocket:

## Validate the Action

You can now validate the action by referencing it in a workflow file. For example,
[`ci.yml`](./.github/workflows/ci.yml) demonstrates how to reference an action in the same repository.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: ./
    with: ...
```

For example workflow runs, check out the [Actions tab](https://github.com/actions/typescript-action/actions)! :rocket:

## Usage

After testing, you can create version tag(s) that developers can use to reference different stable versions of your
action. For more information, see [Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
in the GitHub Actions toolkit.

To include the action in a workflow in another repository, you can use the `uses` syntax with the `@` symbol to
reference a specific branch, tag, or commit hash.

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - name: Test Local Action
    id: test-action
    uses: actions/typescript-action@v1 # Commit with the `v1` tag
    with: ...
```

## Publishing a New Release

This project includes a helper script, [`script/release`](./script/release) designed to streamline the process of
tagging and pushing new releases for GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use, based on release tags. This script
simplifies this process by performing the following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most recent SemVer release tag of the
   current branch, by looking at the local data available in your repository.
1. **Prompting for a new release tag:** The user is then prompted to enter a new release tag. To assist with this, the
   script displays the tag retrieved in the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
1. **Tagging the new release:** The script then tags a new release and syncs the separate major tag (e.g. v1, v2) with
   the new release tag (e.g. v1.0.0, v2.1.2). When the user is creating a new major release, the script auto-detects
   this and creates a `releases/v#` branch for the previous major version.
1. **Pushing changes to remote:** Finally, the script pushes the necessary commits, tags and branches to the remote
   repository. From here, you will need to create a new release in GitHub so users can easily reference the new tags in
   their workflows.
