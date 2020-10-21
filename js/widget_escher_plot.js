const parse_file = function(data_as_string) {
  let lines = data_as_string.split(/\r?\n/);
  //console.log(lines);
  let d_values = {};

  let v_min = 10000;
  let v_max = -10000;
  for (let i = 1; i < lines.length; i++) {
    let row = lines[i].split(',');
    let val = parseFloat(row[1])
    d_values[row[0]] = val;
    if (val < v_min) {
      v_min = val;
    }
    if (val > v_max) {
      v_max = val;
    }
  }

  return {
    'name' : lines[0].split(',')[1],
    'min' : v_min,
    'max' : v_max,
    'values' : d_values,
  }
};

const upload_gene_data = function (input_lb, input_ub, ct_display_dataset, ct_gene_datasets) {
  return function() {
    let file = this.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
      let loaded_data = parse_file(e.target.result);
      widget_escher_plot.datasets.gene[loaded_data.name] = loaded_data;
      console.log('input_lb', input_lb.val());
      if (input_lb.val()) {
        if (input_lb.val() > loaded_data.min) {
          input_lb.val(loaded_data.min);
        }
      } else {
        input_lb.val(loaded_data.min);
      }
      if (input_ub.val()) {
        if (input_ub.val() < loaded_data.max) {
          input_ub.val(loaded_data.max);
        }
      } else {
        input_ub.val(loaded_data.max);
      }

      let radioId =  'dataset-radio-' + loaded_data.name
      if ($("#" + radioId).length) {
        ct_display_dataset.html('DATASET already present (reload): ' + loaded_data.name + ', min: ' + loaded_data.min + ', max: ' + loaded_data.max + ', variables: ' + _.size(loaded_data.values))
      } else {
        ct_display_dataset.html('loaded dataset: ' + loaded_data.name + ', min: ' + loaded_data.min + ', max: ' + loaded_data.max + ', variables: ' + _.size(loaded_data.values))
        ct_gene_datasets.append(
          $('<input>',
            {
              'type' : 'radio',
              'id' : radioId,
              'name' : 'dataset-gene',
              'value' : loaded_data.name
            })).append($('<label>', {'for' : radioId}).append(' ' + loaded_data.name)).append('<br>');
      }

    };
    reader.readAsText(file);
  }
}

const y_vars = {};
const x_vars = {};

const build_heat_map_data = function(min_v, max_v, datasets) {
  let d_values = widget_escher_plot.datasets.gene

  let dataset = {
    'min' : min_v,
    'max' : max_v,
    'sets' : datasets,
    'rxn' : {}
  };

  /*
  _.each(widget_escher.escher_builder.cobra_model.reactions, function(reaction, reaction_id) {
    let d_set_rxn_data = {};
    _.each(reaction.genes, function(oGene) {
      if (y_vars[oGene.bigg_id] || true) {
        let gene_id = oGene.bigg_id;
        d_set_rxn_data[gene_id] = [];
        _.each(dataset.sets, function(x_var) {
          if (d_values[x_var] && d_values[x_var].values[gene_id]) {
            d_set_rxn_data[gene_id].push(d_values[x_var].values[gene_id])
          } else {
            d_set_rxn_data[gene_id].push('nan')
          }
        });
      }
    });
    dataset['rxn'][reaction_id] = d_set_rxn_data
  });

   */

  _.each(widget_escher.escher_map[1].reactions, function(reaction, reaction_id) {
    let d_set_rxn_data = {};
    _.each(reaction.genes, function(oGene) {
      if (y_vars[oGene.bigg_id] || true) {
        let gene_id = oGene.bigg_id;
        d_set_rxn_data[gene_id] = [];
        _.each(dataset.sets, function(x_var) {
          if (d_values[x_var] && d_values[x_var].values[gene_id]) {
            d_set_rxn_data[gene_id].push(d_values[x_var].values[gene_id])
          } else {
            d_set_rxn_data[gene_id].push('nan')
          }
        });
      }
    });
    dataset['rxn'][reaction.bigg_id] = d_set_rxn_data
  });

  return dataset;
}

const button_paint_map = function(input_lb, input_ub) {
  return function() {
    if (!input_lb.val() || !input_ub.val()) {
      alert('missing either min or max')
    } else {
      let lower_bound = parseFloat(input_lb.val());
      let upper_bound = parseFloat(input_ub.val());
      console.log(lower_bound, upper_bound)
      widget_escher_plot.dataset = build_heat_map_data(lower_bound, upper_bound, _.keys(widget_escher_plot.datasets.gene));
      widget_escher_plot.refresh()
    }
  }
}

let load_chem_matrix = undefined
let kbase_load_fba = undefined

const init_ui = function(ct) {
  let btn_upload_gene_data_input = $('<input>', {'type':'file', 'style': '', 'accept': '.csv'}) // display:none
  let btn_upload_gene_data = $('<label>', {'for':'upload_gene_data', 'class': 'badge badge-primary'})
      .append($('<i>', {'class': 'fas fa-upload'}).html('Load Gene Data'))
      .append(btn_upload_gene_data_input);
  let btn_display_heat_map = $('<button>').html('Display');

  let ct_compound_datasets = $('<div>', {'style': 'max-height: 200px;overflow: scroll;'}).append('<p>Compound Datasets:</p>');
  let ct_reaction_datasets = $('<div>').append('<p>Reaction Datasets:</p>');
  let ct_gene_datasets = $('<div>').append('<p>Gene Datasets:</p>');
  let ct_display_dataset = $('<div>');
  let input_ub = $('<input>', {'type': 'number', 'step': 'any'});
  let input_lb = $('<input>', {'type': 'number', 'step': 'any'});
  btn_display_heat_map.click(button_paint_map(input_lb, input_ub));
  btn_upload_gene_data_input.on('change', upload_gene_data(input_lb, input_ub, ct_display_dataset, ct_gene_datasets));
  ct.append(btn_upload_gene_data).append(ct_compound_datasets).append(ct_reaction_datasets).append(ct_gene_datasets)
    .append(input_lb).append(input_ub).append(btn_display_heat_map).append(ct_display_dataset);
  //btn_upload_gene_data_input.MultiFile();

  kbase_load_fba = function(id, ws) {
    kbaseApi.get_object(id, ws, env.config.kbase_token, function(fba) {
      let res = {}
      _.each(fba['FBAReactionVariables'], function(v) {
        let model_rxn_id = v.modelreaction_ref.split('/').splice(-1)
        res[model_rxn_id] = v.value;
      })
      widget_escher_plot.datasets.reaction[fba.id] = res
      let radioId =  'dataset-radio-' + fba.id
      let input = $('<input>',
        {
          'type' : 'radio',
          'id' : radioId,
          'name' : 'dataset-reaction',
          'value' :  fba.id
        })
      ct_reaction_datasets.append(input).append($('<label>', {'for' : radioId}).append(' ' +  fba.id)).append('<br>');
      $('input:radio[name="dataset-reaction"]').change(
        function(){
          if ($(this).is(':checked')) {
            console.log($(this).val())
            widget_escher_plot.display_reaction_dataset($(this).val());
          }
        });
    });
    //$.getJSON('../annotation/data/FBA.ecoli.json', function(fba) {});
  }
  const load_chem_matrix_data = function(chemical_abundance_matrix, attribute_mapping) {
    //console.log('attribute_mapping', attribute_mapping)
    //console.log('chemical_abundance_matrix', chemical_abundance_matrix)
    let compound_datasets = load_ccc(chemical_abundance_matrix, attribute_mapping, 'modelseed')
    _.each(compound_datasets, function(dataset) {
      widget_escher_plot.datasets.compound[dataset.id] = dataset.data
      let radioId =  'dataset-radio-' + dataset.id
      let input = $('<input>',
        {
          'type' : 'radio',
          'id' : radioId,
          'name' : 'dataset-compound',
          'value' :  dataset.id
        })
      ct_compound_datasets.append(input).append($('<label>', {'for' : radioId}).append(' ' +  dataset.id)).append('<br>');
    });
    $('input:radio[name="dataset-compound"]').change(
      function(){
        if ($(this).is(':checked')) {
          widget_escher_plot.display_compound_dataset($(this).val());
        }
      });
    //console.log('compound_datasets', compound_datasets)
  }
  load_chem_matrix = function(id, ws) {
    kbaseApi.get_object(id, ws, env.config.kbase_token, function(chemical_abundance_matrix) {
      if (chemical_abundance_matrix['row_attributemapping_ref']) {
        kbaseApi.get_object(chemical_abundance_matrix['row_attributemapping_ref'], undefined, env.config.kbase_token, function(attribute_mapping) {
          load_chem_matrix_data(chemical_abundance_matrix, attribute_mapping);
        });
      } else {
        load_chem_matrix_data(chemical_abundance_matrix, undefined);
      }
    });
    /*
    $.getJSON('../annotation/data/AttributeMapping.JCVI_Syn3_metabolomics_row_attributes.json', function(attribute_mapping) {
      $.getJSON('../annotation/data/ChemicalAbundanceMatrix.JCVI_Syn3_metabolomics.json', function(chemical_abundance_matrix) { });
    });
     */
  }
}

init_ui($('#data-tab-ui'))

load_ccc = function(chemical_abundance_matrix, attribute_mapping, map_target) {
  let compound_datasets = []
  for (let col_index = 0; col_index < chemical_abundance_matrix.data.col_ids.length; col_index++) {
    compound_datasets[col_index] = {
      id: chemical_abundance_matrix.data.col_ids[col_index],
      data: {}
    }
  }

  let compound_ids = []
  let map_target_index = undefined
  if (attribute_mapping) {
    for (let i = 0; i < attribute_mapping.attributes.length; i++) {
      if (attribute_mapping.attributes[i].attribute === map_target) {
        map_target_index = i
      }
    }
  }

  for (let row_index = 0; row_index < chemical_abundance_matrix.data.row_ids.length; row_index++) {
    compound_ids[row_index] = chemical_abundance_matrix.data.row_ids[row_index]
    if (map_target_index && attribute_mapping.instances && attribute_mapping.instances[compound_ids[row_index]]) {
      compound_ids[row_index] = attribute_mapping.instances[compound_ids[row_index]][map_target_index]
    }
  }


  for (let row_index = 0; row_index < chemical_abundance_matrix.data.values.length; row_index++) {
    let compound_id = compound_ids[row_index]
    for (let col_index = 0; col_index < chemical_abundance_matrix.data.values[0].length; col_index++) {
      if (compound_id && compound_id.length > 0) {
        _.each(compound_id.split(';'), function(id) {
          compound_datasets[col_index].data[id] = chemical_abundance_matrix.data.values[row_index][col_index]
        });
      }
    }
  }
  return compound_datasets
}


class WidgetEscherPlot {
  constructor() {
    this.escher = null;
    this.active_plots = {}
    this.dataset = undefined;
    this.datasets = {
      'gene' : {},
      'reaction' : {},
      'compound' : {}
    }
  }

  display_reaction_dataset(dataset_id) {
    if (this.datasets.reaction[dataset_id]) {
      this.escher.escher_builder.set_reaction_data(this.datasets.reaction[dataset_id])
    }
  }

  display_compound_dataset(dataset_id) {
    if (this.datasets.compound[dataset_id]) {
      this.escher.escher_builder.set_metabolite_data(this.datasets.compound[dataset_id])
    }
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