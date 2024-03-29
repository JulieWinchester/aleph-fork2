import { AlAngle, AlEdge, AlNode } from ".";
export interface AlGraph {
    nodes: Map<string, AlNode>;
    edges: Map<string, AlEdge>;
    angles: Map<string, AlAngle>;
}
