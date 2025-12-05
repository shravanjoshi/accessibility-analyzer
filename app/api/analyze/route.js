import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { authOptions } from '../../../lib/auth';

export async function POST(request) {
  try {

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Run Axe analysis
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });

    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const axeResults = await new AxePuppeteer(page).analyze();
      await browser.close();

      let accessibilityScore = calculateAccessibilityScore(axeResults);

      // Create summary
      const summary = {
        violations: axeResults.violations.length,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        inapplicable: axeResults.inapplicable.length,
        accessibilityScore,
      };

      // Save to database
      const report = new Report({
        userId: session.user.id,
        url,
        axeResults,
        summary,
      });

      await report.save();

      return NextResponse.json({
        _id: report._id,
        url: report.url,
        timestamp: report.timestamp,
        axeResults: report.axeResults,
        summary: report.summary,
      });

    } catch (pageError) {
      await browser.close();
      throw pageError;
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: `Failed to analyze website: ${error.message}` },
      { status: 500 }
    );
  }
}

function calculateAccessibilityScore(axeResults) {
  const violations = axeResults.violations;

  const weights = {
    critical: 4,
    serious: 3,
    moderate: 2,
    minor: 1
  };

  let totalWeightedViolations = 0;
  let totalPossibleScore = 0;

  for (const v of violations) {
    const impact = v.impact;
    if (impact && weights[impact]) {
      const count = v.nodes.length;
      const weight = weights[impact];
      totalWeightedViolations += count * weight;
      totalPossibleScore += 10 * weight; // You can adjust this denominator as per severity
    }
  }

  const score = totalPossibleScore === 0
    ? 100
    : Math.max(0, Math.round(100 - (totalWeightedViolations / totalPossibleScore) * 100));

  return score;
}

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium';
// import { AxePuppeteer } from '@axe-core/puppeteer';
// import dbConnect from '../../../lib/mongodb';
// import Report from '../../../models/Report';
// import { authOptions } from '../../../lib/auth';

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }

//     const { url } = await request.json();

//     if (!url) {
//       return NextResponse.json({ error: 'URL is required' }, { status: 400 });
//     }

//     // Validate URL format
//     try {
//       new URL(url);
//     } catch {
//       return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
//     }

//     // Connect to database
//     await dbConnect();

//     // Configure browser for Vercel environment
//     const browser = await puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//       ignoreHTTPSErrors: true,
//     });

//     const page = await browser.newPage();

//     try {
//       await page.setViewport({ width: 1200, height: 800 });
//       await page.goto(url, {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       const axeResults = await new AxePuppeteer(page).analyze();
//       await browser.close();

//       let accessibilityScore = calculateAccessibilityScore(axeResults);

//       // Create summary
//       const summary = {
//         violations: axeResults.violations.length,
//         passes: axeResults.passes.length,
//         incomplete: axeResults.incomplete.length,
//         inapplicable: axeResults.inapplicable.length,
//         accessibilityScore,
//       };

//       // Save to database
//       const report = new Report({
//         userId: session.user.id,
//         url,
//         axeResults,
//         summary,
//       });

//       await report.save();

//       return NextResponse.json({
//         _id: report._id,
//         url: report.url,
//         timestamp: report.timestamp,
//         axeResults: report.axeResults,
//         summary: report.summary,
//       });

//     } catch (pageError) {
//       await browser.close();
//       throw pageError;
//     }

//   } catch (error) {
//     console.error('Analysis error:', error);
//     return NextResponse.json(
//       { error: `Failed to analyze website: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

// function calculateAccessibilityScore(axeResults) {
//   const violations = axeResults.violations;

//   const weights = {
//     critical: 4,
//     serious: 3,
//     moderate: 2,
//     minor: 1
//   };

//   let totalWeightedViolations = 0;
//   let totalPossibleScore = 0;

//   for (const v of violations) {
//     const impact = v.impact;
//     if (impact && weights[impact]) {
//       const count = v.nodes.length;
//       const weight = weights[impact];
//       totalWeightedViolations += count * weight;
//       totalPossibleScore += 10 * weight; // You can adjust this denominator as per severity
//     }
//   }

//   const score = totalPossibleScore === 0
//     ? 100
//     : Math.max(0, Math.round(100 - (totalWeightedViolations / totalPossibleScore) * 100));

//   return score;
// }