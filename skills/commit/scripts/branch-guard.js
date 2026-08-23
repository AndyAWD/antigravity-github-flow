#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const [, , kind, name] = process.argv;
if (!kind || !name) {
  console.error('usage: branch-guard.js <branch-type> <branch-name>');
  process.exit(1);
}

const git = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const gitLoud = (args) => execFileSync('git', args, { stdio: 'inherit' });

const cur = git(['symbolic-ref', '--short', 'HEAD']);

const create = (b) => {
  console.log(`建立分支 ${b}...`);
  gitLoud(['checkout', '-b', b]);
};

if (cur === 'main' || cur === 'master') {
  if (kind === 'direct' || kind === 'main') {
    console.log(`已確認直接在 ${cur} 主分支上進行提交。`);
  } else {
    const branchName = name.includes('/') ? name : `${kind}/${name}`;
    console.log(`在 ${cur} 上偵測到新變更，從 ${cur} 建立分支 ${branchName}...`);
    create(branchName);
  }
} else {
  console.log(`已在分支 ${cur}，直接使用該分支提交。`);
}
