//draw Sankey diagram
function drawSankey(data) {
    
    var w = 1200;
    var h = 800;
    // color scale
    var color = d3.scaleOrdinal(["#F0E442", "#56B4E9",  "#CC79A7",  "#009E73", "#E69F00", "#0072B2", "#D55E00", "#000000" ]);
    var svg = d3
      .select("#sankey")
      .append("svg")
      .attr("width", w)
      .attr("height", h);
    
    
    //zoom function
    //   var g = svg.append('g')
    //   .attr("transform", `translate(0,${20})`);
    //   var zoom = d3.zoom()
    //   .scaleExtent([1, 10])
    //   .on('zoom', (event) => {
    //       g.attr('transform', event.transform);
    //   })
    //   .extent([[0, 0], [w, h]]) 
    //   .translateExtent([[0, 0], [w, h]]) ;          
    // svg.call(zoom);
    // svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    // create a Sankey layout
    var sankey = d3.sankey()
                  .nodeWidth(50)
                  .nodePadding(20)
                  .size([w, h]);
    //read data from json file
    graph = sankey(data);
    var defs = svg.append("defs");
    var link = svg
  .append("g")
  .attr("class", "links")
  .selectAll(".link")
  .data(graph.links)
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("id", function(d, i) { return "link" + i; }) // add unique id to each link
  .attr("source_id", function(d) { return "node" + d.source.index; }) // add source node id
  .attr("target_id", function(d) { return "node" + d.target.index; }) // add target node id
  .attr("d", d3.sankeyLinkHorizontal())
  .style("stroke", function(d, i) {
    // create gradient
    var gradient = defs.append("linearGradient")
      .attr("id", "gradient" + i)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d.source.x1)
      .attr("x2", d.target.x0);
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color(d.source.name.replace(/ .*/, "")));
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color(d.target.name.replace(/ .*/, "")));
    return "url(#gradient" + i + ")";
  })
  .attr("stroke-width", function(d) {
    return d.width;
  })
  .style("fill", "none")
  .style("stroke-opacity", ".5")
  .on("mouseover", function() {
    d3.select(this)
      .style("stroke-opacity", "1");
    
    // highlight the nodes connected by this link
    const source_id = d3.select(this).attr("source_id");
    const target_id = d3.select(this).attr("target_id");
    d3.select("#"+source_id).select("rect").style("opacity", 1);
    d3.select("#"+target_id).select("rect").style("opacity", 1);
  
    // fade all other nodes
    node.filter((d, i) => ("node" + i) !== source_id && ("node" + i) !== target_id)
        .select("rect")
        .style("opacity", 0.1);
    
    // fade all other links
    link.filter((d, i) => "link" + i !== this.id)
        .style("stroke-opacity", "0.1");
  })
  .on("mouseout", function() {
    d3.select(this)
      .style("stroke-opacity", ".5");
    
    // reset opacity for all nodes and links when mouse leaves
    node.select("rect").style("opacity", 0.9);
    link.style("stroke-opacity", 0.5);
  });
    
    // add the description to the links 
    link.append("title").text(function(d) {
      return "Source: " + d.source.name + " ➡️ Destination: " + d.target.name + "\nAmount of People: " + formatValue(d.value) + " (" + unit + ")";
    });
    
    //drag function for nodes
    var node = svg
  .append("g")
  .selectAll(".node")
  .data(graph.nodes)
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("id", function(d, i) { return "node" + i; }) // Add unique ID to each node
  .call(
    d3
      .drag()
      .subject(function(d) { return d; })
      .on("start", function() { this.parentNode.appendChild(this); }) // move node to the front
      .on("drag", dragmove)
  );
    //add nodes(state)
    node  
      .append("rect")
      .attr("x", function(d) {
        return d.x0;
      })
      .attr("y", function(d) {
        return d.y0;
      })
      .attr("height", function(d) {
        d.height = d.y1 - d.y0;
        return d.y1 - d.y0;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        return (d.color = color(d.name.replace(/ .*/, "")));
      })
      .attr("stroke", "transparent")
      .style("opacity", .9)
      .style("cursor", "move")
      .style("shape-rendering", "crispEdges")
      .append("title")
      .text(function(d) {
        return d.name + "\nTotal: " + formatValue(d.value) + " (" + unit + ")" ;
      });
      // add labels to the nodes (flows values)
    node
      .append("text")
      .attr("x", function(d) {
        return d.x0 - 6;
      })
      .attr("y", function(d) {
        return (d.y1 + d.y0) / 2;
      })
      .attr("dy", "0.5em")
      .attr("text-anchor", "end")
      .text(function(d) {
        return d.name;
      })
      .filter(function(d) {
        return d.x0 < w / 2;
      })
      .attr("x", function(d) {
        return d.x1 + 6;
      })
      .attr("text-anchor", "start");

      node
  .on("mouseover", function() {
    d3.select(this).select("rect").style("opacity", 1); // highlight the hovered node

    // fade all other nodes
    node.filter((d, i) => "node" + i !== this.id)
      .select("rect")
      .style("opacity", 0.1);
    
    // highlight all links connected to the hovered node
    link.filter((d, i) => d3.select("#link" + i).attr("source_id") === this.id || d3.select("#link" + i).attr("target_id") === this.id)
      .style("opacity", 1);
    
    // fade all other links
    link.filter((d, i) => d3.select("#link" + i).attr("source_id") !== this.id && d3.select("#link" + i).attr("target_id") !== this.id)
      .style("opacity", 0.1);
      // highlight all nodes connected to the hovered node (both source and target)
    node.filter((d, i) => {
        var isConnected = false;
        link.each(function(dl, di) {
          if ((d3.select("#link" + di).attr("source_id") === this.id && d3.select("#link" + di).attr("target_id") === "node" + i) ||
            (d3.select("#link" + di).attr("source_id") === "node" + i && d3.select("#link" + di).attr("target_id") === this.id)) {
            isConnected = true;
          }
        }.bind(this));
        return isConnected;
      })
      .select("rect")
      .style("opacity", 1);
  })
  .on("mouseout", function() {
    // reset opacity for all nodes and links when mouse leaves
    node.select("rect").style("opacity", 0.9);
    link.style("opacity", 1);
  });
     // drag move function to update node and link positions when dragging 
    function dragmove(d) {
      d3.select(this)  
        .select("rect")    // update the node position
        .attr("y", function(n) {
          n.y0 = Math.max(0, Math.min(n.y0 + d.dy, h - (n.y1 - n.y0)));
          n.y1 = n.y0 + n.height;
          return n.y0;
        });
    
      d3.select(this)
        .select("text")   // update the label position
        .attr("y", function(n) {
          return (n.y0 + n.y1) / 2;
        });
    
      sankey.update(graph); // update the layout
      link.attr("d", d3.sankeyLinkHorizontal()); // update the link positions
    };
}

async function loadDataAndCreateSankey() {
  try
  {
    var data = await d3.json("https://boaizz.github.io/Migration-Visualization/json/sankey.json");  //load data from JSON file
    drawSankey(data);
  } catch (error) {
    console.error("Error loading data", error);
  }
};
  
window.onload = loadDataAndCreateSankey;