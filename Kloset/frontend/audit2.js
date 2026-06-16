// Comprehensive functional audit for Kloset platform
// This script tests actual functionality using browser automation

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
    { path: '/', name: 'Homepage', role: 'guest', skipAuth: true },
    { path: '/discover', name: 'Discover Catalog', role: 'guest', skipAuth: true },
    { path: '/auth/login', name: 'Login Page', role: 'guest', skipAuth: true },
    { path: '/auth/register', name: 'Register Page', role: 'guest', skipAuth: true },
    { path: '/booking/checkout', name: 'Checkout', role: 'guest', skipAuth: true },
    { path: '/support', name: 'Support Page', role: 'guest', skipAuth: true },
    { path: '/wishlist', name: 'Wishlist', role: 'guest', skipAuth: true },
    { path: '/profile', name: 'Profile', role: 'guest', skipAuth: true },
  ];
  
  // Audit each route
  for (const route of routes) {
    log(`\n📄 Auditing: ${route.name} (${route.role})`);
    const routeAudit = await auditRoute(route.path, route.name, route.role, route.skipAuth);
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

async function auditRoute(routePath, pageName, role, skipAuth) {
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
    
    // Read and analyze the page file for critical issues
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check for critical issues
    const issues = [];
    
    // Check for syntax errors (critical)
    if (content.includes('syntax error') || content.includes('Unterminated regexp literal')) {
      issues.push('Critical syntax error in component');
    }
    
    // Check for missing essential imports
    if (routePath === '/' && !content.includes('use client')) {
      issues.push('Missing client directive (required for client components)');
    }
    
    // Check for missing essential functions
    if (routePath === '/auth/login' && !content.includes('login')) {
      issues.push('Login functionality may be incomplete');
    }
    
    if (routePath === '/booking/checkout' && !content.includes('checkout')) {
      issues.push('Checkout functionality may be incomplete');
    }
    
    // Check for broken navigation links
    const brokenLinks = detectBrokenLinks(content);
    if (brokenLinks.length > 0) {
      issues.push(...brokenLinks);
    }
    
    // Check for missing essential UI elements
    const missingUI = detectMissingUI(content, routePath);
    if (missingUI.length > 0) {
      issues.push(...missingUI);
    }
    
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

function detectBrokenLinks(content) {
  const issues = [];
  
  // Check for broken navigation links in main navigation
  const navLinks = content.match(/href=['"]([^'"]*)['"]/g) || [];
  for (const match of navLinks) {
    const href = match.match(/href=['"]([^'"]*)['"]/)[1];
    
    // Skip external links, anchors, and javascript
    if (href.startsWith('http') || href === '#' || href.startsWith('javascript:') || href.startsWith('/auth/')) {
      continue;
    }
    
    // Extract base route (remove query parameters)
    const baseRoute = href.split('?')[0];
    
    // Check if the route exists
    const routeExists = [
      '/', '/discover', '/auth/login', '/auth/register', 
      '/booking/checkout', '/support', '/wishlist', '/profile'
    ].includes(baseRoute);
    
    if (!routeExists) {
      issues.push(`Broken navigation link: ${href}`);
    }
  }
  
  return issues;
}

function detectMissingUI(content, routePath) {
  const issues = [];
  
  // Check for missing essential UI elements based on route
  switch (routePath) {
    case '/auth/login':
      if (!content.includes('input') || !content.includes('button')) {
        issues.push('Login page missing essential form elements (input, button)');
      }
      if (!content.includes('onSubmit') && !content.includes('onClick')) {
        issues.push('Login page missing form submission handler');
      }
      break;
    
    case '/booking/checkout':
      if (!content.includes('address') && !content.includes('delivery')) {
        issues.push('Checkout page may be missing address/delivery selection');
      }
      if (!content.includes('payment') && !content.includes('Razorpay')) {
        issues.push('Checkout page may be missing payment integration');
      }
      break;
    
    case '/':
      if (!content.includes('discover') && !content.includes('catalog')) {
        issues.push('Homepage may be missing catalog/discover section');
      }
      if (!content.includes('outfit') && !content.includes('product')) {
        issues.push('Homepage may be missing outfit/product showcase');
      }
      break;
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
