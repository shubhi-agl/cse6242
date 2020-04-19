var margin = {top: 50, right: 75, bottom: 75, left: 75}
  , width = 800 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

var xScale = d3.scaleTime().range([0, width]),
    yScale = d3.scaleLinear().range([height, 0]);

var color_scheme = {'5_5.9': '#FFC300', '6_6.9': '#FF5733', '7_7.9': '#C70039', '8.0+': '#900C3F'}

function convert_row(d){
    cols = Object.keys(d);
    obj = {year: new Date(+d.year, 0, 1)};
    for (c in cols){
        if (c > 0){
            obj[cols[c]] = +d[cols[c]];
        }
    }
    return obj;
}
d3.dsv(",", "earthquakes.csv", convert_row)
    .then(function(data){
        dataset = data;
        cols = dataset.columns;
        add_chart_one();
        d3.select("body").append("div").attr("class", "pagebreak");

        yScale.domain([0, d3.max(dataset, function(d) { return d[cols[4]]; })]);
        add_chart_two(title="Earthquake statistics for 2000-2015 with Symbols");
        d3.select("body").append("div").attr("class", "pagebreak");

        yScale = d3.scaleSqrt().range([height, 0]);
        yScale.domain([0, d3.max(dataset, function(d) { return d[cols[4]]; })]);
        add_chart_two("Earthquake statistics for 2000-2015 (Square root Scale)");
        d3.select("body").append("div").attr("class", "pagebreak");

        yScale = d3.scaleLog().range([height-5, 0]);
        yScale.domain([1, d3.max(dataset, function(d) { return d[cols[4]]; })]);
        add_chart_two("Earthquake statistics for 2000-2015 (Log Scale)", add_name=true);
    });


function add_chart_one(){
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale.domain(d3.extent(dataset, function(d) { return d.year; }));
    yScale.domain([0, d3.max(dataset, function(d) { return d[cols[4]]; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));


    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    var lines = []
    for (col in cols){
        if (col>0&col<5){
            lines[col-1] = d3.line()
                .x(function(d, i) { return xScale(d.year); })
                .y(function(d) { return yScale(d[cols[col]]); })
                .curve(d3.curveMonotoneX)


            svg.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("stroke", color_scheme[cols[col]])
                .attr("d", lines[col-1])
                .attr("data-legend", cols[col]);
        }
    }
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Num of Earthquakes");

    svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top) + ")")
      .style("text-anchor", "middle")
      .text("Year");

    var size = 20
    svg.selectAll("mydots")
      .data(cols.slice(1,5).reverse())
      .enter()
      .append("rect")
        .attr("x", width+5)
        .attr("y", function(d,i){return i*(size+5)})
        .attr("width", size+10)
        .attr("height", size-5)
        .style("fill", function(d){ return color_scheme[d]})

    svg.selectAll("mylabels")
      .data(cols.slice(1,5).reverse())
      .enter()
      .append("text")
        .attr("x", width+5 + size*1.7)
        .attr("y", function(d,i){ return i*(size+5) + (size/1.5)})
        .style("fill", function(d){ return color_scheme[d]})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    svg.append("text")
       .attr("x", width/2)
       .attr("y", 0-margin.top/2)
       .attr("font-size", "18px")
       .style("text-anchor", "middle")
       .text("Earthquake statistics for 2000-2015")

}

function add_chart_two(title, add_name=false){
    var symbols_scheme = {'5_5.9': 'symbolCircle', '6_6.9': 'symbolTriangle', '7_7.9': 'symbolDiamond', '8.0+': 'symbolSquare'};
    y_svg = 0;
    var svg_two = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale.domain(d3.extent(dataset, function(d) { return d.year; }));

    svg_two.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y_svg+height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));


    svg_two.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    var lines = []
    for (col in cols){
        if (col>0&col<5){

            lines[col-1] = d3.line()
                .x(function(d, i) { return xScale(d.year); })
                .y(function(d) { if (d[cols[col]] > 0){ return yScale(d[cols[col]]); } else return height;})
                .curve(d3.curveMonotoneX);

            svg_two.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("stroke", color_scheme[cols[col]])
                .attr("d", lines[col-1])
                .attr("data-legend", cols[col]);

            svg_two.selectAll(".dot"+col)
                .data(dataset)
                .enter().append("path")
                .attr("class", "dot")
                .attr("transform", function(d) {
                        ys = height;
                        if (d[cols[col]] > 0){ ys = yScale(d[cols[col]]);}
                        return "translate("+xScale(d.year)+","+ys+")";
                        })
                .attr("d", d3.symbol().type(d3[symbols_scheme[cols[col]]])
                                      .size(function(d){
                                            return Math.pow(Math.log(d['Estimated Deaths']),2);
                                      }))
                .attr("fill", color_scheme[cols[col]]);
        }
    }


    svg_two.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Num of Earthquakes");

    svg_two.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (y_svg + height + margin.top) + ")")
      .style("text-anchor", "middle")
      .text("Year");

    var size = 20
    svg_two.selectAll("mydots")
      .data(cols.slice(1,5).reverse())
      .enter()
      .append("rect")
        .attr("x", width+5)
        .attr("y", function(d,i){ return y_svg + i*(size+5)})
        .attr("width", size+10)
        .attr("height", size-5)
        .style("fill", function(d){ return color_scheme[d]})

    svg_two.selectAll("mylabels")
      .data(cols.slice(1,5).reverse())
      .enter()
      .append("text")
        .attr("x", width+5 + size*1.7)
        .attr("y", function(d,i){ return y_svg + i*(size+5) + (size/1.5)})
        .style("fill", function(d){ return color_scheme[d]})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    svg_two.append("text")
       .attr("x", width/2)
       .attr("y", y_svg-margin.top/2)
       .attr("font-size", "18px")
       .style("text-anchor", "middle")
       .text(title)

    if (add_name){
        svg_two.append("text")
            .attr("dx", width-10)
            .attr("dy", height+margin.bottom-10)
            .attr("font-size", "14px")
            .text("sagarwal378");
    }

    svg_two.append('g')
        .attr('class', 'pagebreak');
}