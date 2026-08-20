import { NextRequest, NextResponse } from 'next/server';
import { runCypherQuery, checkDatabaseConnection } from '@/lib/cognodb';
import { PREDEFINED_CYPHER_QUERIES } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cypher, params = {} } = body;

    if (!cypher || typeof cypher !== 'string') {
      return NextResponse.json({ error: 'Cypher query string is required' }, { status: 400 });
    }

    // Disallow mutation queries in standard web explorer playground for safety
    const forbiddenKeywords = ['DELETE', 'DROP', 'DETACH', 'CREATE', 'SET', 'MERGE', 'REMOVE'];
    const uppercaseCypher = cypher.toUpperCase();
    const hasForbidden = forbiddenKeywords.some((word) => uppercaseCypher.includes(word));

    if (hasForbidden && !body.allowWrite) {
      return NextResponse.json({
        error: 'Writing/mutating Cypher operations (CREATE, DELETE, SET, etc.) are restricted in read-only playground mode.',
      }, { status: 400 });
    }

    const startTime = Date.now();
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.isConnected) {
      // Return predefined mock results corresponding to sample queries
      const matchedPredefined = PREDEFINED_CYPHER_QUERIES.find((q) => q.cypher.trim() === cypher.trim());
      
      const mockResult = matchedPredefined
        ? [
            {
              service: 'auth-service',
              vulnerablePackage: 'flat-map-stream',
              cve: 'CVE-2026-4401',
              severity: 'CRITICAL',
              depth: 3,
            },
            {
              service: 'order-processor',
              vulnerablePackage: 'flat-map-stream',
              cve: 'CVE-2026-4401',
              severity: 'CRITICAL',
              depth: 2,
            },
            {
              service: 'payment-gateway',
              vulnerablePackage: 'node-forge',
              cve: 'CVE-2026-1182',
              severity: 'HIGH',
              depth: 1,
            },
          ]
        : [{ result: 'Cypher query executed against offline mock engine.', inputParams: params }];

      return NextResponse.json({
        records: mockResult,
        executionTimeMs: Date.now() - startTime,
        isMock: true,
        notice: 'Executing against realistic offline mock database engine.',
      });
    }

    // Execute live against CognoDB
    const { records } = await runCypherQuery(cypher, params);

    return NextResponse.json({
      records,
      executionTimeMs: Date.now() - startTime,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Cypher execution failed:', error);
    return NextResponse.json({
      error: error?.message || 'Failed to execute Cypher query',
    }, { status: 500 });
  }
}
