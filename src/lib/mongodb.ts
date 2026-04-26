import mongoose from 'mongoose';

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI орчны хувьсагч тодорхойлогдоогүй байна. Vercel Settings -> Environment Variables дээр нэмнэ үү.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // ── Serverless-friendly tuning ──
      // Small pool — each lambda only needs 1-2 connections
      maxPoolSize: 5,
      minPoolSize: 0,
      // Drop idle sockets quickly so warm lambdas don't hold dead connections
      maxIdleTimeMS: 10_000,
      // Fail fast instead of hanging if Atlas is slow / unreachable
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 20_000,
      // Faster initial handshake
      compressors: 'zlib',
      retryWrites: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB холбогдлоо!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
