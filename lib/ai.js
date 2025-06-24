import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAccessibilitySuggestions(violations, url) {
  try {
    // Prepare violation data for AI analysis
    const violationSummary = violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.slice(0, 3).map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))
    }));

    const prompt = `
You are an expert web accessibility consultant. Analyze the following accessibility violations from an axe-core scan of the website "${url}" and provide specific, actionable code suggestions to fix each issue.

Accessibility Violations:
${JSON.stringify(violationSummary, null, 2)}

For each violation, provide:
1. A clear explanation of the problem
2. The accessibility impact and WCAG guidelines affected
3. Specific HTML/CSS/JavaScript code examples showing how to fix the issue
4. Best practices and additional recommendations

Format your response as a JSON object with this structure:
{
  "suggestions": [
    {
      "violationId": "rule-id",
      "priority": "high|medium|low",
      "title": "Brief title of the fix",
      "problem": "Clear explanation of the accessibility issue",
      "wcagGuidelines": ["2.1.1", "4.1.2"],
      "impact": "Description of who this affects and how",
      "solution": "Step-by-step solution explanation",
      "codeExample": {
        "before": "<!-- Bad example HTML -->",
        "after": "<!-- Fixed example HTML -->",
        "css": "/* Additional CSS if needed */",
        "javascript": "// Additional JavaScript if needed"
      },
      "additionalTips": [
        "Additional tip 1",
        "Additional tip 2"
      ],
      "testingInstructions": "How to test if the fix works"
    }
  ],
  "generalRecommendations": [
    "Overall recommendation 1",
    "Overall recommendation 2"
  ],
  "resourceLinks": [
    {
      "title": "WCAG Guidelines",
      "url": "https://www.w3.org/WAI/WCAG21/quickref/"
    }
  ]
}

Focus on practical, implementable solutions that developers can immediately apply. Make sure all code examples are valid and follow modern web standards.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });

    const text = response.text;

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    
    // Return fallback suggestions if AI fails
    return {
      suggestions: violations.slice(0, 5).map(violation => ({
        violationId: violation.id,
        priority: violation.impact === 'critical' ? 'high' : violation.impact === 'serious' ? 'medium' : 'low',
        title: `Fix ${violation.id}`,
        problem: violation.description,
        wcagGuidelines: violation.tags?.filter(tag => tag.startsWith('wcag')) || [],
        impact: `This ${violation.impact} impact issue affects users with disabilities`,
        solution: violation.help,
        codeExample: {
          before: violation.nodes[0]?.html || '<!-- No example available -->',
          after: '<!-- Please refer to WCAG guidelines for proper implementation -->',
          css: '',
          javascript: ''
        },
        additionalTips: [
          'Refer to WCAG guidelines for detailed implementation',
          'Test with screen readers and keyboard navigation'
        ],
        testingInstructions: 'Use axe-core or similar accessibility testing tools to verify the fix'
      })),
      generalRecommendations: [
        'Implement a comprehensive accessibility testing strategy',
        'Use semantic HTML elements where possible',
        'Ensure proper color contrast ratios',
        'Make all interactive elements keyboard accessible'
      ],
      resourceLinks: [
        {
          title: 'WCAG 2.1 Guidelines',
          url: 'https://www.w3.org/WAI/WCAG21/quickref/'
        },
        {
          title: 'axe-core Rules',
          url: 'https://dequeuniversity.com/rules/axe/'
        }
      ]
    };
  }
}

export async function validateApiKey() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: 'Test',
    });
    return true;
  } catch (error) {
    console.error('Gemini API key validation failed:', error);
    return false;
  }
}