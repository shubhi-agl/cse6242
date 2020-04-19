var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var ustopo;

svg.append("text")
    .attr('transform', 'translate(20,35)')
    .text("Year");

var slider = d3.sliderHorizontal()
                .min(2010)
                .max(2015)
                .width(300)
                .tickFormat(function(d,i){return ""+d})
                .ticks(6)
                .step(1)
                .displayValue(true)
                .on('onchange', val => {
                  remove();
                  update(ustopo, val);
                });

svg.append('g')
    .attr('transform', 'translate(70,30)')
    .call(slider);

var color_scheme = d3.schemeBlues[9];
var unemployment = d3.map();
var regions = d3.map();
var projection = d3.geoAlbersUsa().scale(900).translate([400, 300]);
var path = d3.geoPath().projection(projection);

var promises = [
  d3.json("states-10m.json"),
  d3.dsv(",","state-earthquakes.csv").then( function(d) {dataset=d;  d3.map(dataset, function(d){regions.set(d.States, d.Region);});})
]

Promise.all(promises).then(ready)
function ready([us]) {
    ustopo = us;
    year = 2010;
    update(us, year)
}
tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return "State: "+d.properties.name+"<br/>Region: "+regions.get(d.properties.name)+ "<br/>Year: "+d.year+"<br/>Earthquakes: "+d.freq; });
svg.call(tip);
function update(us, year) {
    d3.map(dataset, function(d){unemployment.set(d.States, +d[''+year]);});
    var color = d3.scaleLog()
        .domain([1, d3.max(unemployment.values())])
        .range([0,8]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.append("text")
        .attr("x", width-80)
        .attr("y", 45)
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Earthquake Frequency");

    g.append("text")
        .attr("x", width-20)
        .attr("y", height-100)
        .style("text-anchor", "end")
        .attr("font-size", "13px")
        .text("sagarwal378");

    g.selectAll("rect")
      .data(d3.range(0,9))
      .enter().append("rect")
        .attr("height", 15)
        .attr("x", width-80)
        .attr("y", function(d){return 50 + d*25;})
        .attr("width", 15)
        .attr("fill", function(d) { return color_scheme[d]; });

    g.selectAll("labels")
      .data(d3.range(0,9))
      .enter().append("text")
        .attr("class", "caption")
        .attr("x", width-60)
        .attr("y", function(d){return 62 + d*25;})
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .text(function(d){ return Math.round(color.invert(d))});

  svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
      .attr("fill", function(d) { d.year = year;
                                  if ((d['freq'] = unemployment.get(d.properties.name))==0)
                                        {return d3.schemeBlues[9][0];}
                                  return d3.schemeBlues[9][Math.ceil(color(d['freq'] = unemployment.get(d.properties.name)))]; })
      .attr("d", path)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

}

function remove(){
    d3.selectAll(".key").remove();
    d3.selectAll(".states").remove();
}
