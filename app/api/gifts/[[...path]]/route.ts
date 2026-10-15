import { env } from 'cloudflare:workers';
import { handleGift } from '../../../../lib/gifts.js';
export const dynamic='force-dynamic';
export async function GET(request:Request){return handleGift(request,env.DB);}
export async function POST(request:Request){return handleGift(request,env.DB);}
