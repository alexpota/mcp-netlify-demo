#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const DEPLOY_ID = escapeHtml(process.env.DEPLOY_ID || 'local');
const COMMIT_REF = escapeHtml(process.env.COMMIT_REF || 'main');
const BUILD_ID = escapeHtml(process.env.BUILD_ID || '1');
const CONTEXT = escapeHtml(process.env.CONTEXT || 'production');

console.log('Building with Netlify environment:');
console.log(`  Deploy ID: ${DEPLOY_ID}`);
console.log(`  Commit: ${COMMIT_REF}`);
console.log(`  Build: ${BUILD_ID}`);
console.log(`  Context: ${CONTEXT}`);

try {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  const versionPattern = /v1\.0\.\d+/g;
  html = html.replace(versionPattern, `v1.0.${BUILD_ID}`);
  
  const deployPattern = /Deploy #\d+/g;
  html = html.replace(deployPattern, `Deploy #${BUILD_ID}`);
  
  if (!html.includes('meta name="deploy-id"')) {
    const metaTags = `    <meta name="deploy-id" content="${DEPLOY_ID}">
    <meta name="commit-ref" content="${COMMIT_REF}">
    <meta name="build-id" content="${BUILD_ID}">
    <meta name="deploy-context" content="${CONTEXT}">`;

    html = html.replace('</head>', `${metaTags}\n</head>`);
  }

  fs.writeFileSync(htmlPath, html);

  console.log('✅ Build complete with real deployment data!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}