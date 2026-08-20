export interface GraphNode {
  id: string;
  label: string; // Service, Package, Vulnerability, Maintainer, Server
  title: string;
  type: 'Service' | 'Package' | 'Vulnerability' | 'Maintainer' | 'Server';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: 'USES' | 'DEPENDS_ON' | 'HAS_VULNERABILITY' | 'MAINTAINED_BY' | 'DEPLOYED_TO';
  title?: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const MOCK_NODES: GraphNode[] = [
  // Microservices
  {
    id: 'svc-auth',
    label: 'auth-service',
    title: 'Auth Microservice (v2.4.0)',
    type: 'Service',
    properties: {
      name: 'auth-service',
      environment: 'production',
      ownerTeam: 'Security Team',
      version: 'v2.4.0',
      criticality: 'CRITICAL',
    },
  },
  {
    id: 'svc-payments',
    label: 'payment-gateway',
    title: 'Payment Gateway (v1.9.1)',
    type: 'Service',
    properties: {
      name: 'payment-gateway',
      environment: 'production',
      ownerTeam: 'Fintech Core',
      version: 'v1.9.1',
      criticality: 'CRITICAL',
    },
  },
  {
    id: 'svc-dashboard',
    label: 'user-dashboard',
    title: 'User Dashboard App (v3.1.0)',
    type: 'Service',
    properties: {
      name: 'user-dashboard',
      environment: 'production',
      ownerTeam: 'Frontend Ops',
      version: 'v3.1.0',
      criticality: 'HIGH',
    },
  },
  {
    id: 'svc-analytics',
    label: 'analytics-engine',
    title: 'Analytics Engine (v1.2.0)',
    type: 'Service',
    properties: {
      name: 'analytics-engine',
      environment: 'staging',
      ownerTeam: 'Data Squad',
      version: 'v1.2.0',
      criticality: 'MEDIUM',
    },
  },
  {
    id: 'svc-orders',
    label: 'order-processor',
    title: 'Order Processing Microservice',
    type: 'Service',
    properties: {
      name: 'order-processor',
      environment: 'production',
      ownerTeam: 'Commerce Core',
      version: 'v4.0.2',
      criticality: 'HIGH',
    },
  },

  // Packages (Tier 1 & Transitive Dependencies)
  {
    id: 'pkg-express',
    label: 'express',
    title: 'express v4.18.2',
    type: 'Package',
    properties: { name: 'express', version: '4.18.2', ecosystem: 'npm', downloadsCount: '28M/wk' },
  },
  {
    id: 'pkg-jwt',
    label: 'json-web-token',
    title: 'json-web-token v9.0.0',
    type: 'Package',
    properties: { name: 'json-web-token', version: '9.0.0', ecosystem: 'npm', downloadsCount: '15M/wk' },
  },
  {
    id: 'pkg-axios',
    label: 'axios',
    title: 'axios v1.6.0',
    type: 'Package',
    properties: { name: 'axios', version: '1.6.0', ecosystem: 'npm', downloadsCount: '42M/wk' },
  },
  {
    id: 'pkg-lodash',
    label: 'lodash',
    title: 'lodash v4.17.20',
    type: 'Package',
    properties: { name: 'lodash', version: '4.17.20', ecosystem: 'npm', downloadsCount: '50M/wk' },
  },
  {
    id: 'pkg-event-stream',
    label: 'event-stream',
    title: 'event-stream v3.3.4',
    type: 'Package',
    properties: { name: 'event-stream', version: '3.3.4', ecosystem: 'npm', downloadsCount: '2M/wk' },
  },
  {
    id: 'pkg-flat-map-stream',
    label: 'flat-map-stream',
    title: 'flat-map-stream v0.1.1 (Malicious Deep Dep)',
    type: 'Package',
    properties: { name: 'flat-map-stream', version: '0.1.1', ecosystem: 'npm', downloadsCount: '500k/wk' },
  },
  {
    id: 'pkg-node-forge',
    label: 'node-forge',
    title: 'node-forge v1.3.0',
    type: 'Package',
    properties: { name: 'node-forge', version: '1.3.0', ecosystem: 'npm', downloadsCount: '18M/wk' },
  },
  {
    id: 'pkg-mime',
    label: 'mime',
    title: 'mime v1.6.0',
    type: 'Package',
    properties: { name: 'mime', version: '1.6.0', ecosystem: 'npm', downloadsCount: '30M/wk' },
  },

  // Vulnerabilities / CVEs
  {
    id: 'vuln-cve-2026-4401',
    label: 'CVE-2026-4401',
    title: 'CVE-2026-4401 (CRITICAL CVSS 9.8 RCE)',
    type: 'Vulnerability',
    properties: {
      cveId: 'CVE-2026-4401',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      description: 'Arbitrary code execution payload embedded in transit dependency flat-map-stream stealing API credentials.',
      patchedIn: 'flat-map-stream@0.1.2',
    },
  },
  {
    id: 'vuln-cve-2026-3108',
    label: 'CVE-2026-3108',
    title: 'CVE-2026-3108 (HIGH CVSS 8.2 Prototype Pollution)',
    type: 'Vulnerability',
    properties: {
      cveId: 'CVE-2026-3108',
      severity: 'HIGH',
      cvssScore: 8.2,
      description: 'Prototype pollution in lodash.defaultsDeep allowing remote object attribute injection.',
      patchedIn: 'lodash@4.17.21',
    },
  },
  {
    id: 'vuln-cve-2026-5590',
    label: 'CVE-2026-5590',
    title: 'CVE-2026-5590 (CRITICAL CVSS 9.6 Auth Bypass)',
    type: 'Vulnerability',
    properties: {
      cveId: 'CVE-2026-5590',
      severity: 'CRITICAL',
      cvssScore: 9.6,
      description: 'Key confusion signature verification bypass when algorithm is set to none or HMAC with public key.',
      patchedIn: 'json-web-token@9.0.2',
    },
  },
  {
    id: 'vuln-cve-2026-1182',
    label: 'CVE-2026-1182',
    title: 'CVE-2026-1182 (HIGH CVSS 7.8 TLS Buffer Leak)',
    type: 'Vulnerability',
    properties: {
      cveId: 'CVE-2026-1182',
      severity: 'HIGH',
      cvssScore: 7.8,
      description: 'Uninitialized memory read in TLS ASN.1 parser resulting in secret disclosure.',
      patchedIn: 'node-forge@1.3.1',
    },
  },

  // Maintainers
  {
    id: 'maint-alexander',
    label: 'alexander-dev',
    title: 'Alexander Wright (Core Maintainer)',
    type: 'Maintainer',
    properties: { name: 'Alexander Wright', email: 'alex@npm-core.org', trustScore: 94, country: 'USA' },
  },
  {
    id: 'maint-compromised',
    label: 'compromised-actor-x',
    title: 'Right9ctrl (Suspicious Maintainer)',
    type: 'Maintainer',
    properties: { name: 'Right9ctrl', email: 'anon-dev@torbox.net', trustScore: 12, country: 'Unknown' },
  },
  {
    id: 'maint-open-hero',
    label: 'open-source-hero',
    title: 'Sarah Chen (Open Source Guild)',
    type: 'Maintainer',
    properties: { name: 'Sarah Chen', email: 'sarah.chen@openjs.org', trustScore: 98, country: 'Canada' },
  },

  // Servers / Production Targets
  {
    id: 'srv-aws-prod-1',
    label: 'aws-us-east-1a-prod',
    title: 'AWS US-East-1 Production Cluster 01',
    type: 'Server',
    properties: { name: 'aws-us-east-1a-prod', cloudProvider: 'AWS', region: 'us-east-1', ipAddress: '54.210.14.88' },
  },
  {
    id: 'srv-aws-prod-2',
    label: 'aws-us-east-1b-prod',
    title: 'AWS US-East-1 Production Cluster 02',
    type: 'Server',
    properties: { name: 'aws-us-east-1b-prod', cloudProvider: 'AWS', region: 'us-east-1', ipAddress: '54.210.99.12' },
  },
  {
    id: 'srv-gcp-prod-1',
    label: 'gcp-europe-west1-prod',
    title: 'GCP Europe West Production Cluster',
    type: 'Server',
    properties: { name: 'gcp-europe-west1-prod', cloudProvider: 'GCP', region: 'europe-west1', ipAddress: '34.76.120.4' },
  },
];

export const MOCK_EDGES: GraphEdge[] = [
  // Services using packages (1st hop)
  { id: 'e1', from: 'svc-auth', to: 'pkg-jwt', label: 'USES' },
  { id: 'e2', from: 'svc-auth', to: 'pkg-express', label: 'USES' },
  { id: 'e3', from: 'svc-payments', to: 'pkg-axios', label: 'USES' },
  { id: 'e4', from: 'svc-payments', to: 'pkg-node-forge', label: 'USES' },
  { id: 'e5', from: 'svc-dashboard', to: 'pkg-lodash', label: 'USES' },
  { id: 'e6', from: 'svc-orders', to: 'pkg-event-stream', label: 'USES' },
  { id: 'e7', from: 'svc-orders', to: 'pkg-axios', label: 'USES' },
  { id: 'e8', from: 'svc-analytics', to: 'pkg-lodash', label: 'USES' },

  // Transitive dependencies (2nd & 3rd hop)
  { id: 'e9', from: 'pkg-express', to: 'pkg-mime', label: 'DEPENDS_ON' },
  { id: 'e10', from: 'pkg-axios', to: 'pkg-event-stream', label: 'DEPENDS_ON' },
  { id: 'e11', from: 'pkg-event-stream', to: 'pkg-flat-map-stream', label: 'DEPENDS_ON' },

  // Vulnerabilities linked to packages
  { id: 'e12', from: 'pkg-flat-map-stream', to: 'vuln-cve-2026-4401', label: 'HAS_VULNERABILITY' },
  { id: 'e13', from: 'pkg-lodash', to: 'vuln-cve-2026-3108', label: 'HAS_VULNERABILITY' },
  { id: 'e14', from: 'pkg-jwt', to: 'vuln-cve-2026-5590', label: 'HAS_VULNERABILITY' },
  { id: 'e15', from: 'pkg-node-forge', to: 'vuln-cve-2026-1182', label: 'HAS_VULNERABILITY' },

  // Maintainer relationships
  { id: 'e16', from: 'pkg-express', to: 'maint-alexander', label: 'MAINTAINED_BY' },
  { id: 'e17', from: 'pkg-flat-map-stream', to: 'maint-compromised', label: 'MAINTAINED_BY' },
  { id: 'e18', from: 'pkg-jwt', to: 'maint-open-hero', label: 'MAINTAINED_BY' },
  { id: 'e19', from: 'pkg-lodash', to: 'maint-open-hero', label: 'MAINTAINED_BY' },

  // Deployments to Servers
  { id: 'e20', from: 'svc-auth', to: 'srv-aws-prod-1', label: 'DEPLOYED_TO' },
  { id: 'e21', from: 'svc-payments', to: 'srv-aws-prod-1', label: 'DEPLOYED_TO' },
  { id: 'e22', from: 'svc-payments', to: 'srv-aws-prod-2', label: 'DEPLOYED_TO' },
  { id: 'e23', from: 'svc-orders', to: 'srv-gcp-prod-1', label: 'DEPLOYED_TO' },
  { id: 'e24', from: 'svc-dashboard', to: 'srv-aws-prod-2', label: 'DEPLOYED_TO' },
];

export const MOCK_GRAPH: GraphData = {
  nodes: MOCK_NODES,
  edges: MOCK_EDGES,
};

export const PREDEFINED_CYPHER_QUERIES = [
  {
    id: 'blast-radius',
    name: 'Transitive Vulnerability Blast Radius (Multi-Hop 2-5 Hops)',
    description: 'Finds all production servers and microservices impacted by deep upstream dependencies containing CRITICAL or HIGH CVE vulnerabilities.',
    cypher: `MATCH path = (s:Service)-[:USES|DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
WHERE v.severity IN ['CRITICAL', 'HIGH']
OPTIONAL MATCH (s)-[:DEPLOYED_TO]->(srv:Server)
RETURN s.name AS service, s.environment AS env, p.name AS vulnerablePackage, v.cveId AS cve, v.severity AS severity, srv.name AS targetServer, length(path) AS depth
ORDER BY depth ASC`,
    params: { severity: 'CRITICAL' },
  },
  {
    id: 'shortest-path',
    name: 'Shortest Attack Path (Server to Targeted CVE)',
    description: 'Uses shortestPath() openCypher function to compute the exact minimal attack vector from an exposed cloud server to a vulnerable component.',
    cypher: `MATCH (srv:Server {name: 'aws-us-east-1a-prod'}), (v:Vulnerability {cveId: 'CVE-2026-4401'})
MATCH p = shortestPath((srv)<-[:DEPLOYED_TO]-(:Service)-[:USES|DEPENDS_ON*1..6]->(:Package)-[:HAS_VULNERABILITY]->(v))
RETURN [n IN nodes(p) | labels(n)[0] + ': ' + coalesce(n.name, n.cveId)] AS pathNodes, length(p) AS hopLength`,
    params: {},
  },
  {
    id: 'maintainer-risk',
    name: 'High Centrality Maintainer Blast Score',
    description: 'Aggregates graph centrality to identify maintainers controlling packages with the highest downstream blast radius on production services.',
    cypher: `MATCH (m:Maintainer)<-[:MAINTAINED_BY]-(p:Package)<-[:USES|DEPENDS_ON*1..5]-(s:Service)
RETURN m.name AS maintainer, m.email AS email, m.trustScore AS trustScore, count(DISTINCT s) AS impactedServices, count(DISTINCT p) AS managedPackages
ORDER BY impactedServices DESC, trustScore ASC
LIMIT 10`,
    params: {},
  },
  {
    id: 'all-servers-affected',
    name: 'Cloud Infrastructure Vulnerability Exposure Map',
    description: 'Maps cloud servers to all active vulnerabilities running inside deployed microservices.',
    cypher: `MATCH (srv:Server)<-[:DEPLOYED_TO]-(s:Service)-[:USES|DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
RETURN srv.name AS cloudServer, srv.cloudProvider AS provider, collect(DISTINCT s.name) AS services, collect(DISTINCT v.cveId) AS cves, count(DISTINCT v) AS totalVulnerabilities
ORDER BY totalVulnerabilities DESC`,
    params: {},
  },
];
