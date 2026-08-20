import { NextResponse } from 'next/server';
import { runCypherQuery, checkDatabaseConnection } from '@/lib/cognodb';
import { MOCK_GRAPH } from '@/lib/mockData';

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.isConnected) {
      return NextResponse.json({
        ...MOCK_GRAPH,
        isMock: true,
        notice: dbStatus.error || 'Operating in realistic demo fallback mode.',
      });
    }

    // Live CognoDB openCypher Query
    const cypher = `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT 250
    `;

    const { records } = await runCypherQuery(cypher);

    const nodesMap = new Map();
    const edgesList: any[] = [];

    records.forEach((rec) => {
      if (rec.n) {
        const node = rec.n;
        const id = node.properties.id || node.id || node.properties.cveId || node.properties.name;
        const type = node.labels[0] || 'Unknown';
        const label = node.properties.name || node.properties.cveId || id;
        
        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id,
            label,
            title: `${type}: ${label}`,
            type,
            properties: node.properties,
          });
        }
      }

      if (rec.m) {
        const nodeM = rec.m;
        const idM = nodeM.properties.id || nodeM.id || nodeM.properties.cveId || nodeM.properties.name;
        const typeM = nodeM.labels[0] || 'Unknown';
        const labelM = nodeM.properties.name || nodeM.properties.cveId || idM;
        
        if (!nodesMap.has(idM)) {
          nodesMap.set(idM, {
            id: idM,
            label: labelM,
            title: `${typeM}: ${labelM}`,
            type: typeM,
            properties: nodeM.properties,
          });
        }
      }

      if (rec.r && rec.n && rec.m) {
        const fromId = rec.n.properties.id || rec.n.id || rec.n.properties.cveId || rec.n.properties.name;
        const toId = rec.m.properties.id || rec.m.id || rec.m.properties.cveId || rec.m.properties.name;
        const edgeId = `${fromId}-${rec.r.labels[0] || 'REL'}-${toId}`;
        
        edgesList.push({
          id: edgeId,
          from: fromId,
          to: toId,
          label: rec.r.labels[0] || 'CONNECTED_TO',
          properties: rec.r.properties || {},
        });
      }
    });

    const nodes = Array.from(nodesMap.values());

    if (nodes.length === 0) {
      return NextResponse.json({
        ...MOCK_GRAPH,
        isMock: true,
        notice: 'CognoDB is connected but empty. Please run seeding script (npm run seed). Showing demo graph.',
      });
    }

    return NextResponse.json({
      nodes,
      edges: edgesList,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Error fetching graph from CognoDB:', error);
    return NextResponse.json({
      ...MOCK_GRAPH,
      isMock: true,
      notice: 'Fallback to offline mock graph due to query execution notice.',
    });
  }
}
