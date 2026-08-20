const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USER || 'cognodb';
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password || uri.includes('your-instance-id') || password === 'demo_password') {
  console.log('---------------------------------------------------------');
  console.log('⚠️ CognoDB Credentials missing or set to placeholder in .env!');
  console.log('Please set COGNODB_URI, COGNODB_USER, and COGNODB_PASSWORD in .env');
  console.log('to seed your live CognoDB Cloud instance.');
  console.log('---------------------------------------------------------');
  process.exit(0);
}

console.log(`🔌 Connecting to CognoDB at ${uri}...`);
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const SEED_CYPHER = [
  // Clean existing graph safely
  `MATCH (n) DETACH DELETE n`,

  // Create Unique Constraints (openCypher syntax)
  `CREATE CONSTRAINT service_name IF NOT EXISTS FOR (s:Service) REQUIRE s.name IS UNIQUE`,
  `CREATE CONSTRAINT package_name IF NOT EXISTS FOR (p:Package) REQUIRE p.name IS UNIQUE`,
  `CREATE CONSTRAINT vuln_cve IF NOT EXISTS FOR (v:Vulnerability) REQUIRE v.cveId IS UNIQUE`,
  `CREATE CONSTRAINT maintainer_name IF NOT EXISTS FOR (m:Maintainer) REQUIRE m.name IS UNIQUE`,
  `CREATE CONSTRAINT server_name IF NOT EXISTS FOR (srv:Server) REQUIRE srv.name IS UNIQUE`,

  // Create Microservices
  `CREATE (:Service {id: 'svc-auth', name: 'auth-service', environment: 'production', ownerTeam: 'Security Core', version: '2.4.0', criticality: 'CRITICAL'})`,
  `CREATE (:Service {id: 'svc-payments', name: 'payment-gateway', environment: 'production', ownerTeam: 'Fintech Team', version: '1.9.1', criticality: 'CRITICAL'})`,
  `CREATE (:Service {id: 'svc-dashboard', name: 'user-dashboard', environment: 'production', ownerTeam: 'Frontend Ops', version: '3.1.0', criticality: 'HIGH'})`,
  `CREATE (:Service {id: 'svc-analytics', name: 'analytics-engine', environment: 'staging', ownerTeam: 'Data Squad', version: '1.2.0', criticality: 'MEDIUM'})`,
  `CREATE (:Service {id: 'svc-orders', name: 'order-processor', environment: 'production', ownerTeam: 'Commerce Core', version: '4.0.2', criticality: 'HIGH'})`,

  // Create Packages
  `CREATE (:Package {id: 'pkg-express', name: 'express', version: '4.18.2', ecosystem: 'npm', downloadsCount: '28M/wk'})`,
  `CREATE (:Package {id: 'pkg-jwt', name: 'json-web-token', version: '9.0.0', ecosystem: 'npm', downloadsCount: '15M/wk'})`,
  `CREATE (:Package {id: 'pkg-axios', name: 'axios', version: '1.6.0', ecosystem: 'npm', downloadsCount: '42M/wk'})`,
  `CREATE (:Package {id: 'pkg-lodash', name: 'lodash', version: '4.17.20', ecosystem: 'npm', downloadsCount: '50M/wk'})`,
  `CREATE (:Package {id: 'pkg-event-stream', name: 'event-stream', version: '3.3.4', ecosystem: 'npm', downloadsCount: '2M/wk'})`,
  `CREATE (:Package {id: 'pkg-flat-map-stream', name: 'flat-map-stream', version: '0.1.1', ecosystem: 'npm', downloadsCount: '500k/wk'})`,
  `CREATE (:Package {id: 'pkg-node-forge', name: 'node-forge', version: '1.3.0', ecosystem: 'npm', downloadsCount: '18M/wk'})`,
  `CREATE (:Package {id: 'pkg-mime', name: 'mime', version: '1.6.0', ecosystem: 'npm', downloadsCount: '30M/wk'})`,

  // Create Vulnerabilities (CVEs)
  `CREATE (:Vulnerability {id: 'vuln-cve-2026-4401', cveId: 'CVE-2026-4401', severity: 'CRITICAL', cvssScore: 9.8, description: 'Arbitrary code execution payload embedded in transit dependency flat-map-stream stealing API credentials.', patchedIn: 'flat-map-stream@0.1.2'})`,
  `CREATE (:Vulnerability {id: 'vuln-cve-2026-3108', cveId: 'CVE-2026-3108', severity: 'HIGH', cvssScore: 8.2, description: 'Prototype pollution in lodash.defaultsDeep allowing remote object attribute injection.', patchedIn: 'lodash@4.17.21'})`,
  `CREATE (:Vulnerability {id: 'vuln-cve-2026-5590', cveId: 'CVE-2026-5590', severity: 'CRITICAL', cvssScore: 9.6, description: 'Key confusion signature verification bypass when algorithm is set to none or HMAC with public key.', patchedIn: 'json-web-token@9.0.2'})`,
  `CREATE (:Vulnerability {id: 'vuln-cve-2026-1182', cveId: 'CVE-2026-1182', severity: 'HIGH', cvssScore: 7.8, description: 'Uninitialized memory read in TLS ASN.1 parser resulting in secret disclosure.', patchedIn: 'node-forge@1.3.1'})`,

  // Create Maintainers
  `CREATE (:Maintainer {id: 'maint-alexander', name: 'Alexander Wright', email: 'alex@npm-core.org', trustScore: 94, country: 'USA'})`,
  `CREATE (:Maintainer {id: 'maint-compromised', name: 'Right9ctrl', email: 'anon-dev@torbox.net', trustScore: 12, country: 'Unknown'})`,
  `CREATE (:Maintainer {id: 'maint-open-hero', name: 'Sarah Chen', email: 'sarah.chen@openjs.org', trustScore: 98, country: 'Canada'})`,

  // Create Infrastructure Cloud Servers
  `CREATE (:Server {id: 'srv-aws-prod-1', name: 'aws-us-east-1a-prod', cloudProvider: 'AWS', region: 'us-east-1', ipAddress: '54.210.14.88'})`,
  `CREATE (:Server {id: 'srv-aws-prod-2', name: 'aws-us-east-1b-prod', cloudProvider: 'AWS', region: 'us-east-1', ipAddress: '54.210.99.12'})`,
  `CREATE (:Server {id: 'srv-gcp-prod-1', name: 'gcp-europe-west1-prod', cloudProvider: 'GCP', region: 'europe-west1', ipAddress: '34.76.120.4'})`,

  // Connect Relationships
  `MATCH (s:Service {name: 'auth-service'}), (p:Package {name: 'json-web-token'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'auth-service'}), (p:Package {name: 'express'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'payment-gateway'}), (p:Package {name: 'axios'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'payment-gateway'}), (p:Package {name: 'node-forge'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'user-dashboard'}), (p:Package {name: 'lodash'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'order-processor'}), (p:Package {name: 'event-stream'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'order-processor'}), (p:Package {name: 'axios'}) CREATE (s)-[:USES]->(p)`,
  `MATCH (s:Service {name: 'analytics-engine'}), (p:Package {name: 'lodash'}) CREATE (s)-[:USES]->(p)`,

  // Package -> Package Multi-Hop Dependencies
  `MATCH (p1:Package {name: 'express'}), (p2:Package {name: 'mime'}) CREATE (p1)-[:DEPENDS_ON]->(p2)`,
  `MATCH (p1:Package {name: 'axios'}), (p2:Package {name: 'event-stream'}) CREATE (p1)-[:DEPENDS_ON]->(p2)`,
  `MATCH (p1:Package {name: 'event-stream'}), (p2:Package {name: 'flat-map-stream'}) CREATE (p1)-[:DEPENDS_ON]->(p2)`,

  // Package -> Vulnerabilities
  `MATCH (p:Package {name: 'flat-map-stream'}), (v:Vulnerability {cveId: 'CVE-2026-4401'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)`,
  `MATCH (p:Package {name: 'lodash'}), (v:Vulnerability {cveId: 'CVE-2026-3108'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)`,
  `MATCH (p:Package {name: 'json-web-token'}), (v:Vulnerability {cveId: 'CVE-2026-5590'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)`,
  `MATCH (p:Package {name: 'node-forge'}), (v:Vulnerability {cveId: 'CVE-2026-1182'}) CREATE (p)-[:HAS_VULNERABILITY]->(v)`,

  // Maintainers -> Packages
  `MATCH (p:Package {name: 'express'}), (m:Maintainer {name: 'Alexander Wright'}) CREATE (p)-[:MAINTAINED_BY]->(m)`,
  `MATCH (p:Package {name: 'flat-map-stream'}), (m:Maintainer {name: 'Right9ctrl'}) CREATE (p)-[:MAINTAINED_BY]->(m)`,
  `MATCH (p:Package {name: 'json-web-token'}), (m:Maintainer {name: 'Sarah Chen'}) CREATE (p)-[:MAINTAINED_BY]->(m)`,
  `MATCH (p:Package {name: 'lodash'}), (m:Maintainer {name: 'Sarah Chen'}) CREATE (p)-[:MAINTAINED_BY]->(m)`,

  // Service -> Cloud Servers
  `MATCH (s:Service {name: 'auth-service'}), (srv:Server {name: 'aws-us-east-1a-prod'}) CREATE (s)-[:DEPLOYED_TO]->(srv)`,
  `MATCH (s:Service {name: 'payment-gateway'}), (srv:Server {name: 'aws-us-east-1a-prod'}) CREATE (s)-[:DEPLOYED_TO]->(srv)`,
  `MATCH (s:Service {name: 'payment-gateway'}), (srv:Server {name: 'aws-us-east-1b-prod'}) CREATE (s)-[:DEPLOYED_TO]->(srv)`,
  `MATCH (s:Service {name: 'order-processor'}), (srv:Server {name: 'gcp-europe-west1-prod'}) CREATE (s)-[:DEPLOYED_TO]->(srv)`,
  `MATCH (s:Service {name: 'user-dashboard'}), (srv:Server {name: 'aws-us-east-1b-prod'}) CREATE (s)-[:DEPLOYED_TO]->(srv)`,
];

async function seed() {
  const session = driver.session();
  try {
    console.log('🌱 Seeding CognoDB Graph Database...');
    for (const query of SEED_CYPHER) {
      process.stdout.write('.');
      try {
        await session.run(query);
      } catch (err) {
        // Ignore constraint exists error if supported differently in openCypher dialect
        if (!err.message.includes('already exists')) {
          console.warn('\nQuery notice:', err.message);
        }
      }
    }
    console.log('\n✅ Successfully seeded CognoDB Graph Database with Nodes & Relationships!');
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
