
// get the data
links =  [
  {
    "source": "Milwaukee Bucks",
    "target": "Cleveland Cavaliers",
    "value": 0
  },
  {
    "source": "Milwaukee Bucks",
    "target": "Sacramento Kings",
    "value": 0
  },
  {
    "source": "Detroit Pistons",
    "target": "Philadelphia 76ers",
    "value": 1
  },
  {
    "source": "Cleveland Cavaliers",
    "target": "Los Angeles Lakers",
    "value": 1
  },
  {
    "source": "Dallas Mavericks",
    "target": "Houston Rockets",
    "value": 1
  },
  {
    "source": "Miami Heat",
    "target": "San Antonio Spurs",
    "value": 1
  },
  {
    "source": "Miami Heat",
    "target": "Los Angeles Lakers",
    "value": 1
  },
  {
    "source": "Brooklyn Nets",
    "target": "Los Angeles Lakers",
    "value": 1
  },
  {
    "source": "Brooklyn Nets",
    "target": "Houston Rockets",
    "value": 1
  },
  {
    "source": "Sacramento Kings",
    "target": "Los Angeles Lakers",
    "value": 1
  },
  {
    "source": "Houston Rockets",
    "target": "Golden State Warriors",
    "value": 0
  },
  {
    "source": "Los Angeles Lakers",
    "target": "Los Angeles Clippers",
    "value": 1
  },
  {
    "source": "Sacramento Kings",
    "target": "Philadelphia 76ers",
    "value": 1
  },
  {
    "source": "San Antonio Spurs",
    "target": "Miami Heat",
    "value": 0
  },
  {
    "source": "Portand Trail Blazers",
    "target": "Miami Heat",
    "value": 0
  },
  {
    "source": "Chicago Bulls",
    "target": "Boston Celtics",
    "value": 0
  },
  {
    "source": "New York Knicks",
    "target": "Golden State Warriors",
    "value": 0
  },
  {
    "source": "Denver Nuggets",
    "target": "Golden State Warriors",
    "value": 0
  },
  {
    "source": "Portand Trail Blazers",
    "target": "Golden State Warriors",
    "value": 0
  },
  {
    "source": "New York Knicks",
    "target": "Denver Nuggets",
    "value": 1
  },
  {
    "source": "San Antonio Spurs",
    "target": "Denver Nuggets",
    "value": 0
  },
  {
    "source": "Houston Rockets",
    "target": "Denver Nuggets",
    "value": 1
  },
  {
    "source": "Portand Trail Blazers",
    "target": "San Antonio Spurs",
    "value": 1
  },
  {
    "source": "Houston Rockets",
    "target": "Brooklyn Nets",
    "value": 0
  },
  {
    "source": "Milwaukee Bucks",
    "target": "Boston Celtics",
    "value": 0
  },
  {
    "source": "Golden State Warriors",
    "target": "Milwaukee Bucks",
    "value": 1
  },
  {
    "source": "Golden State Warriors",
    "target": "Atlanta Hawks",
    "value": 1
  },
  {
    "source": "Orlando Magic",
    "target": "Memphis Grizzlies",
    "value": 0
  },
  {
    "source": "Washington Wizards",
    "target": "New York Knicks",
    "value": 1
  },
  {
    "source": "Boston Celtics",
    "target": "Orlando Magic",
    "value": 1
  },
  {
    "source": "Oklahoma City Thunder",
    "target": "Sacramento Kings",
    "value": 0
  },
  {
    "source": "Boston Celtics",
    "target": "Charlotte Hornets",
    "value": 1
  },
  {
    "source": "Boston Celtics",
    "target": "Philadelphia 76ers",
    "value": 1
  },
  {
    "source": "Brooklyn Nets",
    "target": "Miami Heat",
    "value": 1
  },
  {
    "source": "Indiana Pacers",
    "target": "Chicago Bulls",
    "value": 1
  },
  {
    "source": "New York Knicks",
    "target": "Boston Celtics",
    "value": 0
  },
  {
    "source": "Los Angeles Lakers",
    "target": "Phoenix Suns",
    "value": 0
  },
  {
    "source": "Golden State Warriors",
    "target": "Dallas Mavericks",
    "value": 1
  },
  {
    "source": "New Orleans Pelicans",
    "target": "Indiana Pacers",
    "value": 0
  },
  {
    "source": "Milwaukee Bucks",
    "target": "Brooklyn Nets",
    "value": 0
  },
  {
    "source": "Washington Wizards",
    "target": "Portand Trail Blazers",
    "value": 1
  },
  {
    "source": "Utah Jazz",
    "target": "Golden State Warriors",
    "value": 1
  },
  {
    "source": "Boston Celtics",
    "target": "Utah Jazz",
    "value": 1
  },
  {
    "source": "Golden State Warriors",
    "target": "Charlotte Hornets",
    "value": 1
  },
  {
    "source": "Boston Celtics",
    "target": "Atlanta Hawks",
    "value": 1
  },
  {
    "source": "Philadelphia 76ers",
    "target": "Boston Celtics",
    "value": 0
  }
];

var nodes = {};

// compute the distinct nodes from the links.
links.forEach(function(link) {
    link.source = nodes[link.source] ||
        (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] ||
        (nodes[link.target] = {name: link.target});
});

var width = 1200,
    height = 700;

var force = d3.forceSimulation()
    .nodes(d3.values(nodes))
    .force("link", d3.forceLink(links).distance(100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(-250))
    .alphaTarget(1)
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("text")
    .attr("dx", width - 300)
    .attr("dy", 50)
    .text("sagarwal378");

// add the links and the arrows
var path = svg.append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("class", function(d) { return "link_" + d.value; });

// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("dblclick", function(d){
        if(d.fixed == false) {
          d3.select(this).selectAll("circle")
          .classed("pinned", true);
          d.fixed = true;
        }
        else {
          d3.select(this).selectAll("circle")
          .classed("pinned", false);
          d.fixed = false;
        }
        });

var color_gradient = d3.schemePuRd[5]

function get_degree(d){
    return (links.filter(function(p){
        return (p.source == d|p.target == d);
      })).length;
}
// add the nodes
node.append("circle")
    .attr("fill", function(d){
        deg = get_degree(d);
        return color_gradient[Math.floor(deg/2)]
    })
    .attr("r", function(d){
      return get_degree(d)*2.5;
    });

node.append("text")
    .text(function(d) { return d.name; })
    .attr("dx", 5)
    .attr("dy", 15);

// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            d.target.x + "," +
            d.target.y;
    });

    node
        .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; })
};

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
};

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    if (d.fixed == true) {
        d.fx = d.x;
        d.fy = d.y;
    }
    else {
        d.fx = null;
        d.fy = null;
    }
};
