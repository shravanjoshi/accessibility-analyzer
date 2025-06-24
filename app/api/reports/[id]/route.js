// app/api/reports/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import { authOptions } from '../../../../lib/auth';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find the report and ensure it belongs to the authenticated user
    const report = await Report.findOne({ 
      _id: id, 
      userId: session.user.id 
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    // Return the complete report data
    return NextResponse.json({
      _id: report._id,
      url: report.url,
      timestamp: report.timestamp,
      axeResults: report.axeResults,
      aiSuggestions: report.aiSuggestions,
      summary: report.summary,
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE method to allow users to delete their reports
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find and delete the report, ensuring it belongs to the authenticated user
    const deletedReport = await Report.findOneAndDelete({ 
      _id: id, 
      userId: session.user.id 
    });

    if (!deletedReport) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Report deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}