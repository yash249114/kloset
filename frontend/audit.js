// Simple audit script for Kloset platform
// This script checks for common issues without requiring browser automation

const fs = require('fs');
const path = require('path');

// Global audit results
const auditResults = {
  passed: 0,
  failed: 0,
  issues: [],
  buttonAudits: [],
  workflowAudits: [],
  routeAudits: [],
  consoleErrors: [],
  accessibilityIssues: []
};

function log(message) {
  console.log(message);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

async function auditAllPages() {
  log('\n🔍 Starting comprehensive platform audit...');
  
  // Define all routes to audit
  const routes = [
    { path: '/', name: 'Homepage', role: 'guest' },
    { path: '/discover', name: 'Discover Catalog', role: 'guest' },
    { path: '/auth/login', name: 'Login Page', role: 'guest' },
    { path: '/auth/register', name: 'Register Page', role: 'guest' },
    { path: '/booking/checkout', name: 'Checkout', role: 'guest' },
    { path: '/support', name: 'Support Page', role: 'guest' },
    { path: '/wishlist', name: 'Wishlist', role: 'guest' },
    { path: '/profile', name: 'Profile', role: 'guest' },
  ];
  
  // Audit each route
  for (const route of routes) {
    log(`\n📄 Auditing: ${route.name} (${route.role})`);
    const routeAudit = await auditRoute(route.path, route.name, route.role);
    auditResults.routeAudits.push(routeAudit);
    
    if (routeAudit.status === 'PASS') {
      auditResults.passed++;
      logSuccess(`✅ ${route.name} - All checks passed`);
    } else {
      auditResults.failed++;
      logError(`❌ ${route.name} - ${routeAudit.issues.length} issues found`);
    }
  }
  
  // Generate report
  generateReport();
}

async function auditRoute(routePath, pageName, role) {
  const routeAudit = {
    route: routePath,
    pageName,
    role,
    buttons: [],
    workflows: [],
    issues: [],
    status: 'PASS'
  };
  
  try {
    // Check if page exists
    const pagePath = path.join(__dirname, 'app', routePath === '/' ? 'page.tsx' : `${routePath}/page.tsx`);
    if (!fs.existsSync(pagePath)) {
      routeAudit.issues.push(`Page file not found: ${pagePath}`);
      routeAudit.status = 'FAIL';
      return routeAudit;
    }
    
    // Read and analyze the page file
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    // Check for missing imports
    if (!content.includes('import') && !content.includes('use client')) {
      issues.push('Missing imports or client directive');
    }
    
    // Check for empty components
    if (content.trim().length < 100) {
      issues.push('Component appears to be empty or incomplete');
    }
    
    // Check for syntax errors (basic check)
    if (content.includes('syntax error') || content.includes('Unterminated')) {
      issues.push('Potential syntax errors in component');
    }
    
    // Check for missing navigation links
    if (['/', '/discover', '/auth/login', '/auth/register'].includes(routePath)) {
      const hasNav = content.includes('nav') || content.includes('Nav') || content.includes('navigation');
      if (!hasNav) {
        issues.push('Missing navigation component');
      }
    }
    
    // Check for broken buttons/links
    const brokenElements = detectBrokenElements(content);
    issues.push(...brokenElements);
    
    // Check for accessibility issues
    const accessibilityIssues = detectAccessibilityIssues(content);
    issues.push(...accessibilityIssues);
    
    routeAudit.issues = issues;
    
    if (issues.length > 0) {
      routeAudit.status = 'FAIL';
    }
    
  } catch (error) {
    routeAudit.issues.push(`Audit error: ${error.message}`);
    routeAudit.status = 'ERROR';
  }
  
  return routeAudit;
}

function detectBrokenElements(content) {
  const issues = [];
  
  // Check for broken image paths
  const imageMatches = content.match(/src=['"]([^'"]*)['"]/g) || [];
  for (const match of imageMatches) {
    const src = match.match(/src=['"]([^'"]*)['"]/)[1];
    if (src.includes('undefined') || src.includes('null') || src.includes('broken')) {
      issues.push(`Potentially broken image: ${src}`);
    }
  }
  
  // Check for broken links
  const linkMatches = content.match(/href=['"]([^'"]*)['"]/g) || [];
  for (const match of linkMatches) {
    const href = match.match(/href=['"]([^'"]*)['"]/)[1];
    if (href.includes('undefined') || href.includes('null') || href === '#' || href.startsWith('javascript:')) {
      issues.push(`Potentially broken link: ${href}`);
    }
  }
  
  // Check for missing alt attributes on images
  const imgTags = content.match(/<img[^>]*>/g) || [];
  for (const img of imgTags) {
    if (!img.includes('alt=') && !img.includes('/>')) {
      issues.push('Image missing alt attribute');
    }
  }
  
  return issues;
}

function detectAccessibilityIssues(content) {
  const issues = [];
  
  // Check for missing aria labels
  const interactiveElements = content.match(/<button[^>]*>/g) || [];
  for (const element of interactiveElements) {
    if (!element.includes('aria-label') && !element.includes('aria-labelledby')) {
      issues.push('Interactive element missing aria-label');
    }
  }
  
  // Check for missing form labels
  const inputTags = content.match(/<input[^>]*>/g) || [];
  for (const input of inputTags) {
    if (!input.includes('id=') || !content.includes(`id="${input.match(/id="([^"]*)"/)[1]}"\s+for=`)) {
      issues.push('Input element missing associated label');
    }
  }
  
  return issues;
}

function generateReport() {
  log('\n' + '='.repeat(80));
  log('📊 KLOSÉT PLATFORM AUDIT REPORT');
  log('='.repeat(80));
  
  log(`\n📈 SUMMARY:
  ✅ Passed: ${auditResults.passed}
  ❌ Failed: ${auditResults.failed}
  📋 Total Audits: ${auditResults.passed + auditResults.failed}
  📊 Success Rate: ${((auditResults.passed / (auditResults.passed + auditResults.failed)) * 100).toFixed(1)}%
`);
  
  log('\n📋 ROUTE AUDITS:');
  auditResults.routeAudits.forEach(route => {
    const statusIcon = route.status === 'PASS' ? '✅' : route.status === 'FAIL' ? '❌' : '⚠️';
    log(`  ${statusIcon} ${route.pageName} (${route.route}) - ${route.status}`);
    if (route.issues.length > 0) {
      log(`    Issues: ${route.issues.join(', ')}`);
    }
  });
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: auditResults.routeAudits.length,
      passed: auditResults.passed,
      failed: auditResults.failed,
      successRate: (auditResults.passed / (auditResults.passed + auditResults.failed)) * 100
    },
    routeAudits: auditResults.routeAudits,
    consoleErrors: auditResults.consoleErrors,
    accessibilityIssues: auditResults.accessibilityIssues
  };
  
  // Save report to file
  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with error code if any critical failures
  if (auditResults.failed > 0) {
    process.exit(1);
  }
}

// Run the audit
async function main() {
  try {
    await auditAllPages();
  } catch (error) {
    logError(`Audit failed: ${error.message}`);
    process.exit(1);
  }
}

main();
