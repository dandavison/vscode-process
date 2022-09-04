const { spawn } = require('node:child_process');
const { dirname, resolve } = require('node:path');
import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('Process');
const log = outputChannel.appendLine;
outputChannel.show();

export function activate(context: vscode.ExtensionContext) {
  const catalog: [string, () => Promise<void>][] = [
    ['process.emacsclient', emacsclient],
    ['process.magitStatus', magitStatus],
  ];
  for (const [command, handler] of catalog) {
    context.subscriptions.push(vscode.commands.registerCommand(command, handler));
  }
}

export function deactivate() {}

async function emacsclient() {
  const path = vscode.window.activeTextEditor?.document.uri.path;
  spawn('emacsclient', ['-n', path]);
}

async function magitStatus(): Promise<void> {
  const cwd = dirname(vscode.window.activeTextEditor?.document.uri.path);
  log(`Running in ${cwd} (resolve => ${resolve(cwd)})`);
  const result = spawn('bash', ['/Users/ddavison/src/emacs-config/bin/emacs-magit-status'], { cwd });
  result.stderr.on('data', (data: string) => {
    log(`stderr: ${data}`);
  });
  result.stdout.on('data', (data: string) => {
    log(`stdout: ${data}`);
  });
}
