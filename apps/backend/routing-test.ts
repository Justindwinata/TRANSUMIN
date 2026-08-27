import { PrismaClient } from '@prisma/client';
import { TransitGraph } from './src/modules/transit/ingestion/graph/transit.graph';
import { normalizeTransfer } from './src/modules/transit/ingestion/normalizers/gtfs.normalizer';

const prisma = new PrismaClient();

interface JourneyResult {
  from: string;
  to: string;
  duration: number;
  path: string[];
  transfers: number;
}

async function findPath(graph: TransitGraph, from: string, to: string, maxTime: number = 7200): Promise<JourneyResult | null> {
  // Dijkstra's algorithm
  const dist = new Map<string, number>();
  const prev = new Map<string, {node: string; edge: any}>();
  const visited = new Set<string>();
  const queue = new Map<string, number>();
  
  dist.set(from, 0);
  queue.set(from, 0);
  
  while (queue.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const [node, d] of queue) {
      if (d < minDist) {
        minDist = d;
        current = node;
      }
    }
    if (!current || minDist > maxTime) break;
    
    queue.delete(current);
    if (visited.has(current)) continue;
    visited.add(current);
    
    if (current === to) break;
    
    const edges = graph.edges.get(current);
    if (!edges) continue;
    
    for (const edge of edges) {
      const weight = edge.weightSeconds ?? 120; // default 2 min per ride edge
      const alt = minDist + weight;
      const existing = dist.get(edge.to) ?? Infinity;
      if (alt < existing) {
        dist.set(edge.to, alt);
        prev.set(edge.to, { node: current, edge });
        queue.set(edge.to, alt);
      }
    }
  }
  
  if (!dist.has(to)) return null;
  
  // Reconstruct path
  const path: string[] = [];
  let curr = to;
  while (curr !== from) {
    path.unshift(curr);
    const p = prev.get(curr);
    if (!p) break;
    curr = p.node;
  }
  path.unshift(from);
  
  return {
    from,
    to,
    duration: dist.get(to)!,
    path,
    transfers: path.filter((n, i) => {
      if (i === 0) return false;
      const edge = graph.edges.get(path[i-1])?.find(e => e.to === n);
      return edge?.edgeType === 'transfer';
    }).length,
  };
}

async function main() {
  const graph = new TransitGraph();
  
  const stops = await prisma.stop.findMany({ take: 50 });
  console.log(`Testing with ${stops.length} stops`);
  
  for (const stop of stops) {
    graph.addNode({
      id: stop.id,
      type: 'stop',
      lat: stop.lat,
      lon: stop.lon,
      name: stop.name,
    });
  }
  
  const stopTimes = await prisma.stopTime.findMany({
    include: { trip: true }
  });
  
  const tripStopTimes = new Map<string, Array<any>>();
  for (const st of stopTimes) {
    if (!tripStopTimes.has(st.tripId)) tripStopTimes.set(st.tripId, []);
    tripStopTimes.get(st.tripId)!.push({
      tripId: st.tripId,
      serviceId: st.trip.serviceId,
      stopId: st.stopId,
      arrivalTime: st.arrivalTime,
      departureTime: st.departureTime,
      stopSequence: st.stopSequence,
    });
  }
  
  for (const [tripId, times] of tripStopTimes) {
    times.sort((a, b) => a.stopSequence - b.stopSequence);
    for (let i = 0; i < times.length - 1; i++) {
      graph.addEdge({
        from: times[i].stopId,
        to: times[i + 1].stopId,
        edgeType: 'ride',
        tripId: tripId,
        serviceId: times[0].serviceId,
      });
    }
  }
  
  const transfers = await prisma.transfer.findMany();
  for (const t of transfers) {
    graph.addEdge({
      from: t.fromStopId,
      to: t.toStopId,
      edgeType: 'transfer',
      weightSeconds: t.minTransferTime ?? 300,
    });
  }
  
  // Test journeys - pick some random stops
  const testStops = stops.slice(0, 20);
  console.log('\n=== ROUTING TESTS ===');
  
  for (let i = 0; i < testStops.length; i++) {
    for (let j = i + 1; j < testStops.length; j++) {
      const result = await findPath(graph, testStops[i].id, testStops[j].id);
      if (result) {
        console.log(`${testStops[i].name} -> ${testStops[j].name}: ${Math.round(result.duration/60)}min, ${result.transfers} transfers, ${result.path.length} stops`);
      }
    }
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
