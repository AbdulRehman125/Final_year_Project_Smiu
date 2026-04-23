import { PrismaClient } from "@/generated/prisma/client";
// import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Use this instance in your app
export const db = new PrismaClient({ adapter });