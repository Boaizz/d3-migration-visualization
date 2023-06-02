//function to draw Bubble chart 
function drawBubbleChart(data, json) {
    var scaleX,
        scaleY;
    var forceSimulation;
    var regions = new Set(data.map(function(country) { return country.region_code; }));
    var color = d3.scaleOrdinal(["#F0E442", "#56B4E9",  "#CC79A7",  "#009E73", "#E69F00", "#0072B2", "#D55E00", "#000000" ])
          .domain(Array.from(regions));
    var w = 1200,
        h = 600;
    var padding = 40;
        // define the circleRadiusScale based on the initial radiusSelector
        var circleRadiusScale = d3.scaleSqrt() 
        .domain([d3.min(data, d => parseInt(d[radiusSelector.value])),
                 d3.max(data, d => parseInt(d[radiusSelector.value]))])
        .range([5, 40]);
        // update the circleRadiusScale when radiusSelector value changes
        radiusSelector.addEventListener("change", function() {
            circleRadiusScale.domain([d3.min(data, d => parseInt(d[radiusSelector.value])),
                                      d3.max(data, d => parseInt(d[radiusSelector.value]))]);
            groupingSelector.value === "all" ? forceSimulation.force("collide", d3.forceCollide(forceCollide)) : forceSimulation.force("collide", d3.forceCollide(0));
            // redraw the circles with the new radius
            g.selectAll("circle")
            .transition()
            .duration(500)
            .attr("r", function(d) { return circleRadiusScale(d[radiusSelector.value]); });
          });
            

    svg = d3.select("#bubble")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
        //color groups of continent
    var continentGroupScale = d3.scaleBand()
        .domain(Array.from(regions))
        .range([100, 700]);

    //zoom function        
    var g = svg.append('g')
        .attr("transform", `translate(0,${20})`);
    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        })
        .extent([[0, 0], [w, h]]) 
        .translateExtent([[0, 0], [w, h]]) ;          
    svg.call(zoom);
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    //resetZoom function

    resetZoomButton.addEventListener('click', function () {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

    //color legend for continents
    svg.append("g")  
    .attr("class", "continent-color")
    .attr("id", "continentColorScale") 
    .selectAll("g")
    .data(Array.from(regions))
    .enter()
    .append("g")
    .attr("class", "continent-color-element");
  //add rectangle representing colored region
    d3.selectAll("g.continent-color-element")
        .append("rect")
          .attr("width", 30)
          .attr("height", 30)
          .attr("x", function(d) { return continentGroupScale(d) + padding * 5; })
          .attr("fill", function(d) { return color(d); })
          .on("mouseover", function(event, d) {
            console.log(continentGroupScale(d));
            g.selectAll(".bubble").style("opacity", 0.1);
            g.selectAll('.bubble[data-region="' + d + '"]').style("opacity", 1);   // highlight the bubble that is in that continent
        })
        .on("mouseout", function(d) {
            g.selectAll(".bubble").style("opacity", 1);
        })
    ;
  //add text to represent the name group of the continent
    d3.selectAll("g.continent-color-element")
          .append("text")
          .attr("text-anchor", "middle")
          .attr("x", function(d) { return continentGroupScale(d) + padding * 5 + 85; })
          .attr("y", 20)
          .text(function(d) { return json[d]; });
        
    colorsDisplay.addEventListener("change", function() {
            d3.select("#continentColorScale").style("display", "block");  // show the color scale of the continent when selecting the colors
    });
        
    flagsDisplay.addEventListener("change", function() {
            d3.select("#continentColorScale").style("display", "none"); // hide the color scale of the continent when selecting the flags
    });
      
    d3.select(".continent-color").transition()
        .duration(500)
        .attr("transform", "translate(0, 10)");
 
    //draw bubbles

    var circles = 
    g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", function(d) { 
                return  circleRadiusScale(d[radiusSelector.value]); })
                .classed("bubble", true)
            .attr("data-region", function(d) { return d.region_code; })    
            //mouseover
            .on("mouseover", function(event,d) {
                console.log(d);
                d3.selectAll(".bubble")
                    .transition()
                    .duration(200)
                    .style("opacity", .1)//fade other bubble
                    .style("stroke","#000000");//stroke color
            
        
                d3.select(this) //highlight this bubble
                    .transition()
                    .duration(200)
                    .style("stroke","#000000")//stroke color
                    .style("stroke-width",1)
                    .style("opacity", 2) })  // highlight the bubble on mouseover
              .on("mouseout", function() { 
                d3.selectAll(".bubble")
                .transition()
                .duration(200)
                .style("stroke","white")//stroke color
                .style("stroke-width",0.5)
                .style("opacity", 0.9)//opacity 
              })  // remove highlight on mouseout
        
            //add description to bubbles when hovered on it
    circles.append("title").text((d) => {
            if (d) return "Country Name: " + d.entity + "\nPopulation: " + formatValue(d.Population) + " ("+unit+")\nImmigrants: " + formatValue(d.Immigrants) + " ("+unit+")\nArea: " + formatValue(d.Area) + " km2";
    });;
            
    changeToFlag();
    var legendData = [10000000, 100000000, 250000000, 500000000]; // specify the area values for the legend circles

    var legendGroup = svg.append("g")
    .attr("class", "area-legend")
    .attr("transform", "translate(20, 20)"); // adjust the positioning of the legend group

  legendData.forEach((value, i) => {
    var radius = circleRadiusScale(value);
    legendGroup.append("circle")
      .attr("cx", 900)
      .attr("cy", radius)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("opacity", 0.7);
    legendGroup.append("text")
      .attr("x", 1000)
      .attr("y", radius )
      .text(value + " ("+ unit + ")")
      .style("font-size", "12px");
    legendGroup.append("line")
    .attr('x1', 900 + radius )
    .attr('x2', 1000)
    .attr('y1', radius )
    .attr('y2', radius )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))


  });

    function removeLinesAndTexts() {
        //get all lines and texts
        const lines = document.querySelectorAll("line");
        const texts = document.querySelectorAll("text");
    
        //iterate through each and remove them
        lines.forEach((line) => {
            if (line.id.includes('xLine') || line.id.includes('yLine')) {
                line.remove();
            }
        });
        texts.forEach((text) => {
            if (text.id.includes('xText') || text.id.includes('yText')) {
                text.remove();
            }
        });
    }

   
   //remove lines and text when clicking the Reset button
    document.getElementById("removeLinesButton").addEventListener("click", removeLinesAndTexts);  
    var speed = 0.03;  //force speed
        
    var displays = {
        all: allBubbles(), //configuration for positioning bubbles in the center
        visual:visualImmigrants() //configuration for positioning bubbles based on Immigrants and Population
    };
    
    
    function allBubbles() {
        return { //returns the force configuration for positioning bubbles in the center
            x: d3.forceX(w / 2).strength(speed),
            y: d3.forceY(h / 2).strength(speed)
        };
    }
        
    function visualImmigrants() {
        var margin = 80;
        
        scaleX = d3.scaleLinear()
            .domain([
            0,
            d3.max(data, (d) => { return parseInt(d.Immigrants);})]
            )
            .range([margin, w - margin*2]);
        scaleY = d3.scaleLinear()
            .domain([
                0,
                d3.max(data, (d) => { return parseInt(d.Population);})]
            )
            .range([h - margin, margin*2]);
        
            return {
                x: d3.forceX(function(d) {
                    return scaleX(d.Immigrants);
                }).strength(speed),
                y: d3.forceY(function(d) {
                    return scaleY(d.Population);
                }).strength(speed)
            };
        }

        //using force simulation with the initial settings
    forceSimulation = d3.forceSimulation()
        .force("x", displays.all.x)
        .force("y", displays.all.y)
        .force("collide", d3.forceCollide(forceCollide)); // adds a collision force to the simulation, ensuring that the nodes do not overlap
    forceSimulation.nodes(data)
        .on("tick", function() {  //sets up an event listener for the "tick" event
            circles 
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
            });
    var defs = g.append("defs");  //definitions for patterns flags
    defs.selectAll(".flag")
        .data(data)
        .enter()
        .append("pattern")
        .attr("id", function(d) { return d.country_code; })
        .attr("class", "flag")
        .attr("width", "100%")
        .attr("height", "1px")
        .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("width", 1)
            .attr("height", 1)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("href", function(d) {
                return "flags/" + d.country_code + ".svg";
                });
    d3.selectAll('input[name="fill"]')
        .on("change", function() {
        changeToFlag();
        });
    addGroupingListeners();
    
    //check if the radio flag button is selected or not
    function flagSelected() {
        return d3.select("#flags").property("checked");
    }
    // Changes the bubble fill to either flag or color
    function changeToFlag() {
        circles
            .attr("fill", function(d) {
            return flagSelected() ? "url(#" + d.country_code + ")" : color(d.region_code);
            });
    }
        
    function forceCollide(d) {   //set collision force based on the radius scale
        return circleRadiusScale(d[radiusSelector.value]);
    }
    
    
    function addGroupingListeners() {
        
        //event listener for the grouping selector change event
        groupingSelector.addEventListener("change", function() {
          var selectedValue = groupingSelector.value;
          console.log(selectedValue);
          d3.select(".x-axis").remove();
          d3.select(".y-axis").remove();
    
          if (selectedValue === "all") {
            forceSimulation //set the force simulation to position bubbles in the center
              .force("x", displays.all.x)
              .force("y", displays.all.y)
              .force("collide", d3.forceCollide(forceCollide))
              removeLinesAndTexts()
          
          } else if (selectedValue === "visual") {
                //adding Axis only if user choosing Visual
            circles.attr("transform", "translate("+ padding +"," +padding +")");
            circles.on("click", function(event, d) {
                // get the index of the selected element
                const i = data.indexOf(d);
        
                // only execute if visualImmigrants is selected
                if (groupingSelector.value === "visual") {
                    // g.attr("transform", "translate("+ padding  +",0)");
                    // draw line to X-axis
                    g.append("line")
                        .attr("x1", scaleX(d.Immigrants) + padding )
                        .attr("y1", scaleY(d.Population) + padding)
                        .attr("x2", scaleX(d.Immigrants) + padding )
                        .attr("y2", h - padding )
                        .attr("stroke", "black")
                        .attr("stroke-width", "0.5").style("stroke-dasharray", "5,5")
                        .attr("id", "xLine" + i);  //unique id to remove later
            
                    //draw line to Y-axis
                    g.append("line")
                        .attr("x1", scaleX(d.Immigrants) + padding )
                        .attr("y1", scaleY(d.Population) + padding)
                        .attr("x2", padding * 3 )
                        .attr("y2", scaleY(d.Population) + padding )
                        .attr("stroke", "black")
                        .attr("stroke-width", "0.5").style("stroke-dasharray", "5,5")
                        .attr("id", "yLine" + i);  //unique id to remove later
            
                    //label for X-axis
                    g.append("text")
                        .attr("x", scaleX(d.Immigrants) )
                        .attr("y", h)
                        .text(formatValue(d.Immigrants))
                        .attr("id", "xText" + i);  //unique id to remove later
            
                    //label for Y-axis
                    g.append("text")
                        .attr("x", 0)
                        .attr("y", scaleY(d.Population) + padding)
                        .text(formatValue(d.Population))
                        .attr("id", "yText" + i);  //unique id to remove later

                    forceSimulation.force("collide", d3.forceCollide(0)).alphaTarget(1)
                    .restart();;

                }
            });
            var numberOfTicks = 10
            var xAxis = d3.axisBottom(scaleX)  //xAxis
            .ticks(numberOfTicks)
            .tickSizeOuter(0) // remove end ticks
            .tickFormat(d3.format("~s")); // simplify tick labels
                    
            var yAxis = d3.axisLeft(scaleY)  //yAxis
            .ticks(numberOfTicks)
            .tickSizeOuter(0) // remove end ticks
            .tickFormat(d3.format("~s")); // simplify tick labels    
            g.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate("+ (padding) +"," + (h - padding) + ")")
            .call(xAxis)
            .selectAll(".tick text")
            .attr("font-size", "10px")
            .attr("font-weight", "normal");

            g.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + (padding * 3) + ","+ (padding) +")")
            .call(yAxis)
            .selectAll(".tick text")
            .attr("font-size", "10px")
            .attr("font-weight", "normal");

            g.append("text")            // add label to x axis
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", w / 2)
            .attr("y", h)
            .text("Immigrants (person)")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

            g.append("text")    //add label to y axis
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -120)
            .attr("y", padding * 2  )
            .text("Population (person)")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

            d3.selectAll(".domain, .tick line") // Select domain and tick lines together
            .attr("stroke", "#ddd") // Light color for unobtrusive lines
            .attr("stroke-width", 1); // Thin lines
              //set the force simulation to position bubbles based on Immigrants and Population 
            forceSimulation
              .force("x", displays.visual.x)
              .force("y", displays.visual.y)
              .force("collide", d3.forceCollide(0));
          }
          forceSimulation
          .alphaTarget(1)
          .restart();
          
        });
      }
    
}
async function loadDataAndDrawBubbleChart() {
    try {
        var data = await d3.csv("./datasets/countries.csv");  //load countries data from CSV file
        var json = await d3.json("./json/continent.json");    //load continents data from JSON file
        drawBubbleChart(data, json);      
        } catch (error) {
        console.error("Error loading data", error);
        }
}


  
window.onload = loadDataAndDrawBubbleChart;