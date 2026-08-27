import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { TransitGraph } from '../src/modules/transit/ingestion/graph/transit.graph';

describe('Real TransJakarta Routing Regression', () => {
  let prisma: PrismaClient;
  let graph: TransitGraph;

  beforeAll(async () => {
    prisma = new PrismaClient();
    graph = new TransitGraph();

    const stops = await prisma.stop.findMany();
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

    const tripStopTimes = new Map<string, any[]>();
    for (const st of stopTimes) {
      if (!tripStopTimes.has(st.tripId)) tripStopTimes.set(st.tripId, []);
      tripStopTimes.get(st.tripId)!.push({
        tripId: st.tripId,
        serviceId: st.trip.serviceId,
        stopId: st.stopId,
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have ingested real data', async () => {
    const stopCount = await prisma.stop.count();
    expect(stopCount).toBeGreaterThan(0);

    const routeCount = await prisma.route.count();
    expect(routeCount).toBeGreaterThan(0);

    const tripCount = await prisma.trip.count();
    expect(tripCount).toBeGreaterThan(0);
  });

  it('should build graph with real stops', () => {
    expect(graph.nodes.size).toBeGreaterThan(0);
  });

  it('should have ride edges from real trips', () => {
    const totalEdges = Array.from(graph.edges.values()).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalEdges).toBeGreaterThan(0);
  });

  it('should have connected graph', () => {
    let connectedNodes = 0;
    for (const [nodeId, edges] of graph.edges) {
      if (edges.length > 0) connectedNodes++;
    }
    expect(connectedNodes).toBeGreaterThan(0);
  });
});
