import { PrismaClient } from '@prisma/client';
import { TransitGraph } from './src/modules/transit/ingestion/graph/transit.graph';
import { normalizeTransfer } from './src/modules/transit/ingestion/normalizers/gtfs.normalizer';

const prisma = new PrismaClient();

async function main() {
  const graph = new TransitGraph();
  
  console.log('Building graph from real TransJakarta data...');
  
  const stops = await prisma.stop.findMany();
  console.log(`Found ${stops.length} stops`);
  
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
  console.log(`Found ${stopTimes.length} stop_times`);
  
  const tripStopTimes = new Map<string, Array<{tripId: string; serviceId: string; stopId: string; arrivalTime: string; departureTime: string; stopSequence: number}>>();
  
  for (const st of stopTimes) {
    if (!tripStopTimes.has(st.tripId)) {
      tripStopTimes.set(st.tripId, []);
    }
    tripStopTimes.get(st.tripId)!.push({
      tripId: st.tripId,
      serviceId: st.trip.serviceId,
      stopId: st.stopId,
      arrivalTime: st.arrivalTime,
      departureTime: st.departureTime,
      stopSequence: st.stopSequence,
    });
  }
  
  let rideEdges = 0;
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
      rideEdges++;
    }
  }
  console.log(`Added ${rideEdges} ride edges`);
  
  const transfers = await prisma.transfer.findMany();
  console.log(`Found ${transfers.length} transfers`);
  
  let transferEdges = 0;
  for (const t of transfers) {
    graph.addEdge({
      from: t.fromStopId,
      to: t.toStopId,
      edgeType: 'transfer',
      weightSeconds: t.minTransferTime ?? undefined,
    });
    transferEdges++;
  }
  console.log(`Added ${transferEdges} transfer edges`);
  
  console.log('\n=== GRAPH STATISTICS ===');
  console.log(`Nodes: ${graph.nodes.size}`);
  console.log(`Total edges: ${Array.from(graph.edges.values()).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log(`Ride edges: ${rideEdges}`);
  console.log(`Transfer edges: ${transferEdges}`);
  
  let connectedNodes = 0;
  let isolatedNodes = 0;
  for (const [nodeId, edges] of graph.edges) {
    if (edges.length > 0) connectedNodes++;
    else isolatedNodes++;
  }
  console.log(`Connected nodes: ${connectedNodes}`);
  console.log(`Isolated nodes: ${isolatedNodes}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
