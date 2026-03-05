import { MongoClient, Db } from "mongodb";
import { SITES } from "./sites";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// FIX: Add this function for your API routes
export async function connectToDatabase() {
  const client = await clientPromise;
  return client;
}

export { clientPromise };

export async function getDb(dbName: string): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getWarehouseDb(): Promise<Db> {
  return getDb("inventory_warehouse_main");
}

export async function getSiteDb(siteKey: string): Promise<Db> {
  // FIX: Explicitly map 'WAREHOUSE' key to the correct warehouse database
  if (siteKey === "WAREHOUSE") {
    return getWarehouseDb();
  }
  const site = SITES.find((s) => s.key === siteKey);
  return getDb(site ? site.dbName : siteKey);
}