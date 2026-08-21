import {
  NormalizedStop,
  NormalizedStopTime,
  NormalizedTransfer,
  NormalizedCalendar,
} from '../normalizers/gtfs.normalizer';

export interface GraphNode {
  id: string;
  type: 'stop' | 'station';
  lat: number;
  lon: number;
  name: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  edgeType: 'ride' | 'transfer' | 'walk';
  weightSeconds?: number;
  tripId?: string;
  serviceId?: string;
}

export interface TransitGraphEdge extends GraphEdge {
  arrivalTime?: string;
  departureTime?: string;
  stopSequence: number;
  nextStopSequence: number;
}

export class TransitGraph {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge[]> = new Map();

  addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) this.edges.set(node.id, []);
  }

  addEdge(edge: GraphEdge) {
    const key = `e:${edge.from}:${edge.to}:${edge.edgeType}:${edge.tripId ?? '*'}`;
    if (!this.edges.has(edge.from)) this.edges.set(edge.from, []);
    const existing = this.edges.get(edge.from)!;
    if (!existing.some(e => e.to === edge.to && e.edgeType === edge.edgeType && (e.tripId ?? '*') === (edge.tripId ?? '*'))) {
      existing.push(edge);
    }
  }

  fromStopTimes(times: NormalizedStopTime[], tripId: string, serviceId: string): TransitGraphEdge[] {
    const edges: TransitGraphEdge[] = [];
    for (let i = 0; i < times.length - 1; i++) {
      edges.push({
        from: times[i].stopId,
        to: times[i + 1].stopId,
        edgeType: 'ride',
        tripId,
        serviceId,
        arrivalTime: times[i].arrivalTime,
        departureTime: times[i].departureTime,
        stopSequence: times[i].stopSequence,
        nextStopSequence: times[i + 1].stopSequence,
      });
    }
    return edges;
  }

  fromTransfers(transfers: NormalizedTransfer[]): GraphEdge[] {
    return transfers.map(t => ({
      from: t.fromStopId,
      to: t.toStopId,
      edgeType: 'transfer',
      weightSeconds: t.minTransferTime,
      tripId: undefined,
      serviceId: undefined,
    }));
  }
}
