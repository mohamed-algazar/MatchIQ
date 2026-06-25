import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    x?: number;
    y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
    source: string;
    target: string;
    weight: number;
}

interface PassingNetworkProps {
    nodes: Node[];
    links: Link[];
    width?: number;
    height?: number;
}

const PassingNetwork: React.FC<PassingNetworkProps> = ({ nodes, links, width = 600, height = 400 }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const container = svgRef.current;
        const svg = d3.select(container);
        svg.selectAll("*").remove();

        const simulation = d3.forceSimulation<Node>(nodes)
            .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", "#94a3b8")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.weight) * 2);

        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(d3.drag<SVGGElement, Node>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended) as any);

        node.append("circle")
            .attr("r", 12)
            .attr("fill", "#22c55e")
            .attr("stroke", "#134e4a")
            .attr("stroke-width", 2);

        node.append("text")
            .text(d => d.name.split(' ')[1] || d.name)
            .attr("x", 16)
            .attr("y", 4)
            .attr("fill", "#f8fafc")
            .attr("font-size", "10px")
            .attr("font-weight", "bold");

        simulation.on("tick", () => {
            link
                .attr("x1", d => (d.source as any).x)
                .attr("y1", d => (d.source as any).y)
                .attr("x2", d => (d.target as any).x)
                .attr("y2", d => (d.target as any).y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fpy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [nodes, links, width, height]);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full"
        />
    );
};

export default PassingNetwork;
