#!/usr/bin/env node
import { existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join, basename, dirname } from 'path';
import { randomUUID } from 'crypto';
import degit from 'degit';
import * as p from '@clack/prompts';
import pc from 'picocolors';

// Agent configuration
type Agent = {
  readonly name: string;
  readonly dir: string;
  readonly detect: () => boolean;
};

const AGENTS: readonly Agent[] = [
  {
    name: 'Claude Code',
    dir: '.claude/skills',
    detect: () =>
      existsSync(join(homedir(), '.claude', 'settings.json')) ||
      existsSync(join(homedir(), '.claude', 'projects.json')) ||
      existsSync(join(homedir(), '.claude', 'credentials.json')),
  },
  {
    name: 'Cursor',
    dir: '.cursor/skills',
    detect: () =>
      existsSync(join(homedir(), '.cursor', 'extensions')) ||
      existsSync(join(homedir(), '.cursor', 'argv.json')),
  },
  {
    name: 'Windsurf',
    dir: '.codeium/windsurf/skills',
    detect: () =>
      existsSync(join(homedir(), '.codeium', 'windsurf', 'config.json')) ||
      existsSync(join(homedir(), '.codeium', 'windsurf', 'argv.json')),
  },
  {
    name: 'Cline',
    dir: '.cline/skills',
    detect: () => existsSync(join(homedir(), '.cline', 'settings.json')),
  },
  {
    name: 'Codex',
    dir: '.codex/skills',
    detect: () =>
      existsSync(join(homedir(), '.codex', 'config.json')) ||
      existsSync(join(homedir(), '.codex', 'settings.json')),
  },
  {
    name: 'Copilot',
    dir: '.copilot/skills',
    detect: () => existsSync(join(homedir(), '.copilot', 'config.json')),
  },
];

function showBanner(): void {
  if (process.stdout.isTTY) {
    console.log();
    console.log(pc.cyan('  ≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋'));
    console.log(`    ${pc.cyan('><>')}  ${pc.bold('SKILL FISH')}  ${pc.cyan('><>')}`);
    console.log(pc.cyan('  ≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋'));
    console.log(pc.dim('         skill.fish'));
    console.log();
  }
}

function showHelp(): void {
  console.log(`
${pc.bold('skillfish')} - Install AI agent skills from GitHub

${pc.bold('Usage:')}
  skillfish add <owner/repo> [options]    Install skill(s)
  skillfish list <owner/repo>             List available skills
  skillfish <owner/repo> [options]        Shorthand for 'add'

${pc.bold('Options:')}
  --path <path>   Explicit path to skill directory within repo
  --force         Overwrite existing skills
  --local         Install to current project (./.claude/skills)
  --global        Install to home directory (~/.claude/skills)
  --help, -h      Show this help message

${pc.bold('Examples:')}
  skillfish add anthropics/claude-code
  skillfish list EveryInc/compound-engineering-plugin
  skillfish add user/repo --path plugins/my-plugin/skills/my-skill
  skillfish add owner/repo --force

${pc.bold('Environment:')}
  GITHUB_TOKEN or GH_TOKEN - For private repos
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  // Parse command
  let command: 'add' | 'list';
  let repoArg: string;
  let flags: string[];

  if (args[0] === 'add') {
    command = 'add';
    repoArg = args[1];
    flags = args.slice(2);
  } else if (args[0] === 'list') {
    command = 'list';
    repoArg = args[1];
    flags = args.slice(2);
  } else {
    // Backwards compatible: treat first arg as repo (shorthand for 'add')
    command = 'add';
    repoArg = args[0];
    flags = args.slice(1);
  }

  if (!repoArg || repoArg.startsWith('--')) {
    showHelp();
    process.exit(1);
  }

  // Parse repo format
  const parts = repoArg.split('/');
  let owner: string;
  let repo: string;
  let explicitPath: string | null = null;

  const pathIdx = flags.indexOf('--path');
  if (pathIdx !== -1) {
    if (pathIdx + 1 >= flags.length || flags[pathIdx + 1]?.startsWith('--')) {
      console.error('--path requires a value');
      process.exit(1);
    }
    explicitPath = flags[pathIdx + 1];
  }

  if (parts.length === 2) {
    [owner, repo] = parts;
  } else if (parts.length === 4) {
    const [o, r, plugin, skill] = parts;
    owner = o;
    repo = r;
    explicitPath = explicitPath || `plugins/${plugin}/skills/${skill}`;
  } else {
    console.error('Invalid format. Use: owner/repo or owner/repo/plugin/skill');
    process.exit(1);
  }

  if (!owner || !repo || !/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) {
    console.error('Invalid repository format. Use: owner/repo');
    process.exit(1);
  }

  // Execute command
  if (command === 'list') {
    await listSkills(owner, repo);
  } else {
    showBanner();
    await addSkills(owner, repo, explicitPath, flags);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST command
// ─────────────────────────────────────────────────────────────────────────────

async function listSkills(owner: string, repo: string): Promise<void> {
  const skillPaths = await findAllSkillMdFiles(owner, repo);

  if (skillPaths.length === 0) {
    console.error('No SKILL.md found in repository.');
    process.exit(1);
  }

  console.log(`\n${pc.bold(`Skills in ${owner}/${repo}:`)} (${skillPaths.length} found)\n`);

  for (const sp of skillPaths) {
    const skillDir = sp === 'SKILL.md' ? '.' : dirname(sp);
    const skillName = sp === 'SKILL.md' ? repo : basename(skillDir);
    const path = skillDir === '.' ? '(root)' : skillDir;
    console.log(`  ${pc.green('><>')} ${pc.bold(skillName)} ${pc.dim(path)}`);
  }

  console.log(`\n${pc.dim(`Run: skillfish add ${owner}/${repo}`)}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD command
// ─────────────────────────────────────────────────────────────────────────────

async function addSkills(
  owner: string,
  repo: string,
  explicitPath: string | null,
  flags: string[]
): Promise<void> {
  const force = flags.includes('--force');
  const localFlag = flags.includes('--local');
  const globalFlag = flags.includes('--global');

  // 1. Discover or select skills
  const skillPaths = explicitPath
    ? [explicitPath]
    : await discoverSkillPaths(owner, repo);

  if (!skillPaths || skillPaths.length === 0) {
    process.exit(1);
  }

  // 2. Determine install location
  const baseDir = await selectInstallLocation(localFlag, globalFlag);

  // 3. Select agents
  const detected = AGENTS.filter(a => a.detect());

  if (detected.length === 0) {
    console.error('No supported agents detected. Install Claude Code, Cursor, or another supported agent first.');
    process.exit(1);
  }

  let targetAgents: readonly Agent[];

  if (!process.stdin.isTTY) {
    console.log(`Installing to ${detected.length} agent(s): ${detected.map(a => a.name).join(', ')}`);
    targetAgents = detected;
  } else {
    targetAgents = await selectAgents(detected);
  }

  // Install each selected skill
  let totalInstalled = 0;
  let totalSkipped = 0;

  for (const skillPath of skillPaths) {
    const skillName = deriveSkillName(skillPath, repo);
    const result = await installSkill(owner, repo, skillPath, skillName, targetAgents, force, baseDir);
    totalInstalled += result.installed;
    totalSkipped += result.skipped;
  }

  // Summary
  console.log();
  if (totalInstalled > 0) {
    p.outro(pc.green(`Installed ${totalInstalled} skill(s)`));
  } else {
    p.outro(pc.yellow('No skills installed. Use --force to overwrite.'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

async function selectInstallLocation(localFlag: boolean, globalFlag: boolean): Promise<string> {
  if (localFlag) {
    console.log(`Installing to: ${pc.cyan('project')} (./${AGENTS[0].dir})`);
    return process.cwd();
  }
  if (globalFlag) {
    console.log(`Installing to: ${pc.cyan('global')} (~/${AGENTS[0].dir})`);
    return homedir();
  }

  if (!process.stdin.isTTY) {
    return homedir();
  }

  const location = await p.select({
    message: 'Where should skills be installed?',
    options: [
      { value: 'global', label: 'Global', hint: `~/${AGENTS[0].dir} - Available in all projects` },
      { value: 'local', label: 'Project', hint: `./${AGENTS[0].dir} - Local to this project` },
    ],
  });

  if (p.isCancel(location)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const baseDir = location === 'local' ? process.cwd() : homedir();
  const prefix = location === 'local' ? '.' : '~';
  console.log(`Installing to: ${pc.cyan(location as string)} (${prefix}/${AGENTS[0].dir})`);

  return baseDir;
}

async function selectAgents(agents: readonly Agent[]): Promise<readonly Agent[]> {
  const agentNames = agents.map(a => a.name).join(', ');

  const installAll = await p.confirm({
    message: `Install to all agents? (${agentNames})`,
    initialValue: true,
  });

  if (p.isCancel(installAll)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (installAll) return agents;

  const options = agents.map(a => ({ value: a.name, label: a.name, hint: `~/${a.dir}` }));

  const selected = await p.multiselect({
    message: 'Select agents to install to',
    options,
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return agents.filter(a => selected.includes(a.name));
}

async function discoverSkillPaths(owner: string, repo: string): Promise<string[] | null> {
  const skillPaths = await findAllSkillMdFiles(owner, repo);

  if (skillPaths.length === 0) {
    console.error('No SKILL.md found in repository.');
    return null;
  }

  if (skillPaths.length === 1) {
    const path = skillPaths[0] === 'SKILL.md' ? 'SKILL.md' : dirname(skillPaths[0]);
    return [path];
  }

  const options = skillPaths.map(sp => {
    const skillDir = sp === 'SKILL.md' ? '.' : dirname(sp);
    const skillName = sp === 'SKILL.md' ? repo : basename(skillDir);
    return {
      value: skillDir === '.' ? 'SKILL.md' : skillDir,
      label: skillName,
      hint: skillDir === '.' ? 'root' : skillDir,
    };
  });

  if (!process.stdin.isTTY) {
    console.log(`\nFound ${skillPaths.length} skills in this repository:`);
    for (const opt of options) {
      console.log(`  - ${opt.label}`);
    }
    console.error('\nMultiple skills found. Use --path to specify which one.');
    return null;
  }

  console.log(`\nFound ${skillPaths.length} skills in this repository:\n`);

  const selected = await p.multiselect({
    message: 'Select skills to install (space to toggle, enter to confirm)',
    options,
    required: true,
  });

  if (p.isCancel(selected)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return selected;
}

type InstallResult = { installed: number; skipped: number; failed: boolean };

async function installSkill(
  owner: string,
  repo: string,
  skillPath: string,
  skillName: string,
  agents: readonly Agent[],
  force: boolean,
  baseDir: string
): Promise<InstallResult> {
  const result: InstallResult = { installed: 0, skipped: 0, failed: false };
  const isLocal = baseDir !== homedir();
  const pathPrefix = isLocal ? '.' : '~';

  console.log(`\nInstalling skill: ${pc.bold(skillName)} from ${skillPath}`);

  const tmpDir = join(homedir(), '.cache', 'install-skill', `${owner}-${repo}-${randomUUID()}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    const downloadPath = skillPath === 'SKILL.md' ? '' : skillPath;
    const degitPath = downloadPath ? `${owner}/${repo}/${downloadPath}` : `${owner}/${repo}`;

    const s = p.spinner();
    s.start(`Downloading ${skillName}...`);

    const emitter = degit(degitPath, { cache: false, force: true });
    await emitter.clone(tmpDir);

    const skillMdPath = join(tmpDir, 'SKILL.md');
    if (!existsSync(skillMdPath)) {
      s.stop(pc.red('SKILL.md not found'));
      console.error(`Error: SKILL.md not found. Path may be incorrect.`);
      result.failed = true;
      return result;
    }

    s.stop(pc.green('Downloaded'));

    for (const agent of agents) {
      const destDir = join(baseDir, agent.dir, skillName);

      if (existsSync(destDir) && !force) {
        console.log(`  ${pc.yellow('○')} ${agent.name} ${pc.dim('(exists, use --force)')}`);
        result.skipped++;
        continue;
      }

      mkdirSync(join(baseDir, agent.dir), { recursive: true });
      if (existsSync(destDir)) rmSync(destDir, { recursive: true });
      cpSync(tmpDir, destDir, { recursive: true });
      console.log(`  ${pc.green('><>')} ${agent.name}: ${pc.dim(`${pathPrefix}/${agent.dir}/${skillName}`)}`);
      result.installed++;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(pc.red(`Error: ${message}`));
    result.failed = true;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  return result;
}

function deriveSkillName(skillPath: string, repoName: string): string {
  if (skillPath === 'SKILL.md' || skillPath === './SKILL.md') return repoName;
  const normalized = skillPath.replace(/\/SKILL\.md$/i, '');
  const name = basename(normalized);
  return /^[\w.-]+$/.test(name) ? name : repoName;
}

async function findAllSkillMdFiles(owner: string, repo: string): Promise<string[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = { 'User-Agent': 'skillfish' };
  if (token) headers.Authorization = `token ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers, signal: controller.signal }
    );

    if (!res.ok) {
      if (res.status === 403) {
        const remaining = res.headers.get('X-RateLimit-Remaining');
        if (remaining === '0') {
          console.error('GitHub API rate limit exceeded. Set GITHUB_TOKEN for higher limits.');
          return [];
        }
      }

      const res2 = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        { headers, signal: controller.signal }
      );
      if (!res2.ok) {
        if (res2.status === 404) {
          console.error('Repository not found. Check owner/repo or set GITHUB_TOKEN for private repos.');
        }
        return [];
      }
      const data = await res2.json() as { tree?: Array<{ path: string; type: string }> };
      return (data.tree || [])
        .filter(item => item.type === 'blob' && item.path.endsWith('SKILL.md'))
        .map(item => item.path);
    }

    const data = await res.json() as { tree?: Array<{ path: string; type: string }> };
    return (data.tree || [])
      .filter(item => item.type === 'blob' && item.path.endsWith('SKILL.md'))
      .map(item => item.path);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('Request timed out. Check your network connection.');
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

main().catch(err => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Error:', message);
  process.exit(1);
});
