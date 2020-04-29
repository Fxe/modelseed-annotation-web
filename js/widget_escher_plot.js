class WidgetEscherPlot {
  constructor() {
    this.escher = null;
    this.active_plots = {}
    this.dataset = undefined;
  }

  set_escher_widget(ew) {
    console.log('plot!!!!!!')
    this.escher = ew;
  }

  init_container() {
    console.log('plot!!')
  }

  refresh() {
    let that = this;

    /*
    const dataset = {
      'min' : 0,
      'max' : 100,
      'sets' : ['set1', 'set2', 'set3'],
      'rxn' : {
        'rxn00459' : {
          'g1' : [],
          'g2' : [],
        },
        'rxn00153' : {
          'g4' : [],
          'g5' : [],
        },
        'rxn00004' : {
          'g9' : [],
          'g10' : [],
          'gABC' : [],
          'ggg' : [],

        },
        'rxn00266' : {
          'gene' : [],
        },
      }
    }
    _.each(dataset.rxn, function(d, rxn_id) {
      _.each(d, function(v, gene_id) {
        for (let i = 0; i < dataset.sets.length; i++) {
          d[gene_id].push(Math.random() * 100);
        }
        console.log(rxn_id, gene_id, d[gene_id])
      })
    })

    dataset.rxn.rxn00266.gene = [0, 50, 100]*/

    let x_offset = 120;
    let y_offset = 20;
    if (this.dataset) {
      d3.select('#map_container')
        .selectAll('.reaction-label-group')
        .each(function(rxn_data) {
          let rxn_label = d3.select(this);
          if (!that.active_plots[rxn_label]) {
            that.active_plots[rxn_label] = {}
          }
          let plot_id = 'plot' + rxn_data.reaction_id + '_label_meta'
          if (!that.active_plots[rxn_label][plot_id]) {
            console.log()
            if (that.dataset.rxn[rxn_data.bigg_id]) {
              let p = rxn_label.insert('g').attr('id', 'plot' + rxn_data.reaction_id + '_label_meta')
                .attr('transform', 'translate('
                  + (x_offset) + ','
                  + (y_offset) + ')')
              that.active_plots[rxn_label][plot_id] = p;
              //console.log(rxn_data, that.dataset.rxn[rxn_data.bigg_id]);
              let plot_data = that.dataset.rxn[rxn_data.bigg_id];
              that.plot_heat_map(p, that.dataset.sets, _.keys(plot_data), plot_data, that.dataset.min, that.dataset.max);
            } else {
              that.active_plots[rxn_label][plot_id] = 'nula';
              console.log(':(')
            }

          }
        })
    }

  }

  plot_heat_map(g, x_axis, y_axis, d, min, max, block_size = 30) {
    //console.log('x', x_axis, 'y', y_axis, block_size)
    // Labels of row and columns
    //var myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    //var myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = (x_axis.length * block_size) - margin.left - margin.right,
      height = (y_axis.length * block_size) - margin.top - margin.bottom;

    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(x_axis)
      .padding(0.01);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      g.selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

// Build X scales and axis:
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(y_axis)
      .padding(0.01);

g.append("g")
  .call(d3.axisLeft(y));

var data = []
//console.log('build data', d, x_axis)
_.each(d, function(y_array, y_var) {
  for (let i = 0; i < x_axis.length; i++) {
    data.push({
      group : x_axis[i],
      variable : y_var,
      value : y_array[i]
    })
  }
});


// Build color scale
var myColor = d3.scaleLinear()
  .range(["#ffffff", "#fc0303"])
  .domain([min, max])
g.selectAll()
  .data(data, function(d) {
    return d.group+':'+d.variable;
  }).enter()
    .append("rect")
    .attr("x", function(d) { return x(d.group) })
    .attr("y", function(d) { return y(d.variable) })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return myColor(d.value)} )
}

plot_pie(rad) {
// set the dimensions and margins of the graph
var width = rad,
  height = rad,
  margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
p.append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
var data = {a: 9, b: 20, c:30, d:8, e:12}

// set the color scale
var color = d3.scaleOrdinal()
  .domain(data)
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
p.selectAll('whatever')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  )
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
}
}