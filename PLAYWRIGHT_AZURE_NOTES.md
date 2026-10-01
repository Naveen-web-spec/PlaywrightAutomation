# Playwright + Azure CI/CD Notes

## Understanding

My understanding is mostly correct, with one important clarification:

- GitHub is the trigger and orchestrator.
- When code is pushed to GitHub, GitHub Actions starts a workflow job.
- The actual browser execution can happen in Azure Playwright Service instead of the GitHub runner.
- The GitHub job still calls the Playwright CLI and waits for results, but the browsers run in Azure-managed infrastructure.
- Azure returns test results and reports back to the workflow.

So the flow is:

1. Push code to GitHub
2. GitHub Actions starts the workflow
3. GitHub runner authenticates to Azure
4. Playwright runs using Azure Playwright Service
5. Test results are uploaded and reported back

This is different from a normal local GitHub-hosted CI run where the job installs dependencies and launches browsers on the GitHub runner itself.

---

## Azure Playwright Service vs normal GitHub runner

### Normal GitHub workflow approach
In a standard Playwright GitHub Actions job, we usually do:

- checkout the repo
- setup Node
- install dependencies with `npm ci`
- install browser binaries with `npx playwright install --with-deps`
- run tests on the GitHub runner
- upload artifacts

This step is necessary for normal GitHub-hosted runners because the browser binary and system dependencies are not preinstalled in the container. The command `npx playwright install --with-deps` ensures the Chromium browser and Linux dependencies are available before the test run starts.

### Azure Playwright Service approach
With Azure Playwright Service, the runner may not need to install Playwright browser binaries locally because Azure provides the browser environment.

The workflow still needs:

- Node.js
- project dependencies
- Azure authentication
- Playwright service URL / configuration

But the browser execution itself is often offloaded to Azure.

### Important clarification
If the job is using the Azure Playwright Service, then the browser installation step may be avoided or reduced. However, in the standard GitHub Actions setup used in this project, `npx playwright install --with-deps` is still required because the GitHub runner is the environment running the tests and needs Playwright browsers and OS dependencies installed first.

---

## Role of the config files

### [playwright.config.js](playwright.config.js)
This is the base configuration for the project.

It contains the default test settings such as:

- test folder
- timeout values
- retries
- workers
- reporter
- browser and browser settings
- use options

This file defines how tests normally run locally or in standard CI.

### [playwright.service.config.js](playwright.service.config.js)
This file is specifically for Azure Playwright Service.

It imports the base config from [playwright.config.js](playwright.config.js) and then wraps it with Azure-specific settings using `createAzurePlaywrightConfig`.

Important points:

- it uses `config` from [playwright.config.js](playwright.config.js)
- it adds Azure Playwright Service settings such as:
  - `exposeNetwork`
  - `connectTimeout`
  - `os`
  - `credential`
- it also configures the Azure reporter for Playwright Workspaces

This means the Azure config does not replace the whole test setup; it extends the base config and adds Azure execution features.

The command:

```bash
npx playwright test --config=playwright.service.config.js --workers=4
```

tells Playwright to use the Azure service config instead of the normal local config.

---

## How Azure CI/CD connects to GitHub

The common pattern is:

- GitHub push triggers workflow
- workflow authenticates to Azure using a login step
- Azure Playwright service is configured with environment variables and credentials
- Playwright runs in the Azure-managed environment
- results return to GitHub Actions

The Azure setup is usually done with something like:

```yaml
- name: Azure login
  uses: azure/login@v3
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Run Playwright tests
  env:
    PLAYWRIGHT_SERVICE_URL: ${{ vars.PLAYWRIGHT_SERVICE_URL }}
  run: npx playwright test --config=playwright.service.config.js --workers=4
```

This is the key idea: GitHub runs the command, but Azure executes the browser session.

---

## GitHub workflow notes for [.github/workflows/playwright.yml](.github/workflows/playwright.yml)

This workflow is designed to run Playwright tests on push and pull request.

### What it does

1. Trigger on push or PR to `main` or `master`
2. Checkout repository
3. Setup Node.js
4. Install project dependencies
5. Install Playwright browsers for standard GitHub runner execution
6. Run tests with the project config
7. Split tests across shards
8. Upload blob reports
9. Merge the reports into a final HTML report
10. Upload the final HTML report as an artifact

### Important workflow structure

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: |
          npx playwright test --config=playwright.config.js --workers=4 \
            --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }} \
            --reporter=blob
```

### Notes

- `--shard` splits the suite across multiple workers/jobs. This helps run different test subsets in parallel, improving execution speed.
- `--reporter=blob` is the required reporter mode for this pattern because it stores per-shard results in a blob format that can be merged later.
- `merge-reports` is a separate job that downloads all blobs and creates one HTML report after all shards are complete.
- This is a strong GitHub Actions pattern for large test suites.
- The `--workers` option controls how many test processes run in parallel within a single job or shard.
- `--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}` means each matrix job runs only a portion of the total suite.

### What was missed or misinterpreted

- The `--reporter` flag is not the same as `--report`. The correct flag for Playwright is `--reporter`.
- The browser install step is not optional in a normal GitHub-hosted runner; it is necessary so the runtime has Chrome/Chromium and Linux libraries available.
- Azure Playwright Service is an alternative execution model, not a replacement for all GitHub runner setup. It usually removes the need for local browser installation, but GitHub still needs the workflow configuration and Azure credentials.
- The workflow is not only about GitHub scheduling; it is also about orchestrating the test execution and collecting artifacts.
- A GitHub workflow can run tests locally on GitHub infrastructure or route them to Azure-managed infrastructure depending on how the config is set.

---

## Final summary

My understanding is correct in principle:

- Azure Playwright Service is a hosted browser environment
- GitHub Actions triggers the job
- the actual browser execution can happen in Azure
- [playwright.service.config.js](playwright.service.config.js) extends [playwright.config.js](playwright.config.js) for Azure execution
- the `npx playwright test --config=playwright.service.config.js --workers=4` command is used when running through Azure
- GitHub workflow YAML controls the automation and scheduling of the job

The main correction is that GitHub does not literally “schedule a job in Azure” by itself. Instead, GitHub Actions runs a job that connects to Azure Playwright Service, and Azure performs the browser execution. The test results are then sent back and reported in GitHub.

This is the correct model for Azure-based Playwright CI/CD integration.

### Final practical summary

- Use `npx playwright install --with-deps` in GitHub-hosted CI when running browser tests directly on the runner.
- Use `--shard` to split the suite across multiple workers/jobs in parallel.
- Use `--reporter=blob` when you want to merge all shard results after the run.
- Use Azure Playwright Service when you want a managed browser environment instead of relying on the GitHub runner for browser execution.
- Use [playwright.service.config.js](playwright.service.config.js) when the tests are intended to run through Azure Playwright Service, and use [playwright.config.js](playwright.config.js) for the normal local/GitHub runner setup.
