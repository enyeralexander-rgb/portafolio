import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as esquema from "./esquema";

export type Db = NeonHttpDatabase<typeof esquema>;

export function crearDb(databaseUrl: string): Db {
  return drizzle({ client: neon(databaseUrl), schema: esquema });
}
