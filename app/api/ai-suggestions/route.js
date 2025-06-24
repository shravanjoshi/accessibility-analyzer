import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { authOptions } from '../../../lib/auth';
import { generateAccessibilitySuggestions } from '../../../lib/ai';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the report and ensure it belongs to the authenticated user
    const report = await Report.findOne({ 
      _id: reportId, 
      userId: session.user.id 
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Check if there are violations to analyze
    if (!report.axeResults?.violations || report.axeResults.violations.length === 0) {
      const noViolationsSuggestions = {
        suggestions: [],
        generalRecommendations: [
          'Great job! No accessibility violations were found.',
          'Continue to test regularly as your website evolves.',
          'Consider running additional accessibility tests for comprehensive coverage.'
        ],
        resourceLinks: [
          {
            title: 'Web Accessibility Guidelines',
            url: 'https://www.w3.org/WAI/WCAG21/quickref/'
          }
        ]
      };
      
      // Update report with empty suggestions
      await Report.updateOne(
        { _id: reportId },
        {
          $set: {
            aiSuggestions: noViolationsSuggestions,
            aiGeneratedAt: new Date()
          }
        }
      );
      
      return NextResponse.json(noViolationsSuggestions);
    }

    // Generate AI suggestions
    const suggestions = await generateAccessibilitySuggestions(
      report.axeResults.violations,
      report.url
    );

    // Update the report with AI suggestions using updateOne
    await Report.updateOne(
      { _id: reportId },
      {
        $set: {
          aiSuggestions: suggestions,
          aiGeneratedAt: new Date()
        }
      }
    );

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}