import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '../../../../lib/mongodb';
import Report from '../../../../models/Report';
import { authOptions } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const reports = await Report.find({ 
      userId: session.user.id,
      url: url 
    })
      .sort({ timestamp: 1 }) // Sort by oldest first to show progression
      .select('url timestamp summary')
      .limit(20); // Limit to last 20 reports for this URL

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports by URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
