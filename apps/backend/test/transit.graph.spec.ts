import { TransitGraph, GraphNode } from '../src/modules/transit/ingestion/graph/transit.graph';
import {
  NormalizedStop,
  NormalizedStopTime,
  NormalizedTransfer,
} from '../src/modules/transit/ingestion/normalizers/gtfs.normalizer';

describe('TransitGraph', () => {
  let graph: TransitGraph;

  beforeEach(() => {
    graph = new TransitGraph();
  });

  it('should add nodes and initialize edge lists', () => {
    const node: GraphNode = {
      id: 'stop-1',
      type: 'stop',
      lat: -6.2,
      lon: 106.8,
      name: 'Test Stop',
    };
    graph.addNode(node);
    expect(graph.nodes.get('stop-1')).toEqual(node);
    expect(graph.edges.get('stop-1')).toEqual([]);
  });

  it('should build ride edges from stop times in sequence order', () => {
    const times: NormalizedStopTime[] = [
      { tripId: 'trip-1', stopId: 's1', arrivalTime: '06:00:00', departureTime: '06:00:00', stopSequence: 1 },
      { tripId: 'trip-1', stopId: 's2', arrivalTime: '06:03:00', departureTime: '06:03:00', stopSequence: 2 },
      { tripId: 'trip-1', stopId: 's3', arrivalTime: '06:06:00', departureTime: '06:06:00', stopSequence: 3 },
    ];
    const edges = graph.fromStopTimes(times, 'trip-1', 'svc-daily');
    expect(edges).toHaveLength(2);
    expect(edges[0].edgeType).toBe('ride');
    expect(edges[0].stopSequence).toBe(1);
    expect(edges[1].nextStopSequence).toBe(3);
    expect(edges[0].tripId).toBe('trip-1');
  });

  it('should build transfer edges from normalized transfers', () => {
    const transfers: NormalizedTransfer[] = [
      {
        id: 't1',
        fromStopId: 's1',
        toStopId: 's2',
        transferType: 0,
        minTransferTime: 120,
        sourceDatasetId: 'ds-1',
      },
    ];
    const edges = graph.fromTransfers(transfers);
    expect(edges).toHaveLength(1);
    expect(edges[0].edgeType).toBe('transfer');
    expect(edges[0].weightSeconds).toBe(120);
  });

  it('should not duplicate identical edges', () => {
    graph.addEdge({ from: 's1', to: 's2', edgeType: 'transfer' });
    graph.addEdge({ from: 's1', to: 's2', edgeType: 'transfer' });
    expect(graph.edges.get('s1')).toHaveLength(1);
  });

  it('should allow multiple distinct edges', () => {
    graph.addEdge({ from: 's1', to: 's2', edgeType: 'ride', tripId: 'trip-1' });
    graph.addEdge({ from: 's1', to: 's2', edgeType: 'ride', tripId: 'trip-2' });
    expect(graph.edges.get('s1')).toHaveLength(2);
  });
});
