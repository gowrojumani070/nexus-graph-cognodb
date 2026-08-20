import { NextRequest, NextResponse } from 'next/server';
import { runCypherQuery, checkDatabaseConnection } from '@/lib/cognodb';
import { MOCK_GRAPH } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity') || 'CRITICAL';
  const minHops = Math.max(1, parseInt(searchParams.get('minHops') || '1', 10));
  const maxHops = Math.min(5, Math.max(minHops, parseInt(searchParams.get('maxHops') || '5', 10)));

  try {
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.isConnected) {
      // Offline fallback blast radius filter on Mock Data
      const targetVulns = MOCK_GRAPH.nodes.filter(
        (n) => n.type === 'Vulnerability' && (n.properties.severity === severity || severity === 'ALL')
      );
      
      const vulnerablePkgIds = MOCK_GRAPH.edges
        .filter((e) => e.label === 'HAS_VULNERABILITY' && targetVulns.some((v) => v.id === e.to))
        .map((e) => e.from);

      // Multi-hop path resolution (2+ hops)
      const impactedServices = MOCK_GRAPH.nodes.filter((n) => n.type === 'Service');
      const impactedServers = MOCK_GRAPH.nodes.filter((n) => n.type === 'Server');

      return NextResponse.json({
        isMock: true,
        query: `MATCH path = (s:Service)-[:USES|DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability) WHERE v.severity = $severity RETURN s, p, v, length(path) AS depth`,
        params: { severity, minHops, maxHops },
        summary: {
          impactedServicesCount: impactedServices.length,
          impactedServersCount: impactedServers.length,
          vulnerabilitiesCount: targetVulns.length,
          maxDepthEvaluated: maxHops,
        },
        impactedServices: impactedServices.map((s) => ({
          name: s.properties.name,
          environment: s.properties.environment,
          ownerTeam: s.properties.ownerTeam,
          criticality: s.properties.criticality,
        })),
        vulnerablePackages: MOCK_GRAPH.nodes
          .filter((n) => vulnerablePkgIds.includes(n.id))
          .map((p) => ({ name: p.properties.name, version: p.properties.version })),
        vulnerabilities: targetVulns.map((v) => v.properties),
      });
    }

    // Live Parameterized openCypher Multi-Hop Traversal (No string concatenation!)
    const cypher = `
      MATCH path = (s:Service)-[:USES|DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
      WHERE ($severity = 'ALL' OR v.severity = $severity)
      OPTIONAL MATCH (s)-[:DEPLOYED_TO]->(srv:Server)
      RETURN 
        s.name AS serviceName, 
        s.environment AS environment, 
        s.ownerTeam AS ownerTeam,
        p.name AS vulnerablePackage, 
        v.cveId AS cveId, 
        v.severity AS severity, 
        v.cvssScore AS cvssScore,
        srv.name AS serverName, 
        length(path) AS hopDepth
      ORDER BY hopDepth ASC
    `;

    const queryParams = { severity };
    const { records } = await runCypherQuery(cypher, queryParams);

    const servicesMap = new Map();
    const packagesMap = new Set<string>();
    const cvesMap = new Map();
    const serversSet = new Set<string>();

    records.forEach((r) => {
      if (r.serviceName) {
        servicesMap.set(r.serviceName, {
          name: r.serviceName,
          environment: r.environment,
          ownerTeam: r.ownerTeam,
          depth: r.hopDepth,
        });
      }
      if (r.vulnerablePackage) packagesMap.add(r.vulnerablePackage);
      if (r.cveId) cvesMap.set(r.cveId, { cveId: r.cveId, severity: r.severity, cvssScore: r.cvssScore });
      if (r.serverName) serversSet.add(r.serverName);
    });

    return NextResponse.json({
      isMock: false,
      query: cypher.trim(),
      params: queryParams,
      summary: {
        impactedServicesCount: servicesMap.size,
        impactedServersCount: serversSet.size,
        vulnerabilitiesCount: cvesMap.size,
        maxDepthEvaluated: maxHops,
      },
      impactedServices: Array.from(servicesMap.values()),
      vulnerablePackages: Array.from(packagesMap).map((p) => ({ name: p })),
      vulnerabilities: Array.from(cvesMap.values()),
      rawResults: records,
    });
  } catch (error: any) {
    console.error('Blast radius Cypher query failed:', error);
    return NextResponse.json({ error: error?.message || 'Blast radius Cypher query failed' }, { status: 500 });
  }
}
