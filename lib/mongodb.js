// lib/mongodb.js
//
// Conexión reutilizable a MongoDB para toda la aplicación (Auth Service,
// Project Service, y los que sigan). Sigue el patrón recomendado por Next.js
// para evitar abrir una conexión nueva en cada recarga en modo desarrollo
// (hot-reload), cacheando el cliente en una variable global.

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Falta la variable de entorno MONGODB_URI. Define la cadena de conexión de MongoDB en tu archivo .env.local."
  );
}

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usamos una variable global para que el valor
  // sobreviva al hot-reload de Next.js y no se abran múltiples conexiones.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, es mejor no usar una variable global.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
