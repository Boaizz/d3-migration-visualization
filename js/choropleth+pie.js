var selectedState = "Australia" //init the default state

//function to draw the choropleth for a give year
function drawChoropleth(year) {
  var w = 800, h = 800;
  // set the geographical projection for the map
  var svg = d3.select("#choropleth").append("svg").attr("height", h).attr("width", w);

 //zoom function
  var projection = d3.geoMercator().scale(800).center([140, -30]).translate([w/2, h/2]);   
  var path = d3.geoPath().projection(projection);
  var g = svg.append('g')
              .attr("transform", `translate(0,${20})`);
              var zoom = d3.zoom()
              .scaleExtent([1, 10])   // min and max zoom scale
              .on('zoom', (event) => {
                  g.attr('transform', event.transform);
              })
              .extent([[0, 0], [w, h]])  // visible area of the svg
              .translateExtent([[0, 0], [w, h]]) ;   // maximum area that can be panned       
  svg.call(zoom);
  svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
//read the data from the csv file to the choropleth
  d3.csv("./datasets/visa.csv").then((data) => {
    // define the color scale based on the data
    var color = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => { if (d.year == year && d.entity !== "Australia") return parseFloat(d.total); }), 
      d3.max(data, (d) => { if (d.year == year && d.entity !== "Australia") return parseFloat(d.total); })])
      .range(["#FFE6E6", "#FF0000"]);

    var ausTotalValue = 0;
//read the value into the state 
    d3.json("./json/australia.geojson").then((json) => {
      data.forEach(d => {
        if (d.year == year) // only look at data for the selected year
          for (var i = 0; i < json.features.length; i++) {
            var properties = json.features[i].properties;
            if (properties.name == d.entity) { properties.value = d.total; break; }
            else if (d.entity == "Australia") { ausTotalValue = d.total; break; }
          }
      });


      g.selectAll("path").data(json.features).enter().append("path").attr("d", path)
      .style("fill", (d) => { return (d.properties.value) ? color(d.properties.value) : "#CCCCCC"; })
      .classed("state", true)
      //mouse hover 
      .on("mouseover", function(event,d) {
        console.log(d);
        d3.selectAll(".state")
            .transition()
            .duration(200)
            .style("opacity", .1)//fade other states
            .style("stroke","black");//stroke color
    

        d3.select(this) //highlight this state
            .transition()
            .duration(200)
            .style("stroke","black")//stroke color
            .style("stroke-width",1)
            .style("opacity", 2) })  // highlight the state on mouseover
      .on("mouseout", function() { 
        d3.selectAll(".state")
        .transition()
        .duration(200)
        .style("stroke","white")//stroke color
        .style("stroke-width",0.5)
        .style("opacity", 0.9)//opacity 
      })  // remove highlight on mouseout
      .on("click", function (d, i) {
        
          stateUpdate(i.properties.name);
      })

      .append("title").text((d) => {
        if (d.properties.value) return "Total Arrival: " + formatValue(d.properties.value) + " ("+unit+")\nState: " + d.properties.name + "\nYear: " + year;
      });

      //text box of total value
      svg.append("text").attr("id", "totalValue").text("Total Arrival Into Australia: " + formatValue(ausTotalValue) + " ("+unit+")").attr("x", w - 400).attr("y", h - 10);

      // add the color scale legend
      svg.append("rect").attr("id", "colorScale").attr("x", 20).attr("y", h - 50).attr("width", 300).attr("height", 20);
      // add gradient to the legend
      var defs = g.append("defs"), linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
      linearGradient.selectAll(".stop").data(color.range()).enter().append("stop").attr("offset", (d, i) => i / (color.range().length - 1)).attr("stop-color", d => d);
   
      svg.select("#colorScale").style("fill", "url(#linear-gradient)").style("opacity", 0.9);
      // add labels to the legend
      svg.append("text").text("("+unit+")").attr("x", 310).attr("y", h - 55);
      svg.append("text").text(formatValue(Math.ceil(color.domain()[0]))).attr("x", 10).attr("y", h - 55).attr("id", "minValue");
      svg.append("text").text(formatValue(Math.ceil(color.domain()[1]))).attr("x", 250).attr("y", h - 55).attr("id", "maxValue");
 
    });
  });
}

//function to update the Choropleth when the year changes 
function ChoroplethUpdate() {
  document.getElementById("yearValue").innerText = document.getElementById("year").value;
  console.log(document.getElementById("year").value);
  updateChoropleth(document.getElementById("year").value);
  updatePieChartBasedOnTheYearValue(document.getElementById("year").value);
}

//function to redraw the choropleth by new year value
function updateChoropleth(newYear) {
  var w = 800, h = 800;

  var svg = d3.select("#choropleth").select("svg");
  // var g = svg.append('g')
  // .attr("transform", `translate(0,${20})`);
  // var zoom = d3.zoom()
  // .scaleExtent([1, 10])
  // .on('zoom', (event) => {
  //     g.attr('transform', event.transform);
  // })
  // .extent([[0, 0], [w, h]]) 
  // .translateExtent([[0, 0], [w, h]]) ;          
  // svg.call(zoom);
  // svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

  var projection = d3.geoMercator().scale(800).center([140, -30]).translate([w/2, h/2]);
  var path = d3.geoPath().projection(projection);

  d3.csv("./datasets/visa.csv").then((data) => {
 
    var color = d3.scaleLinear()
    .domain([
      d3.min(data, (d) => { if (d.year == newYear && d.entity !== "Australia") return parseFloat(d.total); }), 
      d3.max(data, (d) => { if (d.year == newYear && d.entity !== "Australia") return parseFloat(d.total); })])
    .range(["#FFE6E6","#FF0000"]);
       // initialize total value for Australia
    var ausTotalValue = 0;
    d3.json("./json/australia.geojson").then((json) => {
      data.forEach(d => {
        if (d.year == newYear)
          for (var i = 0; i < json.features.length; i++) {
            var properties = json.features[i].properties;
            if (properties.name == d.entity) { properties.value = d.total; break; }
            else if (d.entity == "Australia") { ausTotalValue = d.total; break; }
          }
      });

      //read the new value of each state 
      svg.selectAll("path").data(json.features).transition().duration(500).ease(d3.easeCubicInOut).attr("d", path) // transition the paths (states) with new color and title values
      .style("fill", (d) => { return (d.properties.value) ? color(d.properties.value) : "#CCCCCC"; })
      .select("title").text((d) => {
        if (d.properties.value) return "Total Arrival: " + formatValue(d.properties.value) + " ("+unit+")" + "\nState: " + d.properties.name + "\nYear: " + newYear;
      });

      // update the text displaying total arrival into Australia
      svg.select("#totalValue").text("Total Arrival Into Australia: " + formatValue(ausTotalValue) + " ("+unit+")");
       // update the minimum and maximum value text for color legend
      d3.select("#minValue").text(formatValue(Math.ceil(color.domain()[0])));
      d3.select("#maxValue").text(formatValue(Math.ceil(color.domain()[1])));
    });
  });
}


//function to update the selected state
function stateUpdate(state) { 
  if (selectedState == state) selectedState = "Australia";
  else selectedState = state;
  loadDataAndDrawPieChart(selectedState, document.getElementById("year").value);
}
///

//function to draw the pie chart 
async function drawPieChart(state, year, file, initFunc,  visaFunc) {
 
  d3.select("#pie").selectAll("svg").remove();
  var w = 600
  var h = 800

  var svg = d3.select("#pie").append("svg").attr("width", w).attr("height", h);
  //load data from the csv file                  
  try{                                                         
      var data = await d3.csv(`./datasets/${file}.csv`);
      var i = parseInt(year) - 2005;
      console.log(data);
      var pieData = data.filter((d) => d.state == state)[i];
      console.log(pieData);
      var dataset = initFunc(pieData); // initialize dataset
      console.log(dataset.length);
    } catch (error) {
        console.error("Error loading data", error);
    }
      var radius = 600;
      var outerRadius = radius / 3;
      var innerRadius = 0;
      var pieGenerator = d3.pie();
      var baseArcGenerator = d3.arc().outerRadius(1).innerRadius(0.5);
      var arcGenerator = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
      // color scale
      var color = d3.scaleOrdinal(d3.schemeCategory10);
      var arcs = svg.selectAll("arc")
        .data(pieGenerator(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", `translate(${w / 2},${h / 2})`);
        
      arcs.append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", (d, i) => baseArcGenerator(d, i))
        .attr("class", "pieArc")
        .append("title")
        .text((d, i) => `Visa Type: ${visaFunc(i)}\nNumber: ${formatValue(d.data)} (${unit})\nShare: ${(d.data / pieData.total * 100).toFixed(2)}%`);
  
      arcs.selectAll("path")
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("d", (d, i) => arcGenerator(d, i));
  
      // loop to add legend
      for (let index = 0; index < dataset.length; index++) {
        var x = 0;
        var y = 10 + index * 20;
  
        svg.append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", color(index))
          .style("opacity", "0");
  
        svg.append("text")
          .text(visaFunc(index))
          .attr("x", x + 20)
          .attr("y", y + 10)
          .style("opacity", "0");
      }
  
      svg.selectAll("rect")
        .transition()
        .duration(1000)
        .style("opacity", "1");
  
      svg.selectAll("text")
        .transition()
        .duration(1000)
        .style("opacity", "1");
  
}
//function to redraw the pie chart based on the  new year value
async function updatePieChart(newYear, file, initFunc, visaFunc)
{
    try {
        var data = await d3.csv(`./datasets/${file}.csv`);
        var state = selectedState == "Australia" ? "Australia" : selectedState;
        var i = parseInt(newYear) - 2005;
        var pieData = data.filter((d) => { {return d.state == state;}})[i];
        var dataset = initFunc(pieData); // initialize the dataset for the pie chart
        var radius = 600;
        var outerRadius = radius/3;
        var innerRadius = 0;
        var pieGenerator = d3.pie();
        var arcGenerator = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
        var piePathData = pieGenerator(dataset);
        var paths = document.getElementsByClassName("arc");     
        for (var index = 0; index < piePathData.length; index++) {  // iterate over each path and update the 'd' attribute and the tooltip
        var path = paths[index].firstChild;
        path.setAttribute("style", "transition: 500ms;");
        path.setAttribute("d", arcGenerator(piePathData[index], index)); // set the path 'd' attribute using the arc generator and the pie data
        path.innerHTML = "<title>Visa Type: "+ visaFunc(index) + "\nTotal Number: "+ formatValue(piePathData[index].data) + " ("+unit+")\nShare: " + (piePathData[index].data/pieData.total * 100).toFixed(2) + "%</title>" ; //set the description for the path
        }
    } catch (error) {
        console.error("Error loading data", error);
    }
}



//push the data of temporary visa to the dataset
function initDataset(data) {
  var dataset = [];
  dataset.push(data.vocationaleducation);
  dataset.push(data.highereducation);
  dataset.push(data.temporarywork);
  dataset.push(data.visitor);
  dataset.push(data.student);
  dataset.push(data.workingholiday);
  dataset.push(data.other);

  return dataset;
}
//push the data of pernament visa to the dataset
function initDataset1(data) {
  var dataset = [];
  dataset.push(data.family);
  dataset.push(data.skill);
  dataset.push(data.specialeligibility);
  dataset.push(data.newzealand);
  dataset.push(data.australian);
  dataset.push(data.other);

  return dataset;
}
//set ID for each permanent visa type
function perVisaName(index) {
  switch (index)
  {
    case 0: return "Family";
    case 1: return "Pernament Skill";
    case 2: return "Special Eligibility and humanitarian";
    case 3: return "New Zealand Citizen";
    case 4: return "Australia Citizen";
    case 5: return "Other pernament visas";

    default: break;
  }
}
//set ID for each temporary visa type
function tempVisaName(index) {
  switch (index)
  {
    case 0: return "Vocational Education and Training sector";
    case 1: return "Higher Education sector";
    case 2: return "Temporary Work(Skilled)";
    case 3: return "Visitor";
    case 4: return "Working Holiday";
    case 5: return "Student";
    case 6: return "Other temporary visas";
    default: break;
  }
}

//function for draw pie chart based on the selected visa type
function loadDataAndDrawPieChart(state, year) {
    const pieSelector = document.getElementById("pieSelector");
    var visaType =  pieSelector.value;
    //function to handle changes in state or selector value
    function handleChartUpdate() {
        visaType = pieSelector.value;
        console.log(visaType);
        redrawPieChart();
    }
    //event listener for selector value change
    pieSelector.addEventListener("change", handleChartUpdate);
    //function to redraw the pie chart based on selector value
    function redrawPieChart() {
        if (state === "Australia") {
            document.getElementById("pieChartTitle").innerHTML = "Group type of " + pieSelector.value + " visa in " + year + " in Australia";
        } else {
            document.getElementById("pieChartTitle").innerHTML = "Group type of " + pieSelector.value + " visa in " + year + " in " + state;
        }
        visaType === "temporary" ? drawPieChart(state, year, visaType, initDataset, tempVisaName) : drawPieChart(state, year, visaType, initDataset1, perVisaName);
    }
    //initial chart 
    redrawPieChart();
}

//function for update pie chart based on the selected visa type
function updatePieChartBasedOnTheYearValue(newYear){
    const pieSelector = document.getElementById("pieSelector");
    // var pieSelector = document.getElementById("pieSelector");
    var visaType =  pieSelector.value;
    function handleChartUpdate() {
        visaType = pieSelector.value;
        reUpdatePieChart();
    }
    pieSelector.addEventListener("change", handleChartUpdate);

    //function to update the pie chart based on selector value
    function reUpdatePieChart() {
        var state = selectedState == "Australia" ? "Australia" : selectedState;
        document.getElementById("pieChartTitle").innerHTML = " Group type of " + pieSelector.value + " visa in " + newYear + " in " + state;
        visaType === "temporary" ? updatePieChart(newYear, visaType, initDataset, tempVisaName) : updatePieChart(newYear, visaType, initDataset1, perVisaName);
        
    }
    reUpdatePieChart();
    //event listener for selector value change
    pieSelector.addEventListener("change", handleChartUpdate);
}



function drawFirstVisualization() {
  drawChoropleth("2005");  //init map
  loadDataAndDrawPieChart(selectedState,"2005"); //init pie chart
}
window.onload = drawFirstVisualization;