var margin = {top: 50, right: 75, bottom: 75, left: 75}
  , width = 800 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

function convert_row(d){
    cols = Object.keys(d);
    obj = {Year: new Date(+d.Year, 0, 1), state: d.State};
    for (c in cols){
        if (c > 1){
            obj[cols[c]] = +d[cols[c]];
        }
    }
    return obj;
}

d3.dsv(",", "earthquake.csv", convert_row)
    .then(function(data){
        raw_data = data;

        yearly_data = d3.nest()
            .key(function(d) { return d.Year; })
            .entries(raw_data);

        years = yearly_data.map(function(d) { return new Date(d.key); });
        add_select_box();
        add_bar_chart(yearly_data[0].key);

    });

function add_select_box(){
    d3.select("#selector")
        .append("text")
        .attr("font-size", "12px")
        .text("Select year: ");

    var selector = d3.select("#selector")
		.append("select")
		.attr("id", "dropselector")
		.style('margin-top','20px')
		.selectAll("option")
		.data(years)
		.enter().append("option")
		.text(function(d) { return d.getFullYear(); })
		.attr("value", function (d, i) {
			return d;
		});

    d3.select("#selector").property("selectedIndex", years[0]);
    d3.select("#selector")
        .on("change", function(d) {
            var selected = d3.select("#dropselector").node().value;
            change_chart(selected);
	})
}
function change_chart(new_year){
    d3.selectAll(".barchart").remove();
    add_bar_chart(""+new_year);
}
function add_bar_chart(year){

    color_scheme = {'7.0+': '#b33040', '6_6.9': '#d25c4d', '5_5.9': '#f2b447'};
    for (d in yearly_data){
        if (new Date(yearly_data[d].key) == year){
            data = yearly_data[d].values;
            break;
        }
    }
    svg_bar = d3.select("body").append("svg")
        .attr("class", "barchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var barPadding = 0.25;
    yScale = d3.scaleLinear().range([height, 0]),
    xScale = d3.scaleBand().range([0, width]).padding(barPadding);

    xScale.domain(data.map(function(d){return d.state; }));
    yScale.domain([0, d3.max(data, function(d) { return d[cols[4]]+d[cols[3]]+d[cols[2]]; })]);

    svg_bar.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg_bar.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    for (c in cols){
        if (c>1){
            svg_bar.selectAll("rect"+c)
                 .data(data)
                 .enter().append("rect")
                 .attr("class", "bar")
                 .attr("fill", color_scheme[cols[c]])
                 .attr("x", function(d) { return xScale(d.state); })
                 .attr("y", function(d) { return yScale(get_y(d,c)); })
                 .attr("width", function(d) { return xScale.bandwidth(); })
                 .attr("height", function(d) {return yScale(get_y(d, c-1)) - yScale(get_y(d,c)); });
        }
    }

    svg_bar.selectAll("tips")
         .data(data)
         .enter().append("text")
         .attr("x", function(d) { return xScale(d.state)+xScale.bandwidth()/2; })
         .attr("y", function(d) { return yScale(get_y(d,4))-5; })
         .attr("font-size", "12px")
         .style("text-anchor", "middle")
         //.attr("font-weight", "bold")
         .text(function(d) { return get_y(d,4); })

    var size = 15
    svg_bar.selectAll("mydots")
      .data(cols.slice(2,5))
      .enter()
      .append("circle")
        .attr("cx", width-100)
        .attr("cy", function(d,i){ return i*(size+5)})
        .attr("r", 5)
        //.attr("height", size-5)
        .style("fill", function(d){ return color_scheme[d]})

    svg_bar.selectAll("mylabels")
      .data(cols.slice(2,5))
      .enter()
      .append("text")
        .attr("x", width-90)
        .attr("y", function(d,i){ return i*(size+5) + 5})
        .style("fill", function(d){ return color_scheme[d]})
        .text(function(d){return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    svg_bar.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .attr("font-size", "15px")
      .style("text-anchor", "middle")
      .text("Number of Earthquakes");

    svg_bar.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.bottom/2) + ")")
      .style("text-anchor", "middle")
      .attr("font-size", "15px")
      .text("State");

    svg_bar.append("text")
       .attr("x", width/2)
       .attr("y", 0-margin.top/2)
       .attr("font-size", "20px")
       .style("text-anchor", "middle")
       .text("Visualizing Earthquake Counts by State")

    svg_bar.append("text")
        .attr("dx", width)
        .attr("dy", height+margin.bottom/2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("sagarwal378");
}

function get_y(d, col){
    var y = 0 ;
    var c = 2;
    while (c<=col){
        y = y + d[cols[c]];
        c = c + 1;
    }
    return y;
}