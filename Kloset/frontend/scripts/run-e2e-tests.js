/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment configuration from backend/.env
function loadEnv(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const backendEnv = loadEnv(path.join(__dirname, '..', '..', 'backend', '.env'));
const API_URL = 'http://127.0.0.1:8080/api/v1';
const RAZORPAY_KEY_SECRET = backendEnv['RAZORPAY_KEY_SECRET'] || 'your_razorpay_secret';

console.log('Using API URL:', API_URL);
console.log('Loaded Razorpay Webhook Secret from backend/.env successfully.');

// Helper fetch request wrapper
async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const start = Date.now();
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const text = await res.text();
    const latency = Date.now() - start;

    let json = {};
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = { rawText: text };
      }
    }

    return {
      status: res.status,
      ok: res.ok,
      latency,
      data: json,
    };
  } catch (err) {
    return {
      status: 500,
      ok: false,
      latency: Date.now() - start,
      error: err.message,
    };
  }
}

async function runE2E() {
  console.log('\n======================================================');
  console.log('   🌸 KLOSET AUTOMATED END-TO-END VALIDATION SUITE 🌸');
  console.log('======================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    overallScore: 0,
    testsRun: 0,
    testsPassed: 0,
    journeys: {},
    latencies: [],
  };

  function logTest(journey, name, passed, notes = '') {
    report.testsRun++;
    if (passed) report.testsPassed++;

    if (!report.journeys[journey]) {
      report.journeys[journey] = [];
    }
    report.journeys[journey].push({ name, passed, notes });

    const symbol = passed ? '✅' : '❌';
    console.log(`  ${symbol} [${journey}] ${name} ${notes ? `- ${notes}` : ''}`);
  }

  const timestamp = Date.now();
  const renterEmail = `renter.e2e.${timestamp}@kloset.in`;
  const sellerEmail = `seller.e2e.${timestamp}@kloset.in`;
  const renterPhone = '+91' + String(timestamp).slice(-10);
  const sellerPhone = '+91' + String(timestamp + 1).slice(-10);
  const adminEmail = 'admin@kloset.in';
  const adminPass = 'KlosetSecured123!';
  const pass = 'E2ETestPassword123!';

  let renterToken = null;
  let sellerToken = null;
  let sellerId = null;
  let adminToken = null;

  let outfitId = null;
  let bookingId = null;
  let ticketId = null;
  let disputeId = null;

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION
  // ----------------------------------------------------
  console.log('🔑 Authenticating Admin Client...');
  const adminLogin = await request('/auth/login', 'POST', {
    email: adminEmail,
    password: adminPass,
  });
  if (adminLogin.ok && adminLogin.data.success) {
    adminToken = adminLogin.data.data.access_token;
    logTest('Admin Journey', 'Login Admin Account', true);
  } else {
    logTest('Admin Journey', 'Login Admin Account', false, adminLogin.error || JSON.stringify(adminLogin.data));
  }

  // ----------------------------------------------------
  // SELLER SIGNUP & LISTING CREATION
  // ----------------------------------------------------
  console.log('\n💼 Starting Seller Signup & Listing Creation...');
  let newOutfitId = null;

  // 1. Register Seller
  const sellerReg = await request('/auth/register', 'POST', {
    name: 'E2E Test Seller',
    email: sellerEmail,
    phone: sellerPhone,
    password: pass,
    role: 'seller',
  });
  if (sellerReg.ok && sellerReg.data.success) {
    logTest('Seller Journey', 'Register Seller Account', true);
  } else {
    logTest('Seller Journey', 'Register Seller Account', false, JSON.stringify(sellerReg.data));
  }

  // 2. Login Seller
  const sellerLogin = await request('/auth/login', 'POST', {
    email: sellerEmail,
    password: pass,
  });
  if (sellerLogin.ok && sellerLogin.data.success) {
    sellerToken = sellerLogin.data.data.access_token;
    sellerId = sellerLogin.data.data.user.id;
    logTest('Seller Journey', 'Login Seller Account', true);
  } else {
    logTest('Seller Journey', 'Login Seller Account', false, JSON.stringify(sellerLogin.data));
  }

  // 3. Submit KYC (Seller)
  if (sellerToken) {
    const submitKYC = await request('/users/kyc', 'POST', null, sellerToken);
    if (submitKYC.ok && submitKYC.data.success) {
      logTest('Seller Journey', 'Submit KYC Verification', true);
    } else {
      logTest('Seller Journey', 'Submit KYC Verification', false, JSON.stringify(submitKYC.data));
    }
  }

  // 4. Admin Approves KYC
  if (adminToken && sellerId) {
    const approveKYC = await request(`/admin/kyc/${sellerId}/approve`, 'PUT', null, adminToken);
    if (approveKYC.ok && approveKYC.data.success) {
      logTest('Admin Journey', 'Approve Seller KYC', true);
    } else {
      logTest('Admin Journey', 'Approve Seller KYC', false, JSON.stringify(approveKYC.data));
    }
  }

  // 5. Create Listing (Seller)
  if (sellerToken) {
    const createListing = await request('/outfits', 'POST', {
      title: 'E2E Sherwani Couture ' + timestamp,
      description: 'Hand-crafted luxury wedding sherwani set for sangeet / reception.',
      category: 'sherwani',
      occasions: ['wedding', 'reception'],
      colors: ['gold', 'cream'],
      fabric: 'Silk',
      sizes: ['M', 'L'],
      price_1day: 4500,
      price_3day: 12000,
      price_7day: 25000,
      security_deposit: 8000,
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop',
          is_primary: true,
          sort_order: 0,
        }
      ]
    }, sellerToken);

    if (createListing.ok && createListing.data.success) {
      newOutfitId = createListing.data.data.id;
      logTest('Seller Journey', 'Create Listing Form Draft', true, `Outfit ID: ${newOutfitId}`);

      // 6. Submit listing for approval
      const submitListing = await request(`/outfits/${newOutfitId}/submit`, 'PUT', null, sellerToken);
      if (submitListing.ok && submitListing.data.success) {
        logTest('Seller Journey', 'Submit Listing for Verification', true);
      } else {
        logTest('Seller Journey', 'Submit Listing for Verification', false, JSON.stringify(submitListing.data));
      }
    } else {
      logTest('Seller Journey', 'Create Listing Form Draft', false, JSON.stringify(createListing.data));
    }
  }

  // 7. Admin Moderates / Approves Listing
  if (adminToken && newOutfitId) {
    const approveListing = await request(`/admin/outfits/${newOutfitId}/approve`, 'PUT', null, adminToken);
    if (approveListing.ok && approveListing.data.success) {
      logTest('Admin Journey', 'Approve Outfit Listing', true);
    } else {
      logTest('Admin Journey', 'Approve Outfit Listing', false, JSON.stringify(approveListing.data));
    }
  }

  // 8. Edit Listing (Seller)
  if (sellerToken && newOutfitId) {
    const editListing = await request(`/outfits/${newOutfitId}`, 'PUT', {
      title: 'E2E Sherwani Couture (Updated Title) ' + timestamp,
      price_1day: 4900,
    }, sellerToken);

    if (editListing.ok && editListing.data.success) {
      logTest('Seller Journey', 'Edit Listing Parameters', true);
    } else {
      logTest('Seller Journey', 'Edit Listing Parameters', false, JSON.stringify(editListing.data));
    }
  }

  // ----------------------------------------------------
  // RENTER JOURNEY
  // ----------------------------------------------------
  console.log('\n👗 Starting Renter Journey...');

  // 1. Register Renter
  const renterReg = await request('/auth/register', 'POST', {
    name: 'E2E Test Renter',
    email: renterEmail,
    phone: renterPhone,
    password: pass,
    role: 'renter',
  });
  if (renterReg.ok && renterReg.data.success) {
    logTest('Renter Journey', 'Register Renter Account', true);
  } else {
    logTest('Renter Journey', 'Register Renter Account', false, JSON.stringify(renterReg.data));
  }

  // 2. Login Renter
  const renterLogin = await request('/auth/login', 'POST', {
    email: renterEmail,
    password: pass,
  });
  if (renterLogin.ok && renterLogin.data.success) {
    renterToken = renterLogin.data.data.access_token;
    logTest('Renter Journey', 'Login Renter Account', true);
  } else {
    logTest('Renter Journey', 'Login Renter Account', false, JSON.stringify(renterLogin.data));
  }

  // 3. Browse Outfits
  const browseOutfits = await request('/outfits');
  if (browseOutfits.ok && browseOutfits.data.success && browseOutfits.data.data.length > 0) {
    outfitId = newOutfitId || browseOutfits.data.data[0].id;
    logTest('Renter Journey', 'Browse Catalog', true, `Picked Outfit ID: ${outfitId}`);
  } else {
    logTest('Renter Journey', 'Browse Catalog', false, 'Catalog returned 0 items');
  }

  // 4. Wishlist
  if (outfitId) {
    const wishlistAdd = await request(`/wishlist/${outfitId}`, 'POST', null, renterToken);
    if (wishlistAdd.ok && wishlistAdd.data.success) {
      logTest('Renter Journey', 'Add Item to Wishlist', true);
    } else {
      logTest('Renter Journey', 'Add Item to Wishlist', false, JSON.stringify(wishlistAdd.data));
    }
  }

  // 5. Create Booking / Add To Cart
  if (outfitId) {
    const createBooking = await request('/bookings', 'POST', {
      outfit_id: outfitId,
      size_selected: 'M',
      delivery_type: 'delivery',
      pickup_date: '2026-07-01',
      return_date: '2026-07-04',
      delivery_fee: 150,
    }, renterToken);

    if (createBooking.ok && createBooking.data.success) {
      bookingId = createBooking.data.data.id;
      const razorpayOrderId = createBooking.data.data.razorpay_order_id;
      logTest('Renter Journey', 'Add to Cart & Checkout (Draft Booking)', true, `Booking ID: ${bookingId}`);

      // 6. Secure Razorpay Payment Verification
      const paymentId = 'pay_e2e_' + Math.floor(Math.random() * 1000000);
      const dataStr = razorpayOrderId + '|' + paymentId;
      const calculatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(dataStr)
        .digest('hex');

      const paymentVerify = await request('/payments/verify', 'POST', {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: calculatedSignature,
      }, renterToken);

      if (paymentVerify.ok && paymentVerify.data.success) {
        logTest('Renter Journey', 'Razorpay Payment & Signature Verification', true);
      } else {
        logTest('Renter Journey', 'Razorpay Payment & Signature Verification', false, JSON.stringify(paymentVerify.data));
      }
    } else {
      logTest('Renter Journey', 'Add to Cart & Checkout (Draft Booking)', false, JSON.stringify(createBooking.data));
    }
  }

  // 7. Track Order & Lifecycle Status transitions
  if (bookingId) {
    const trackOrder = await request(`/bookings/${bookingId}`, 'GET', null, renterToken);
    if (trackOrder.ok && trackOrder.data.success) {
      logTest('Renter Journey', 'Track Order Detail', true);
    } else {
      logTest('Renter Journey', 'Track Order Detail', false);
    }

    // picked_up
    const update1 = await request(`/bookings/${bookingId}/status`, 'PATCH', { status: 'picked_up' }, renterToken);
    // in_use
    const update2 = await request(`/bookings/${bookingId}/status`, 'PATCH', { status: 'in_use' }, renterToken);
    // return_initiated
    const update3 = await request(`/bookings/${bookingId}/status`, 'PATCH', { status: 'return_initiated' }, renterToken);

    if (update1.ok && update2.ok && update3.ok) {
      logTest('Renter Journey', 'Advance Lifecycle (picked_up -> in_use -> return_initiated)', true);
    } else {
      logTest('Renter Journey', 'Advance Lifecycle (picked_up -> in_use -> return_initiated)', false, `Transition failure status codes: ${update1.status}, ${update2.status}, ${update3.status}`);
    }
  }

  // ----------------------------------------------------
  // SELLER COMPLETION & FEEDBACK
  // ----------------------------------------------------
  console.log('\n💼 Starting Seller Completion & Feedback...');

  // 9. Seller completes Renter's Booking (returned -> completed)
  if (bookingId && sellerToken) {
    const returned = await request(`/bookings/${bookingId}/status`, 'PATCH', { status: 'returned' }, sellerToken);
    const completed = await request(`/bookings/${bookingId}/status`, 'PATCH', { status: 'completed' }, sellerToken);

    if (returned.ok && completed.ok) {
      logTest('Seller Journey', 'Verify Returned Garment & Complete Booking', true);
    } else {
      logTest('Seller Journey', 'Verify Returned Garment & Complete Booking', false, `Status codes: returned=${returned.status}, completed=${completed.status}`);
    }
  }

  // 10. Renter reviews completed outfit
  if (bookingId && renterToken) {
    const reviewResult = await request('/reviews', 'POST', {
      booking_id: bookingId,
      rating: 5,
      comment: 'Excellent condition, fit perfectly! Highly recommend this seller.',
    }, renterToken);

    if (reviewResult.ok && reviewResult.data.success) {
      logTest('Renter Journey', 'Review Outfit Rating Feedback', true);
    } else {
      logTest('Renter Journey', 'Review Outfit Rating Feedback', false, JSON.stringify(reviewResult.data));
    }
  }

  // 11. View revenue / bookings list
  if (sellerToken) {
    const sellerBookings = await request('/bookings/seller', 'GET', null, sellerToken);
    if (sellerBookings.ok && sellerBookings.data.success) {
      logTest('Seller Journey', 'View Received Bookings & Revenue Stats', true);
    } else {
      logTest('Seller Journey', 'View Received Bookings & Revenue Stats', false);
    }
  }

  // ----------------------------------------------------
  // SUPPORT TICKET JOURNEY
  // ----------------------------------------------------
  console.log('\n🎫 Starting Customer Support Journey...');

  // 1. Create Ticket
  const createTicket = await request('/support/tickets', 'POST', {
    renterName: 'E2E Support User',
    renterEmail: renterEmail,
    subject: 'Incorrect Size Received',
    description: 'Received size S sherwani instead of size M.',
    priority: 'high',
  }, renterToken);

  if (createTicket.ok && createTicket.data.success) {
    ticketId = createTicket.data.data.id;
    logTest('Support Journey', 'Create Customer Support Ticket', true, `Ticket ID: ${ticketId}`);
  } else {
    logTest('Support Journey', 'Create Customer Support Ticket', false, JSON.stringify(createTicket.data));
  }

  // 2. Admin views, replies, escalates, and closes
  if (adminToken && ticketId) {
    // List tickets
    const listTickets = await request('/admin/support/tickets', 'GET', null, adminToken);
    if (listTickets.ok && listTickets.data.success) {
      logTest('Support Journey', 'Admin View Tickets List', true);
    } else {
      logTest('Support Journey', 'Admin View Tickets List', false);
    }

    // Reply to ticket
    const replyTicket = await request(`/admin/support/tickets/${ticketId}/reply`, 'POST', {
      text: 'We are looking into the size discrepancy with Priya Collections. Doorstep replacement is scheduled for tomorrow.',
    }, adminToken);

    if (replyTicket.ok && replyTicket.data.success) {
      logTest('Support Journey', 'Admin Reply to Support Chat', true);
    } else {
      logTest('Support Journey', 'Admin Reply to Support Chat', false, JSON.stringify(replyTicket.data));
    }

    // Escalate Status (in_progress)
    const statusTicket1 = await request(`/admin/support/tickets/${ticketId}/status`, 'PUT', {
      status: 'in_progress',
    }, adminToken);

    // Close ticket (resolved)
    const statusTicket2 = await request(`/admin/support/tickets/${ticketId}/status`, 'PUT', {
      status: 'resolved',
    }, adminToken);

    if (statusTicket1.ok && statusTicket2.ok) {
      logTest('Support Journey', 'Admin Resolve and Close Ticket', true);
    } else {
      logTest('Support Journey', 'Admin Resolve and Close Ticket', false, `Status codes: in_progress=${statusTicket1.status}, resolved=${statusTicket2.status}`);
    }
  }

  // ----------------------------------------------------
  // DISPUTE RESOLUTION JOURNEY
  // ----------------------------------------------------
  console.log('\n⚖️ Starting Booking Dispute Resolution Journey...');

  // 1. Create a Dispute (Renter)
  if (bookingId && renterToken) {
    const createDispute = await request('/disputes', 'POST', {
      booking_id: bookingId,
      reason: 'late_return_penalty_charge',
      description: 'The seller is charging me a late return fee of ₹2000, but I returned the garment on time. Pincode delivery delay.',
    }, renterToken);

    if (createDispute.ok && createDispute.data.success) {
      disputeId = createDispute.data.data.id;
      logTest('Admin Journey', 'Renter Raises Booking Dispute', true, `Dispute ID: ${disputeId}`);
    } else {
      logTest('Admin Journey', 'Renter Raises Booking Dispute', false, JSON.stringify(createDispute.data));
    }
  }

  // 2. Resolve Dispute (Admin)
  if (adminToken && disputeId) {
    const resolveDispute = await request(`/admin/disputes/${disputeId}/resolve`, 'PUT', {
      resolution: 'dismissed',
      note: 'Validated courier timestamp logs. The return was initiated inside the checkout dates window. Late fee penalty dismissed.',
      refund_amount: 0,
    }, adminToken);

    if (resolveDispute.ok && resolveDispute.data.success) {
      logTest('Admin Journey', 'Admin Resolves Dispute (Dismiss Fee)', true);
    } else {
      logTest('Admin Journey', 'Admin Resolves Dispute (Dismiss Fee)', false, JSON.stringify(resolveDispute.data));
    }
  }

  // ----------------------------------------------------
  // PRODUCTION-GRADE OAUTH & OTP HARDENING
  // ----------------------------------------------------
  console.log('\n🔐 Testing OAuth Session Verification & OTP Hardened Rate Limits...');

  // 1. Google OAuth Mock Registration/Login Session Check
  const oauthRes = await request('/auth/google', 'POST', {
    credential: 'mock_google_token_prod_verify'
  });
  if (oauthRes.ok && oauthRes.data.success) {
    logTest('Admin Journey', 'Google Session & OAuth Claim Verification', true);
  } else {
    logTest('Admin Journey', 'Google Session & OAuth Claim Verification', false, JSON.stringify(oauthRes.data));
  }

  // 2. OTP Cooldown and Rate Limiting Check
  const otpPhone = '+91' + String(timestamp + 2).slice(-10);
  const otpSend1 = await request('/auth/otp/send', 'POST', { phone: otpPhone });
  if (otpSend1.ok && otpSend1.data.success) {
    logTest('Launch Infrastructure', 'OTP Verification Code Dispatch', true);
  } else {
    logTest('Launch Infrastructure', 'OTP Verification Code Dispatch', false, JSON.stringify(otpSend1.data));
  }

  // Request again immediately to verify cooldown protection
  const otpSend2 = await request('/auth/otp/send', 'POST', { phone: otpPhone });
  if (!otpSend2.ok && otpSend2.data.error && otpSend2.data.error.includes('wait')) {
    logTest('Launch Infrastructure', 'OTP Cooldown Enforcement (60s)', true);
  } else {
    logTest('Launch Infrastructure', 'OTP Cooldown Enforcement (60s)', false, `Status: ${otpSend2.status}, Error: ${otpSend2.data.error || 'none'}`);
  }

  // ----------------------------------------------------
  // SYSTEM DIAGNOSTICS & TELEMETRY
  // ----------------------------------------------------
  console.log('\n📊 Auditing Telemetry & Monitoring...');
  let healthzOk = false;
  let healthzNewOk = false;
  let readyzOk = false;
  let healthStatusStr = '';

  try {
    const r1 = await fetch('http://127.0.0.1:8080/health');
    healthzOk = r1.ok;
    healthStatusStr += `/health=${r1.status} `;
  } catch { healthStatusStr += `/health=error `; }

  try {
    const r2 = await fetch('http://127.0.0.1:8080/healthz');
    healthzNewOk = r2.ok;
    healthStatusStr += `/healthz=${r2.status} `;
  } catch { healthStatusStr += `/healthz=error `; }

  try {
    const r3 = await fetch('http://127.0.0.1:8080/readyz');
    readyzOk = r3.ok;
    healthStatusStr += `/readyz=${r3.status} `;
  } catch { healthStatusStr += `/readyz=error `; }

  if (healthzOk && healthzNewOk && readyzOk) {
    logTest('Launch Infrastructure', 'Platform healthz & readyz check', true);
  } else {
    logTest('Launch Infrastructure', 'Platform healthz & readyz check', false, `Health status codes: ${healthStatusStr}`);
  }

  if (adminToken) {
    const diagnostics = await request('/admin/monitoring/diagnostics', 'GET', null, adminToken);
    if (diagnostics.ok && diagnostics.data.success) {
      logTest('Launch Infrastructure', 'Retrieve Administrator Diagnostics Metrics', true);
      console.log('\nPlatform Diagnostics Metrics:', JSON.stringify(diagnostics.data.data, null, 2));
    } else {
      logTest('Launch Infrastructure', 'Retrieve Administrator Diagnostics Metrics', false, JSON.stringify(diagnostics.data));
    }
  }

  // Compute final score
  report.overallScore = Math.round((report.testsPassed / report.testsRun) * 100);

  // Write results to public/e2e-report.json
  const reportPath = path.join(__dirname, '..', 'public', 'e2e-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n======================================================');
  console.log('🏁 E2E VERIFICATION RUN COMPLETED');
  console.log('======================================================');
  console.log(`Passed: ${report.testsPassed} / ${report.testsRun} (${report.overallScore}%)`);
  console.log(`Report written to public/e2e-report.json\n`);

  if (report.overallScore === 100) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runE2E();
