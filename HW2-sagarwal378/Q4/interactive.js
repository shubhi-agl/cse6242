var margin = {top: 50, right: 75, bottom: 75, left: 75}
  , width = 800 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

function convert_row(d){
    obj = {year: new Date(+d.year, 0, 1), state: d.state, region:d.region, count: +d.count};
    return obj;
}

d3.dsv(",", "state-year-earthquakes.csv", convert_row)
    .then(function(data){
        raw_data = data;

        regional_data = d3.nest()
            .key(function(d) { return d.year; })
            .key(function(d) { return d.region; })
            .entries(raw_data);

        var nested_data = d3.nest()
            .key(function(d) { return d.year; })
            .key(function(d) { return d.region; })
            .rollup(function(leaves) { return {"length": leaves.length, "total_count": d3.sum(leaves, function(d) {return d.count;})} })
            .entries(raw_data);

        var agg_data = [];
        var years = nested_data.map(function(d) { return new Date(d.key); });
        cols = nested_data[0].values.map(function(d) { return d.key; });
        for (year in years){
            var data_obj = {}
            data_obj.year = years[year]
            region_counts = nested_data[year].values;
            for (r in region_counts){
                reg = region_counts[r].key;
                count = region_counts[r].value["total_count"]
                data_obj[reg] = count;
            }
            agg_data.push(data_obj);
        }
        dataset = agg_data;
        add_line_chart();
     });

var xScale = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

var color_scheme = {'West': 'purple', 'South': 'green', 'Northeast': 'red', 'Midwest': 'steelblue'}

function add_line_chart(){
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale.domain(d3.extent(dataset, function(d) {return d.year; }));
    yScale.domain([0, d3.max(dataset, function(d) { return d["West"]; })*1.2]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickValues(dataset.map(function(d){return d.year;})).tickFormat(d3.timeFormat("%Y")));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    var lines = []
    for (col in cols){
            lines[col] = d3.line()
                .x(function(d, i) { return xScale(d.year); })
                .y(function(d) { return yScale(d[cols[col]]); });

            svg.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("stroke", color_scheme[cols[col]])
                .attr("d", lines[col])
                .attr("data-legend", cols[col]);

            svg.selectAll(".dot"+col)
                .data(dataset)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) {return xScale(d.year);})
                .attr("cy", function(d) {return yScale(d[cols[col]]);})
                .attr("r", 4)
                .attr("fill", color_scheme[cols[col]])
                .attr("id", cols[col])
                .on('mouseover', function(d){d3.select(this).attr('r', 8); onMouseOver(this, d.year, this.id)})
                .on('mouseout', function(d){d3.select(this).attr('r', 4); onMouseOut()});
        }
    var size = 15
    svg.selectAll("mydots")
      .data(cols)
      .enter()
      .append("circle")
        .attr("cx", width-160)
        .attr("cy", function(d,i){ return i*(size+5)})
        .attr("r", 5)
        //.attr("height", size-5)
        .style("fill", function(d){ return color_scheme[d]})

    svg.selectAll("mylabels")
      .data(cols)
      .enter()
      .append("text")
        .attr("x", width-150)
        .attr("y", function(d,i){ return i*(size+5) + 5})
        .style("fill", function(d){ return color_scheme[d]})
        .text(function(d){return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    svg.append("text")
       .attr("x", width/2)
       .attr("y", 0-margin.top/2)
       .attr("font-size", "18px")
       .style("text-anchor", "middle")
       .attr("font-weight", "bold")
       .text("US Earthquakes by Region 2011-2015")

    svg.append("text")
        .attr("dx", width/2)
        .attr("dy", 30-margin.top/2)
        .style("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("stroke", "blue")
        .text("sagarwal378");

    }

function onMouseOver(selected, dateyear, region){
    year = ""+dateyear
    for (d in regional_data){
        if (new Date(regional_data[d].key) == year){
            for (v in regional_data[d].values){
                if (regional_data[d].values[v].key == region){
                    data = regional_data[d].values[v].values;
                    break;
                }
            }
        }
    }
    data.sort(function(a, b){
          var x = a.state.toLowerCase();
          var y = b.state.toLowerCase();
          if (x < y) {return -1;}
          if (x > y) {return 1;}
          return 0;
        });
    data.sort(function(a,b){return a.count - b.count});

    svg_bar = d3.select("body").append("svg")
        .attr("class", "barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var barPadding = 0.25;
    var xScale = d3.scaleLinear().range([0, width]),
    yScale = d3.scaleBand().range([height, 0]).padding(barPadding);

    yScale.domain(data.map(function(d){return d.state; }));
    xScale.domain([0, d3.max(data, function(d) { return + d.count; })]);

    svg_bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg_bar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg_bar.selectAll("rect")
         .data(data)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("fill", "steelblue")
         .attr("x", 0)
         .attr("y", function(d) { return yScale(d.state); })
         .attr("width", function(d) { return xScale(+d.count); })
         .attr("height", yScale.bandwidth());

    svg_bar.append("text")
       .attr("x", width/2)
       .attr("y", 0-margin.top/2)
       .attr("font-size", "18px")
       .style("text-anchor", "middle")
       .text(region+"ern Region Earthquakes "+dateyear.getFullYear())
}

function onMouseOut(){
    d3.selectAll(".barchart").remove();
}