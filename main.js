/* global d3, escher */

let tinier = escher.libs.tinier
let tooltip_style = {
  'min-width': '40px',
  'min-height': '10px',
  'border-radius': '2px',
  'border': '1px solid #b58787',
  'padding': '7px',
  'background-color': '#fff',
  'text-align': 'left',
  'font-size': '16px',
  'font-family': 'sans-serif',
  'color': '#111',
  'box-shadow': '4px 6px 20px 0px rgba(0, 0, 0, 0.4)',
}

// --------------------------------------------------
// TOOLTIP 1: Function in plain JavaScript
// --------------------------------------------------

var tooltips_1 = function (args) {
  // Check if there is already text in the tooltip
  if (args.el.childNodes.length === 0) {
    // If not, add new text
    var node = document.createTextNode('Hello ')
    args.el.appendChild(node)
    // Style the text based on our tooltip_style object
    Object.keys(tooltip_style).map(function (key) {
      args.el.style[key] = tooltip_style[key]
    })
  }
  // Update the text to read out the identifier biggId
  args.el.childNodes[0].textContent = 'Hello ' + JSON.stringify(args.state.biggId)
}

// --------------------------------------------------
// TOOLTIP 2: Callback function with Tinier for rendering
// --------------------------------------------------
const tooltip_gene = function(args) {
  tinier.render(
    args.el,
    tinier.createElement(
      'div',
      { style: tooltip_style, id: 'tooltip_container'},
      'Gene',

      tinier.createElement(
        'br'
      ),
      tinier.createElement(
        'b',
        {},
        args.state['name']
      ),
      // Update the text to read out the identifier biggId
      '' //JSON.stringify(args.state)
    ),
  );
};

const get_cmp_config = function(args) {
  let cmp_config = {'0' : ''};
  if (args.state.annotation && args.state.annotation['seed.compartment']) {
    cmp_config = Object.fromEntries(args.state.annotation['seed.compartment'].split(';').map(x => x.split(':')));
  }
  return cmp_config;
};

const get_single_seed_id_from_args = function(args) {
  let seed_id;
  if (args.state.type === 'reaction') {
    if (args.state.annotation && args.state.annotation['seed.reaction']) {
      if (typeof args.state.annotation['seed.reaction'] === "string") {
        seed_id = args.state.annotation['seed.reaction']
      } else {
        _.each(args.state.annotation['seed.reaction'], function(other_seed_id) {
          seed_id = other_seed_id
        });
      }
    } else if (args.state.biggId.startsWith("rxn")) {
      seed_id = args.state.biggId
    }
  }

  return seed_id;
};

const get_seed_id_from_args = function(args) {
  let seed_ids = {};

  let cmp_config = get_cmp_config(args);
  console.log(args);
  if (args.state.type === 'reaction') {
    if (args.state.annotation && args.state.annotation['seed.reaction']) {
      if (typeof args.state.annotation['seed.reaction'] === "string") {
        seed_ids[args.state.annotation['seed.reaction']] = cmp_config
      } else {
        _.each(args.state.annotation['seed.reaction'], function(seed_id) {
          seed_ids[seed_id] = cmp_config
        });
      }
    } else if (args.state.biggId.startsWith("rxn")) {
      seed_ids[args.state.biggId] = cmp_config
    }
  }

  return seed_ids;
};

const is_generic = function (cmp_config) {
  return _.values(cmp_config).indexOf('') >= 0
};

const get_compartment_token = function(cmps) {
  if (cmps.indexOf('k') >= 0) {
    return 'k'
  }
  if (cmps.length === 1) {
    return cmps[0]
  }
  if (cmps.length === 2) {
    if (cmps.indexOf('c') >= 0) {
      if (cmps.indexOf('e') >= 0) {
        return 'c'
      } else {
        return _.filter(cmps, function(o) {return o !== 'c'})[0]
      }
    } else {
      return undefined;
    }
  }
  return undefined;
};

const isDigit = function(s) {
  return !isNaN(parseFloat(s))
};

const cmp_norm = function(cmp) {
  if (cmp.length === 2 && isDigit(cmp[1])) {
    return cmp[0];
  }
  return cmp;
};

const get_reaction_data = function(map_rxn_label, _) {
  let res = _.filter(widget_escher.escher_model.reactions, function(o) {return o['id'] === map_rxn_label})
  if (res.length === 1) {
    let rxn_object = res[0]
    let seed_id = undefined;
    if (rxn_object.annotation) {
      seed_id = rxn_object.annotation['seed.reaction'];
    }
    if (seed_id) {
      let ms = _.keys(rxn_object.metabolites);
      let metabolites = _.filter(widget_escher.escher_model.metabolites, function(m) {return ms.indexOf(m.id) >= 0});
      let compartments = {};
      _.each(metabolites, function(m) {
        compartments[cmp_norm(m['compartment'])] = true;
      });
      // solve compartment token
      let rxn_compartment = get_compartment_token(_.keys(compartments));
      let rxn_cmp_id = rxn_compartment ? (seed_id + '_' + rxn_compartment) : undefined;
      return [seed_id, rxn_compartment, rxn_cmp_id]
    }
    return undefined
  }
  return undefined
};

const tooltip_reaction = function(args) {
  console.log('tooltip_reaction');
  if (reaction_tooltip.is_busy()) {
    console.log('tooltip_reaction', reaction_tooltip.is_busy());
    return
  }

  let cmp_config = get_cmp_config(args);
  let seed_ids = get_seed_id_from_args(args);
  let seed_id = get_single_seed_id_from_args(args);
  let cmp_config_str = Object.keys(cmp_config).map(x=> x + ':' + cmp_config[x]).join(';');

  //console.log(seed_ids, rxn)
  tinier.render(
    args.el,
    tinier.createElement(
      'div',
      {style: tooltip_style},
      tinier.createElement(
        'a',
        {
          class: 'badge badge-primary',
          href: 'view_annotation.html?rxn=' + args.state.biggId + '&seed_id=' + seed_id + '&config=' + cmp_config_str,
          target: '_blank'
        },
        tinier.createElement(
          'i',
          {class: 'fas fa-external-link-alt'}
        )
      ),
      ' '+ args.state.biggId + ": " + args.state.name
    ),
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style, id: 'tooltip_container'},
    ),
  );

  console.log('tooltip_reaction', seed_ids);

  if (_.size(seed_ids) > 0) {
    let seed_id = _.keys(seed_ids)[0];
    if (is_generic(cmp_config)) {
      console.log('tooltip_reaction::generic', seed_id);
      api.get_annotation_template_t_reaction_list(seed_id, env.config['target_template'], function(res) {
        let ct = $('#' + reaction_tooltip.container_id);
        _.each(res, function(cmp_config, trxn_id) {
          let sub_ct = $('<div>');
          console.log('tooltip_reaction::cmp_config', trxn_id, seed_id, cmp_config);
          reaction_tooltip.ttt3(trxn_id, seed_id, cmp_config,
            env.config['target_template'], env.config['genome_set'], sub_ct, false);
          ct.append(sub_ct);
        });
        console.log('tooltip_reaction::get_annotation_template_t_reaction_list', res);
      })
    } else {
      console.log('tooltip_reaction::cmp_config', args.state.biggId, seed_id, seed_ids[seed_id]);
      console.log(args.state.biggId, seed_id, seed_ids[seed_id], env.config['target_template'], env.config['genome_set']);
      let rxn_id_data = get_reaction_data(args.state.biggId, _);
      console.log('tooltip_reaction::rxn_id_data', rxn_id_data);
      if (rxn_id_data && rxn_id_data[1]) { // if compartment is defined
        reaction_tooltip.ttt2(rxn_id_data[2], seed_id, seed_ids[seed_id],
          env.config['target_template'], env.config['genome_set'], false);
      }
    }
  }

  /*
  if (seed_ids.length > 0) {
    get_annotation_status(env.config['target_template'], JSON.parse(JSON.stringify(seed_ids)), {}, function(template_rxns) {
      console.log('template_rxns', template_rxns);
      server_render_tooltip(seed_ids[0], $('#tooltip_container'), template_rxns)
    }, function() {
      console.log('!!! FAIL')
    })
  }

   */
};

const tooltip = function (args) {
  if (args.state.type === 'metabolite') {
    //tooltip_metabolite(args);
    widget_escher.tooltip['fn_tooltip_cpd'](args);
  } else if (args.state.type === 'reaction') {
    if (widget_escher.tooltip['fn_tooltip_rxn'].tooltip) {
      widget_escher.tooltip['fn_tooltip_rxn'].tooltip(args)
    } else {
      widget_escher.tooltip['fn_tooltip_rxn'](args);
    }
  } else if (args.state.type === 'gene') {
    widget_escher.tooltip['fn_tooltip_gene'](args);
  } else {
    console.log(args.state.type)
  }
};

// --------------------------------------------------
// TOOLTIP 3: Tooltip with random pics
// --------------------------------------------------

var tooltips_3 = function (args) {
  // Use the tinier.render function to render any changes each time the
  // tooltip gets called
  tinier.render(
    args.el,
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style},
      // Update the text to read out the identifier biggId
      'Hello tinier ' + args.state.biggId,
      // Line break
      tinier.createElement('br'),
      // Add a picture
      tinier.createElement(
        'img',
        // Get a random pic from unsplash, with ID between 0 and 1000
        { src: 'https://unsplash.it/100/100?image=' +  Math.floor(Math.random() * 1000) }
      )
    )
  )
}

// --------------------------------------------------
// TOOLTIP 4: Tooltip with a D3 plot
// --------------------------------------------------

/**
 * Function to calculate the frequency of letters in a word.
 */
function calculateLetterFrequency (s) {
  var counts = {}
  s.toUpperCase().split('').map(function (c) {
    if (!(c in counts)) {
      counts[c] = 1
    } else {
      counts[c] += 1
    }
  })
  return Object.keys(counts).map(function (k) {
    return { letter: k, frequency: counts[k] }
  })
}

/**
 * Tooltip function that shows plots with the frequency of letters in each ID.
 */
var tooltipxx = function (args) {
  // Use the tinier.render function to render any changes each time the
  // tooltip gets called
  tinier.render(
    args.el,
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style }
    )
  )

  // Let's calculate the frequency of letters in the ID
  var letters = calculateLetterFrequency(args.state.biggId)

  // Set margins and size for the plot
  var margin = { top: 20, right: 20, bottom: 30, left: 40 }
  var width = 200 - margin.left - margin.right
  var height = 200 - margin.top - margin.bottom

  // Create D3 scales
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1, 0.2)
  var y = d3.scale.linear().range([height, 0])

  // Create a SVG element for the plot
  var svg = d3.select(args.el).select('div').append('svg')
         .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // Create x and y domains
  x.domain(letters.map(function (d) { return d.letter }))
  var max_y = d3.max(letters, function (d) { return d.frequency })
  y.domain([ 0, max_y ])

  // Add the axes
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.svg.axis().scale(x).orient('bottom'))
  svg.append('g')
    .attr('class', 'y axis')
    .call(d3.svg.axis().scale(y).orient('left').ticks(max_y))

  // Add the bars
  svg.selectAll('.bar')
    .data(letters)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function (d) { return x(d.letter) })
    .attr('width', x.rangeBand())
    .attr('y', function (d) { return y(d.frequency) })
    .attr('height', function (d) { return height - y(d.frequency) })
}


// --------------------------------------------------
// TOOLTIP 3: Component with Tinier rendering and state handling
// --------------------------------------------------

var tooltips_5 = tinier.createComponent({
  init: function () {
    return {
      biggId: '',
      count: 0,
    }
  },

  reducers: {
    setContainerData: function (args) {
      return Object.assign({}, args.state, {
        biggId: args.biggId,
        count: args.state.count + 1,
      })
    },
  },

  render: function (args) {
    tinier.render(
      args.el,
      tinier.createElement(
        'div', { style: tooltip_style },
        'Hello tinier ' + args.state.biggId + ' ' + args.state.count
      )
    )
  }
})

var load_annotation = function(seed_reaction) {
    ''
}

// --------------------------------------------------
// Load the Escher map
// --------------------------------------------------

var set_template = function() {
    //e_builder.set_reaction_data({'R10305':-1})
}

var test = function() {
    $.getJSON("data/ModelSEED/Alanine Biosynthesis.json", function(map_data) {
        e_map = map_data
        e_builder = escher.Builder(e_map, e_model, null, d3.select('#map_container'), e_options)
    })
}


const page_change_map = function(escher_map, dataset_id, map_id) {
  widget_escher.change_map(escher_map);
  widget_escher.toggle_display();
  $('#label_map').html(map_id);
  env.set_config_property('default_map', dataset_id + '/' + map_id);
};

const load_escher_map = function(dataset_id, map_id) {
    console.log('load_escher_map', dataset_id, map_id);
    if (env['config'] && env['config']['biochem_config']) {
      api.post_get_refit_map(map_id, dataset_id, env['config']['biochem_config'], null, function(escher_map) {
        page_change_map(escher_map, dataset_id, map_id);
      })
    } else {
      api.get_escher_map(dataset_id, map_id, function(escher_map) {
        page_change_map(escher_map, dataset_id, map_id);
      })
    }
};

var e_model;
var e_map;
var e_builder;
var cfg;
// Fun this code after the page loads
var cloud_status = false
var server_status = false

const kbaseApi = new KBaseAPI();
const chem_api = new ChemAPI();
let env = new CurationEnvironment();
const api = new CurationAPI();
const biochem_api = new BiochemistryAPI();
class SeedModuleFromCurationApi {
  constructor(api) {
    this.api = api
  }

  get_compound(id, database = 'seed.compound', fn_success) {
    this.api.get_modelseed_compound(id, function(data) {
      let cpd = {
        id : data.id,
        name : data.name,
        formula : data.formula,
        charge : data.charge,
        smiles : data.smiles,
        aliases : data.aliases,
      };
      if (fn_success) {
        fn_success(cpd);
      }
    });
  }
}

biochem_api.database_modules['seed.compound'] = new SeedModuleFromCurationApi(api);

let reaction_tooltip = new EscherTooltipAnnotation(tinier, api, env, 'tooltip_container');

const widget_escher_depict = new WidgetEscherDepict(biochem_api, chem_api);
const widget_escher_left_panel = new WidgetEscherLeftPanel($('#left_panel'));
const widget_escher_plot = new WidgetEscherPlot();
const widget_escher_metadata = new WidgetEscherMetadata(biochem_api, api, env);

const e_options = {
  //menu: '',
  fill_screen: false,
  tooltip_component: tooltip,
};
const widget_escher = new WidgetEscherModelseed($('#top_bar'), d3.select('#map_container'), e_options, false, true, [
  widget_escher_depict,
  widget_escher_left_panel,
  widget_escher_plot,
  widget_escher_metadata]);

const widget_escher_optimization = new WidgetEscherOptimization(tinier, widget_escher, widget_escher_left_panel);

widget_escher.fn_tooltip_options['reaction']['annotation'] = tooltip_reaction;
widget_escher.fn_tooltip_options['reaction']['optimization'] = widget_escher_optimization;
widget_escher.fn_tooltip_options['compound']['structure'] = tooltip_metabolite;
var waaaa = null;

const temp_save_map = function() {
  let m = widget_escher.escher_map;
  let ids = widget_escher.escher_map[0]['map_name'].split('.');
  m[1]['canvas'] = widget_escher.escher_builder.map.canvas.size_and_location();
  env.save_map(m, ids[0], ids[1])
};



const validate = function(fn_valid, control) {
  if (fn_valid()) {
    control.removeClass("is-invalid");
    control.addClass("is-valid");
    return true;
  } else {
    control.removeClass("is-valid");
    control.addClass("is-invalid");
    return false;
  }
};

let table_mapping_widget = undefined;

const load_biochem_from_config = function(config_str, cb) {
  biochemLoader.load_modelseed(config_str, cb);
};

const update_narrative_table = function(workspace_id, table) {
  let token = undefined;
  if (env.config['kbase_token']) {
    token = env.config['kbase_token'];
  } else {

  }
  if (token) {
    kbaseApi.get_object_list(workspace_id, token, function(res) {
      let rows = [];
      _.each(res, function(o_info) {
        let o_type = o_info[2];
        let button_html = "";
        if (o_type.startsWith("KBaseFBA.NewModelTemplate")) {
          button_html = '<a href="template_viewer.html?object=' + o_info[1] + '&workspace=' + workspace_id + '" target="_blank"><span class="oi oi-eye"></span></a>'
        }
        if (o_type.startsWith("KBaseMatrices.ChemicalAbundanceMatrix")) {
          let js = "load_chem_matrix('" + o_info[1] +"','" + o_info[7] + "')";
          button_html = '<a onclick="' + js +'" href="#"><i class="fas fa-file-download"></i></a>';
        }
        if (o_type.startsWith("KBaseFBA.FBA")) {
          let js = "kbase_load_fba('" + o_info[1] +"','" + o_info[7] + "')";
          button_html = '<a onclick="' + js +'" href="#"><i class="fas fa-file-download"></i></a>';
        }
        if (o_type.startsWith("KBaseFBA.FBAModel")) {
          let js = "biochemLoader.load_kbase('" + o_info[1] +"','" + o_info[7] + "')";
          button_html = '<a onclick="' + js +'" href="#"><i class="fas fa-file-download"></i></a>';
        }
        let row_data = [
          o_info[1],
          o_type,
          o_info[3],
          o_info[4],
          o_info[5],
          o_info[9],
          o_info[10],
          o_info[6] + '/' + o_info[0] + '/' + o_info[4],
          button_html
        ];
        rows.push(row_data)
      });
      table.clear();
      table.rows.add(rows).draw();
    })
  }
};

$('#show_narrative').click(function() {
  let workspace_id = $('#narrative').val();
  update_narrative_table(workspace_id, kbase_table);
});



let kbase_table = $("#table-kbase-narrative").DataTable();
let biochemLoader = undefined;

$(function() {
  console.log('index.js');

/*

  */
  //var biodb_server = 'http://192.168.1.10:8058';
  //var rest_end_point = biodb_server + '';

  //CORS
    /*
  $.ajaxPrefilter( function( options, originalOptions, jqXHR) {
    options.url = rest_end_point + options.url;
  });*/
  //$.getJSON("/seed/annotation/rxn/rxn00002", function(e) { console.log(e)})
  $('#export-button').click(function(e) {
    e.preventDefault();
    let exportNamespace = $('#export-namespace');
    let exportInputId = $('#export-in-id');
    let exportInputWorkspace = $('#export-in-ws');
    let exportOutputId = $('#export-out-id');
    let exportOutputWorkspace = $('#export-out-ws');
    let token = $('#export-token');

    let exportNamespaceVal = exportNamespace.val();
    let exportInputIdVal = exportInputId.val();
    let exportInputWorkspaceVal = exportInputWorkspace.val();
    let exportOutputIdVal = exportOutputId.val();
    let exportOutputWorkspaceVal = exportOutputWorkspace.val();
    let tokenVal = token.val();

    let valid = true;

    valid &= validate(function() {
      return tokenVal && tokenVal.length > 0;
    }, token);

    valid &= validate(function() {
      return exportNamespaceVal && exportNamespaceVal.length > 0;
    }, exportNamespace);

    valid &= validate(function() {
      return exportInputIdVal && exportInputIdVal.length > 0;
    }, exportInputId);

    valid &= validate(function() {
      return exportInputWorkspaceVal && exportInputWorkspaceVal.length > 0;
    }, exportInputWorkspace);

    valid &= validate(function() {
      return exportOutputIdVal && exportOutputIdVal.length > 0;
    }, exportOutputId);

    valid &= validate(function() {
      return exportOutputWorkspaceVal && exportOutputWorkspaceVal.length > 0;
    }, exportOutputWorkspace);

    if (valid) {
      let clear_reactions = $('#clear_template_reactions').is(':checked');
      let clear_opt = $("input[name='clear_role_complex']:checked").val();
      let clear_roles = false;
      let clear_complexes = false;
      if (clear_opt === 'cpx') {
        clear_complexes = true;
      } else {
        clear_roles = true;
      }
      let rxn_ids = undefined;
      let filter_reactions = $('#filter_reactions_to_map').is(':checked');
      if (filter_reactions) {
        rxn_ids = Object.values(widget_escher.escher_map[1].reactions).map(x => x['bigg_id'])
      }
      let button = $(this);
      button.attr("disabled","disabled");
      console.log(exportNamespaceVal, exportInputIdVal, exportInputWorkspaceVal, exportOutputIdVal,
        exportOutputWorkspaceVal, tokenVal);
      kbaseApi.post_export_template(exportNamespaceVal,
        exportInputIdVal, exportInputWorkspaceVal,
        exportOutputIdVal, exportOutputWorkspaceVal, tokenVal,
        clear_reactions, clear_roles, clear_complexes, rxn_ids,
        function(result) {
          console.log(result);
          button.removeAttr("disabled");
        },
        function() {
          button.removeAttr("disabled");
        },
        function() {
          button.removeAttr("disabled");
        });
    }
  });

  $('#settings-biochem-build').click(function () {
    let cmp_config_str = $('#settings-biochem-config').val();
    load_biochem_from_config(cmp_config_str, function () {
      alert('loaded!')
    })
  });

  env = new CurationEnvironment(api, [
    new WidgetSystemStatus($('#top_bar')),
    widget_escher]);
  env.load_config();
  env.init_ui();
  widget_escher_metadata.env = env;
  biochemLoader = new BiochemLoader(widget_escher, api, kbaseApi, env);
  // ui_tooltip_options must be called after env.load_config !
  ui_tooltip_options($('#fn-tooltip-options'), widget_escher, env);

  env.load_catalog(['ModelSEED', 'Test'], function(catalog) {
      let table = $("#table-escher-maps").DataTable();
      let rows = []
      _.each(catalog, function(map_list, dataset_id) {
          _.each(map_list, function(map_id) {
            //button_html = $('a', {'href' : '#'}).html('<span class="oi oi-eye"></span>')
              button_html = '<a href="#" onclick="load_escher_map(\'' + dataset_id +'\', \'' + map_id + '\');"><span class="oi oi-eye"></span></a>'
            
        let map_str = map_id
        if (map_id.indexOf(dataset_id) == 0) {
            map_str = map_id.substring(dataset_id.length + 1)
        }
          row_data = [
            dataset_id, 
            map_str, 
            '-', 
            '-', 
            button_html
          ];
          rows.push(row_data)
          });
      });
        
        table.rows.add(rows).draw();
      const default_map = 'data/ModelSEED/demo_map.json';
      const default_model = "data/ModelSEED2.json";
    //const default_map = 'data/iJB785_tnseq.json';
    //const default_model = "data/iJB785.json";
    //const default_model = "data/iML1515.json";
    //const default_map = "data/iML1515.PLP.JTBupdate_folates.json";

    const dataset = {
      'min' : -10,
      'max' : 10,
      'sets' : ['pdx', 'ygg'],
      'rxn' : {
        'METS' : {
          'b4019' : [-0.166631706, 0.13410056],
          'b3829' : [0.042837003, -0.17763861],
        },
        'AHCYSNS' : {
          'b0149' : [-0.555440311, -0.13048332699999998],
        }
      }
    };
    /*
            $.getJSON(default_model, function(model_data) {
                  //var a2 = document.getElementById("download_map");
        //a2.href = URL.createObjectURL(new Blob([JSON.stringify(e_map)]));
              //e_builder = escher.Builder(e_map, e_model, null, d3.select('#map_container'), e_options)
              //widget_escher.escher_builder = e_builder
              //widget_escher.change_model(model_data);


              d3.svg("data/reactome/R-ICO-012397.svg").then(function(xml) {
                xml.documentElement.setAttribute('width', '100');
                xml.documentElement.setAttribute('height', '100');
                d3.select("#n4").each(function(data) {
                  console.log(xml.documentElement);
                  d3.select(this).insert('g').attr('transform', 'translate('
                    + (data.x) + ','
                    + (data.y) + ')').node().appendChild(xml.documentElement);
                }).insert('g')
              });

            });
        */

    //let cmp_config = env.config['biochem_config'] || "0:";
    const auto_load = true;
    if (auto_load) {
      biochemLoader.load_env(function() {
        let b = widget_escher.escher_builder;
        if (env.config.default_map) {
          let map_id = env.config.default_map.split('/');
          load_escher_map(map_id[0], map_id[1]);
          b.settings.set_conditional('show_gene_reaction_rules', true);
          b.map.draw_everything();
        } else {
          console.log('default map not found. loading demo');
          $.getJSON(default_map, function(map_data) {
            widget_escher.change_map(map_data);
          });
        }
      });
    }

  });



  class TableMappingWidget {
    constructor(api, widget_escher) {
      this.api = api;
      this.widget_escher = widget_escher;
      this.table = undefined;
    }

    button_fn_cluster_report = function() {
      let that = this;
      this.api.post_escher_cluster({'escher_map': that.widget_escher.escher_map, 'grid': []}, function(data) {
        data['databases'] = ['seed.compound'];
        that.table = new TableCompoundMapping($('#container-cpd-mapping-table'), data, that.api);
        that.table.load_stuff();
      })
    };

    button_fn_cluster_accept = function() {
      this.api.post_bios_model_species_mapping(this.table.get_selected_mappings(), 5, 'fliu', function() {
        alert('ok!')
      })
    }
  }
  table_mapping_widget = new TableMappingWidget(api, widget_escher);

  api.get_bios_model_list(function(model_list) {

    const manual_groups = {
      'all_fungi' : [
        'iNL895',
        'iCT646',
        'iMM904',
        'iTO977',
        'iSS884',
        'iLC915',
        'iWV1213',
        'iAL1006',
        'iRL766',
        'iMA871',
        'iJDZ836',
        'iWV1314',
        'iOD907',
        'iJL1454',
        'iNX804',
        'yeast_6.06',
        'yeast_7.6'
      ],
    };

    let model_options = [];
    _.each(model_list, function(m) {
      //console.log(m);
      if (!m['proxy']) {
        let text = m['entry']
        if (m['bios_tax_lineage']) {
          text += ' (' + m['bios_tax_lineage'][1] + '; ' +  m['bios_tax_lineage'][0] + ')'
        } else {
          text += ' (?)'
        }
        model_options.push({
          id : m['entry'], text : text
        });
      }
    });

    let cmp_model_options = [];
    const select_model_comp = $("#select_model_cmp").select2({
      width: '100%',
      placeholder: "Select SBML compartment",
      multiple: true,
      allowClear: true,
      maximumSelectionLength: 2,
      data: cmp_model_options,
      disabled : false,
    });

    const select_model = $("#select_model").select2({
      width: '100%',
      multiple: true,
      allowClear: true,
      maximumSelectionLength: 1,
      placeholder: 'Select an option',
      data: model_options
    });

    var get_model_data = function(model_id, cb) {
      $.getJSON('/annotation/api/model/' + model_id + '/cmp',function(d) {
        //e_model = model_data;
        //e_builder.load_model(e_model, true);
        cb(d);
      });
    };

    select_model.on('select2:select', function (e) {
      let data = e.params.data;
      select_model_comp.empty();
      select_model_comp.prop('disabled', false);
      if (manual_groups[data.id]) {
        select_model_comp.append(new Option('Match Standard Compartment', '*', true, true));
      } else {
        get_model_data(data.id, function(model_data) {
          _.each(model_data, function(o) {
            //console.log(o);
            let t = o.name + ' (' + o.id + ')';
            select_model_comp.append(new Option(t, o.id, false, false));
          });
          //console.log(model_data);
        });
      }
    });
    //console.log(select_model)

    $('#load_sbml_model').click(function() {
      let model_id = undefined;
      _.each(select_model.children(), function(opts) {
        if (opts.selected) {
          model_id = opts.value;
        }
      });

      if (model_id) {
        biochemLoader.load_bios(model_id);
      } else {
        alert('select a model first')
      }
    });

  })
});
//
// DEBUG TRASH TO BE REMOVED
let mapLoader = new MapLoader(widget_escher, api, kbaseApi, env);

let DEBUG_adapt_cmp = 'c0';
$('#btn_test2').click(function() {
  let base_map_copy = JSON.parse(JSON.stringify(widget_escher.base_map));
  widget_escher.change_map(base_map_copy);
});

$('#btn_test1').click(function() {
  widget_escher.base_map = JSON.parse(JSON.stringify(widget_escher.escher_map));
  draw_shadow_map(widget_escher.base_map, 0, 0);
  let ema = new EscherMapAdapter(widget_escher.escher_map);
  let uid = ema.adaptToModel(widget_escher.escher_model, DEBUG_adapt_cmp);
  let uidNodes = uid[0];
  let uidReactions = uid[1];
  widget_escher.escher_builder.map.delete_node_data(uidNodes);
  widget_escher.escher_builder.map.delete_reaction_data(uidReactions);
  widget_escher.escher_builder.map.convert_map();
  widget_escher.escher_builder.map.draw_everything();
  //widget_escher.escher_builder.map.save()
});

$('#btn_test3').click(function() {
  widget_escher_metadata.display_annotation()
});

$('#btn_test4').click(function() {
  widget_escher_metadata.display_ec()
});

$('#btn_test5').click(function() {
  widget_escher_optimization.display(widget_escher_optimization.map_net_conversion())
});

$('#btn_test6').click(function() {
  let escherDesign = new EscherDesign(widget_escher.escher_builder);
  escherDesign.init_ui();
});
