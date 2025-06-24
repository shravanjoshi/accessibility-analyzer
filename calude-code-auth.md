# Accessibility Analyzer Web App with Authentication

## Updated Project Structure
```
accessibility-analyzer/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.js
│   │   ├── analyze/
│   │   │   └── route.js
│   │   ├── reports/
│   │   │   └── route.js
│   │   │   └── [id]
|    |  |       └── route.js
│   │   └── lighthouse/
│   │       └── route.js
│   ├── components/
│   │   ├── AnalyzerForm.js
│   │   ├── ReportDisplay.js
│   │   ├── ReportHistory.js
│   │   ├── LoadingSpinner.js
│   │   ├── AuthForm.js
│   │   └── Navbar.js
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.js
│   │   └── signup/
│   │       └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── mongodb.js
│   ├── auth.js
│   └── utils.js
├── models/
│   ├── Report.js
│   └── User.js
├── package.json
└── middleware.js
```

## 1. Updated Package.json Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "mongoose": "^8.0.0",
    "axe-core": "^4.8.0",
    "lighthouse": "^11.0.0",
    "chrome-launcher": "^1.1.0",
    "puppeteer": "^21.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3"
  }
}
```

## 2. Updated Environment Variables (.env.local)
```
MONGODB_URI=mongodb://localhost:27017/accessibility-analyzer
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-make-it-long-and-random
```

## 3. NextAuth Configuration (lib/auth.js)
```javascript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        try {
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
```

## 4. User Model (models/User.js)
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

## 5. Updated Report Model (models/Report.js)
```javascript
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  axeResults: {
    type: Object,
    required: true,
  },
  lighthouseResults: {
    type: Object,
    required: false,
  },
  summary: {
    violations: Number,
    passes: Number,
    incomplete: Number,
    inapplicable: Number,
    accessibilityScore: Number,
  },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
```

## 6. NextAuth API Route (app/api/auth/[...nextauth]/route.js)
```javascript
import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

## 7. Middleware (middleware.js)
```javascript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)'],
};
```

## 8. Updated Main Layout (app/layout.js)
```javascript
import './globals.css';
import { AuthProvider } from './components/AuthProvider';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Accessibility Analyzer',
  description: 'Comprehensive web accessibility analysis tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 9. Auth Provider Component (app/components/AuthProvider.js)
```javascript
'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

## 10. Updated Navbar Component (app/components/Navbar.js)
```javascript
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            <Link href="/">Accessibility Analyzer</Link>
          </h1>
          <p className="text-blue-100">Comprehensive web accessibility testing</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="text-blue-100">Loading...</div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <span className="text-blue-100">
                Welcome, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                href="/auth/signin"
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

## 11. Updated Main Page (app/page.js)
```javascript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnalyzerForm from './components/AnalyzerForm';
import ReportDisplay from './components/ReportDisplay';
import ReportHistory from './components/ReportHistory';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentReport, setCurrentReport] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Welcome to Accessibility Analyzer</h2>
        <p className="text-gray-600 mb-8">
          Please sign in to start analyzing websites for accessibility issues.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  const handleReportGenerated = (report) => {
    setCurrentReport(report);
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Analyze Website Accessibility</h2>
        <AnalyzerForm onReportGenerated={handleReportGenerated} />
      </div>

      {currentReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <ReportDisplay report={currentReport} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Report History</h2>
        <ReportHistory key={refreshHistory} />
      </div>
    </div>
  );
}

```

## 12. Auth Form Component (app/components/AuthForm.js)
```javascript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function AuthForm({ mode = 'signin' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Register user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed');
        }
      }

      // Sign in user
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">
              {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
            </span>
          </>
        ) : (
          mode === 'signup' ? 'Sign Up' : 'Sign In'
        )}
      </button>
    </form>
  );
}
```

## 13. Sign In Page (app/auth/signin/page.js)
```javascript
import AuthForm from '../../components/AuthForm';
import Link from 'next/link';

export default function SignIn() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      <AuthForm mode="signin" />
      <p className="text-center mt-6 text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Sign up here
        </Link>
      </p>
    </div>
  );
}
```

## 14. Sign Up Page (app/auth/signup/page.js)
```javascript
import AuthForm from '../../components/AuthForm';
import Link from 'next/link';

export default function SignUp() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1>
      <AuthForm mode="signup" />
      <p className="text-center mt-6 text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-blue-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
```

## 15. Registration API Route (app/api/auth/register/route.js)
```javascript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

## 16. Updated Analyze API Route (app/api/analyze/route.js)
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
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

    const { url, includeLighthouse = false } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Run Axe analysis
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const axeResults = await new AxePuppeteer(page).analyze();
    await browser.close();

    let lighthouseResults = null;
    let accessibilityScore = null;

    // Run Lighthouse analysis if requested
    if (includeLighthouse) {
      try {
        const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
        const options = {
          logLevel: 'info',
          output: 'json',
          onlyCategories: ['accessibility'],
          port: chrome.port,
        };

        const runnerResult = await lighthouse(url, options);
        await chrome.kill();

        lighthouseResults = {
          accessibility: runnerResult.lhr.categories.accessibility,
        };
        accessibilityScore = Math.round(runnerResult.lhr.categories.accessibility.score * 100);
      } catch (lighthouseError) {
        console.error('Lighthouse error:', lighthouseError);
      }
    }

    // Create summary
    const summary = {
      violations: axeResults.violations.length,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      inapplicable: axeResults.inapplicable.length,
      accessibilityScore,
    };

    // Save to database with user ID
    const report = new Report({
      userId: session.user.id,
      url,
      axeResults,
      lighthouseResults,
      summary,
    });

    await report.save();

    return NextResponse.json({
      _id: report._id,
      url: report.url,
      timestamp: report.timestamp,
      axeResults: report.axeResults,
      lighthouseResults: report.lighthouseResults,
      summary: report.summary,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
}
```

## 17. Updated Reports API Route (app/api/reports/route.js)
```javascript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '../../../lib/mongodb';
import Report from '../../../models/Report';
import { authOptions } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const reports = await Report.find({ userId: session.user.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('url timestamp summary');

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
```
## 18. Updated Reports API Route (app/api/reports/[id]/route.js)
```javascript
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
      lighthouseResults: report.lighthouseResults,
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
```


## Installation & Setup Instructions:

1. **Install new dependencies:**
```bash
npm install next-auth bcryptjs
```

2. **Set up environment variables:**
   - Add NEXTAUTH_URL and NEXTAUTH_SECRET to your .env.local file
   - Generate a secure secret key for NEXTAUTH_SECRET

3. **Run the development server:**
```bash
npm run dev
```

## New Features Added:
- ✅ User registration and authentication
- ✅ Secure password hashing with bcryptjs
- ✅ Session management with NextAuth.js
- ✅ Protected routes with middleware
- ✅ User-specific report history
- ✅ Responsive authentication UI
- ✅ Proper error handling
- ✅ Automatic sign-in after registration

## Security Features:
- ✅ Password hashing
- ✅ JWT session tokens
- ✅ Protected API routes
- ✅ Input validation
- ✅ CSRF protection (built into NextAuth)

Users can now register, sign in, and view only their own accessibility reports. The app maintains all previous functionality while adding comprehensive authentication.