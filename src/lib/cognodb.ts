import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

let driverInstance: Driver | null = null;

export function getNeo4jDriver(): Driver | null {
  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || 'cognodb';
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password || uri.includes('your-instance-id') || password === 'demo_password') {
    return null; // Signals to use realistic local mock fallback
  }

  if (!driverInstance) {
    try {
      driverInstance = neo4j.driver(
        uri,
        neo4j.auth.basic(user, password),
        {
          maxConnectionLifetime: 3 * 60 * 1000,
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 5000,
          disableLosslessIntegers: true,
        }
      );
    } catch (error) {
      console.error('Failed to initialize CognoDB/Neo4j driver:', error);
      return null;
    }
  }

  return driverInstance;
}

export interface ConnectionStatus {
  isConnected: boolean;
  uri?: string;
  user?: string;
  error?: string;
  isMockFallback: boolean;
}

export async function checkDatabaseConnection(): Promise<ConnectionStatus> {
  const driver = getNeo4jDriver();
  
  if (!driver) {
    return {
      isConnected: false,
      isMockFallback: true,
      error: 'CognoDB credentials not configured or set to placeholder. Operating in fallback demo mode.',
    };
  }

  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS test');
    const value = result.records[0]?.get('test');
    if (value === 1) {
      return {
        isConnected: true,
        uri: process.env.COGNODB_URI,
        user: process.env.COGNODB_USER || 'cognodb',
        isMockFallback: false,
      };
    }
    return {
      isConnected: false,
      isMockFallback: true,
      error: 'Unexpected query response from CognoDB.',
    };
  } catch (error: any) {
    console.warn('CognoDB connection check failed:', error?.message || error);
    return {
      isConnected: false,
      isMockFallback: true,
      error: error?.message || 'Unable to connect to CognoDB Cloud instance.',
    };
  } finally {
    await session.close();
  }
}

export async function runCypherQuery<T = any>(
  cypher: string,
  params: Record<string, any> = {}
): Promise<{ records: T[]; isMock: boolean }> {
  const driver = getNeo4jDriver();

  if (!driver) {
    return { records: [], isMock: true };
  }

  const session: Session = driver.session();
  try {
    const result: QueryResult = await session.run(cypher, params);
    const records = result.records.map((record) => {
      const obj: Record<string, any> = {};
      record.keys.forEach((key) => {
        const val = record.get(key);
        // Normalize Neo4j Node / Relationship / Integer objects
        if (val && typeof val === 'object' && 'properties' in val) {
          obj[String(key)] = {
            id: val.identity ? val.identity.toString() : val.properties.id || val.properties.cveId || val.properties.name,
            labels: val.labels || [val.type],
            properties: val.properties,
          };
        } else if (val && typeof val === 'object' && 'low' in val) {
          obj[String(key)] = val.low;
        } else {
          obj[String(key)] = val;
        }
      });
      return obj as T;
    });

    return { records, isMock: false };
  } catch (error) {
    console.error('Error executing Cypher query:', cypher, error);
    throw error;
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}
