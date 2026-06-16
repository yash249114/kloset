// Comprehensive audit script for Kloset platform
// This script tests all pages, buttons, workflows, and routes

const { test, expect } = require('@playwright/test');

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

test.describe('KLOSÉT Platform Comprehensive Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cache before each test
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Homepage - Guest Experience', async ({ page }) => {
    await auditPage(page, '/', 'Homepage', 'guest');
  });

  test('Discover Page - Catalog Browse', async ({ page }) => {
    await auditPage(page, '/discover', 'Discover Catalog', 'guest');
  });

  test('Product Detail Page', async ({ page }) => {
    await auditPage(page, '/outfit/1', 'Product Detail', 'guest');
  });

  test('Login Page - Authentication', async ({ page }) => {
    await auditPage(page, '/auth/login', 'Login Page', 'guest');
  });

  test('Register Page - Account Creation', async ({ page }) => {
    await auditPage(page, '/auth/register', 'Register Page', 'guest');
  });

  test('Cart Page - Shopping Cart', async ({ page }) => {
    await auditPage(page, '/booking/checkout', 'Checkout', 'guest');
  });

  test('Support Page - Help Center', async ({ page }) => {
    await auditPage(page, '/support', 'Support Page', 'guest');
  });

  test('Wishlist Page - Saved Items', async ({ page }) => {
    await auditPage(page, '/wishlist', 'Wishlist', 'guest');
  });

  test('Profile Page - User Dashboard', async ({ page }) => {
    await auditPage(page, '/profile', 'Profile', 'guest');
  });
});

async function auditPage(page, route, pageName, role) {
  console.log(`\n🔍 Auditing: ${pageName} (${role}) at ${route}`);
  
  const pageAudit = {
    route,
    pageName,
    role,
    buttons: [],
    workflows: [],
    issues: [],
    status: 'PASS'
  };

  try {
    // Navigate to page
    await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);
    
    // Audit buttons
    const buttonAudits = await auditButtons(page, route);
    pageAudit.buttons = buttonAudits;
    
    // Audit key workflows
    const workflowAudits = await auditWorkflows(page, route);
    pageAudit.workflows = workflowAudits;
    
    // Check for broken elements
    const brokenElements = await checkBrokenElements(page);
    pageAudit.issues.push(...brokenElements);
    
    // Check for missing navigation
    const navIssues = await checkNavigation(page, route);
    pageAudit.issues.push(...navIssues);
    
    // Check for overlapping elements
    const overlapIssues = await checkOverlappingElements(page);
    pageAudit.issues.push(...overlapIssues);
    
    // Check for scroll issues
    const scrollIssues = await checkScrollIssues(page);
    pageAudit.issues.push(...scrollIssues);
    
    // Determine overall status
    if (pageAudit.issues.length > 0) {
      pageAudit.status = 'FAIL';
      auditResults.failed++;
      console.log(`❌ ${pageName} - ${pageAudit.issues.length} issues found`);
    } else {
      auditResults.passed++;
      console.log(`✅ ${pageName} - All checks passed`);
    }
    
    auditResults.buttonAudits.push(...buttonAudits);
    auditResults.workflowAudits.push(...workflowAudits);
    auditResults.routeAudits.push(pageAudit);
    
  } catch (error) {
    console.log(`❌ ${pageName} - Error during audit: ${error.message}`);
    pageAudit.status = 'ERROR';
    pageAudit.issues.push(`Audit failed: ${error.message}`);
    auditResults.failed++;
    auditResults.routeAudits.push(pageAudit);
  }
}

async function auditButtons(page, route) {
  const buttons = [];
  
  try {
    // Get all interactive elements
    const interactiveElements = await page.$$eval('button, a, [role="button"], input[type="button"], input[type="submit"]', elements => {
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        
        return {
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim() || el.getAttribute('aria-label') || '',
          href: el.tagName.toLowerCase() === 'a' ? el.getAttribute('href') : null,
          id: el.id || null,
          classes: el.className,
          visible: rect.width > 0 && rect.height > 0 && computedStyle.display !== 'none',
          clickable: ['A', 'BUTTON', 'INPUT'].includes(el.tagName),
          position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
          hasIcon: el.querySelector('svg, img, i') !== null,
          ariaLabel: el.getAttribute('aria-label') || null,
          tabIndex: el.tabIndex,
          disabled: el.hasAttribute('disabled') || computedStyle.cursor === 'not-allowed'
        };
      });
    });
    
    for (const element of interactiveElements) {
      const buttonAudit = {
        ...element,
        route,
        status: 'PASS',
        issues: []
      };
      
      // Check button visibility
      if (!element.visible) {
        buttonAudit.issues.push('Button is not visible (hidden or zero size)');
        buttonAudit.status = 'FAIL';
      }
      
      // Check if button is clickable
      if (!element.clickable) {
        buttonAudit.issues.push('Element is not clickable');
        buttonAudit.status = 'FAIL';
      }
      
      // Check for empty buttons
      if (!element.text && !element.ariaLabel && element.tagName !== 'input') {
        buttonAudit.issues.push('Button has no accessible text');
        buttonAudit.status = 'FAIL';
      }
      
      // Check for duplicate buttons
      const duplicates = interactiveElements.filter(el => 
        el.text.toLowerCase() === element.text.toLowerCase() && 
        el.id !== element.id &&
        el.route === route
      );
      if (duplicates.length > 1) {
        buttonAudit.issues.push('Potential duplicate button');
        buttonAudit.status = 'WARNING';
      }
      
      // Check for overlapping buttons
      for (const other of interactiveElements) {
        if (other.id === element.id) continue;
        
        const overlap = isOverlapping(element.position, other.position);
        if (overlap) {
          buttonAudit.issues.push('Button overlaps with another element');
          buttonAudit.status = 'FAIL';
          break;
        }
      }
      
      buttons.push(buttonAudit);
    }
    
  } catch (error) {
    console.log(`Error auditing buttons on ${route}: ${error.message}`);
  }
  
  return buttons;
}

async function auditWorkflows(page, route) {
  const workflows = [];
  
  // Define key workflows based on route
  const workflowsConfig = {
    '/': [
      { name: 'Browse Collections', selector: 'a[href="/discover"]', action: 'click' },
      { name: 'AI Stylist', selector: '[data-testid="ai-stylist-button"]', action: 'click' },
      { name: 'Sign In', selector: 'a[href="/auth/login"]', action: 'click' }
    ],
    '/discover': [
      { name: 'Apply Category Filter', selector: 'button[aria-label="Lehenga"]', action: 'click' },
      { name: 'Select Outfit', selector: 'a[href="/outfit/1"]', action: 'click' },
      { name: 'Add to Wishlist', selector: 'button[aria-label="Add to wishlist"]', action: 'click' }
    ],
    '/auth/login': [
      { name: 'Email Login', selector: 'input[type="email"]', action: 'fill', value: 'test@example.com' },
      { name: 'Password Input', selector: 'input[type="password"]', action: 'fill', value: 'password123' },
      { name: 'Submit Login', selector: 'button[type="submit"]', action: 'click' }
    ],
    '/booking/checkout': [
      { name: 'Select Delivery Address', selector: 'button[aria-label="Select address"]', action: 'click' },
      { name: 'Choose Delivery Type', selector: 'button[aria-label="Delivery"]', action: 'click' },
      { name: 'Proceed to Payment', selector: 'button[aria-label="Proceed to payment"]', action: 'click' }
    ]
  };
  
  const routeWorkflows = workflowsConfig[route] || [];
  
  for (const workflow of routeWorkflows) {
    const workflowAudit = {
      route,
      name: workflow.name,
      selector: workflow.selector,
      status: 'PASS',
      steps: [],
      issues: []
    };
    
    try {
      // Check if element exists
      const elementExists = await page.isVisible(workflow.selector, { timeout: 5000 }).catch(() => false);
      if (!elementExists) {
        workflowAudit.issues.push('Workflow element not found');
        workflowAudit.status = 'FAIL';
        workflows.push(workflowAudit);
        continue;
      }
      
      // Execute workflow step
      if (workflow.action === 'click') {
        await page.click(workflow.selector, { timeout: 5000 });
        workflowAudit.steps.push({ action: 'click', success: true });
      } else if (workflow.action === 'fill') {
        await page.fill(workflow.selector, workflow.value || '');
        workflowAudit.steps.push({ action: 'fill', success: true });
      }
      
      // Wait for navigation or response
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      // Verify navigation or state change
      const currentUrl = page.url();
      if (workflow.name.includes('Login') && !currentUrl.includes('/auth/login')) {
        workflowAudit.steps.push({ action: 'verify', success: true, message: 'Navigation successful' });
      } else if (workflow.name.includes('Browse') && currentUrl.includes('/discover')) {
        workflowAudit.steps.push({ action: 'verify', success: true, message: 'Navigation successful' });
      } else {
        workflowAudit.steps.push({ action: 'verify', success: true, message: 'Action completed' });
      }
      
    } catch (error) {
      workflowAudit.issues.push(`Workflow failed: ${error.message}`);
      workflowAudit.status = 'FAIL';
    }
    
    workflows.push(workflowAudit);
  }
  
  return workflows;
}

async function checkBrokenElements(page) {
  const issues = [];
  
  try {
    // Check for images with broken src
    const brokenImages = await page.$$eval('img', images => {
      return images.map(img => {
        const src = img.getAttribute('src');
        return { src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
      });
    });
    
    for (const img of brokenImages) {
      if (!img.src || img.naturalWidth === 0 || img.naturalHeight === 0) {
        issues.push(`Broken image: ${img.src}`);
      }
    }
    
    // Check for links that go nowhere
    const brokenLinks = await page.$$eval('a[href]', links => {
      return links.map(link => {
        const href = link.getAttribute('href');
        return { href, text: link.textContent?.trim() };
      });
    });
    
    for (const link of brokenLinks) {
      if (!link.href || link.href === '#' || link.href.startsWith('javascript:')) {
        issues.push(`Broken link: "${link.text}" -> ${link.href}`);
      }
    }
    
  } catch (error) {
    console.log(`Error checking broken elements: ${error.message}`);
  }
  
  return issues;
}

async function checkNavigation(page, route) {
  const issues = [];
  
  try {
    // Get all navigation links
    const navLinks = await page.$$eval('nav a, header a, aside a', links => {
      return links.map(link => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        return { href, text, visible: link.offsetParent !== null };
      });
    });
    
    // Check for external links
    for (const link of navLinks) {
      if (link.href && link.href.startsWith('http') && !link.href.includes('kloset.in')) {
        issues.push(`External navigation link: "${link.text}" -> ${link.href}`);
      }
    }
    
  } catch (error) {
    console.log(`Error checking navigation: ${error.message}`);
  }
  
  return issues;
}

async function checkOverlappingElements(page) {
  const issues = [];
  
  try {
    // Get all interactive elements
    const elements = await page.$$eval('button, a, input, select, textarea', elements => {
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim() || '',
          rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          visible: rect.width > 0 && rect.height > 0 && el.offsetParent !== null
        };
      });
    });
    
    // Check for overlapping
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (isOverlapping(elements[i].rect, elements[j].rect)) {
          issues.push(`Overlapping elements: ${elements[i].tagName} "${elements[i].text}" overlaps with ${elements[j].tagName} "${elements[j].text}"`);
        }
      }
    }
    
  } catch (error) {
    console.log(`Error checking overlapping elements: ${error.message}`);
  }
  
  return issues;
}

async function checkScrollIssues(page) {
  const issues = [];
  
  try {
    // Check for scroll locks
    const scrollLock = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      return {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        hasFixedElements: document.querySelector('[style*="position: fixed"]') !== null,
        zIndexIssues: document.querySelectorAll('[style*="z-index: 9999"]').length > 0
      };
    });
    
    if (scrollLock.htmlOverflow === 'hidden' || scrollLock.bodyOverflow === 'hidden') {
      issues.push('Scroll lock detected (overflow: hidden)');
    }
    
    if (scrollLock.hasFixedElements) {
      issues.push('Fixed elements may cause scroll issues');
    }
    
  } catch (error) {
    console.log(`Error checking scroll issues: ${error.message}`);
  }
  
  return issues;
}

function isOverlapping(rect1, rect2) {
  return !(rect1.left + rect1.width < rect2.left ||
           rect1.left > rect2.left + rect2.width ||
           rect1.top + rect1.height < rect2.top ||
           rect1.top > rect2.top + rect2.height);
}

// Generate comprehensive audit report
test.afterAll(async () => {
  console.log('\n' + '='.repeat(80));
  console.log('📊 KLOSÉT PLATFORM AUDIT REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📈 SUMMARY:
  ✅ Passed: ${auditResults.passed}
  ❌ Failed: ${auditResults.failed}
  📋 Total Audits: ${auditResults.passed + auditResults.failed}
  📊 Success Rate: ${((auditResults.passed / (auditResults.passed + auditResults.failed)) * 100).toFixed(1)}%
`);
  
  console.log('\n🔘 BUTTON AUDITS:');
  const failedButtons = auditResults.buttonAudits.filter(b => b.status === 'FAIL');
  const warningButtons = auditResults.buttonAudits.filter(b => b.status === 'WARNING');
  
  console.log(`  ❌ Failed Buttons: ${failedButtons.length}
  ⚠️  Warning Buttons: ${warningButtons.length}
  ✅ Working Buttons: ${auditResults.buttonAudits.length - failedButtons.length - warningButtons.length}
`);
  
  if (failedButtons.length > 0) {
    console.log('\n🚨 FAILED BUTTONS:');
    failedButtons.forEach(button => {
      console.log(`  • ${button.text} (${button.route})
    Issues: ${button.issues.join(', ')}`);
    });
  }
  
  console.log('\n📋 ROUTE AUDITS:');
  auditResults.routeAudits.forEach(route => {
    const statusIcon = route.status === 'PASS' ? '✅' : route.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${statusIcon} ${route.pageName} (${route.route}) - ${route.status}`);
    if (route.issues.length > 0) {
      console.log(`    Issues: ${route.issues.join(', ')}`);
    }
  });
  
  console.log('\n🔄 WORKFLOW AUDITS:');
  const failedWorkflows = auditResults.workflowAudits.filter(w => w.status === 'FAIL');
  console.log(`  ❌ Failed Workflows: ${failedWorkflows.length}
  ✅ Successful Workflows: ${auditResults.workflowAudits.length - failedWorkflows.length}
`);
  
  if (failedWorkflows.length > 0) {
    console.log('\n🚨 FAILED WORKFLOWS:');
    failedWorkflows.forEach(workflow => {
      console.log(`  • ${workflow.name} (${workflow.route})
    Issues: ${workflow.issues.join(', ')}`);
    });
  }
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: auditResults.routeAudits.length,
      passed: auditResults.passed,
      failed: auditResults.failed,
      successRate: (auditResults.passed / (auditResults.passed + auditResults.failed)) * 100
    },
    buttonAudits: auditResults.buttonAudits,
    workflowAudits: auditResults.workflowAudits,
    routeAudits: auditResults.routeAudits,
    consoleErrors: auditResults.consoleErrors,
    accessibilityIssues: auditResults.accessibilityIssues
  };
  
  // Save report to file
  const fs = require('fs');
  const path = require('path');
  const reportDir = path.join(process.cwd(), 'tests');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with error code if any critical failures
  if (auditResults.failed > 0) {
    process.exit(1);
  }
});
