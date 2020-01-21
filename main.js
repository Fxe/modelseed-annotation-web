/* global d3, escher */

var tinier = escher.libs.tinier
var tooltip_style = {
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

const tooltip_metabolite = function(args) {
  tinier.render(
    args.el,
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style, id: 'tooltip_container'},
      'Metabolite',

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
  let cpd_id = biochem_api.detect_id(args.state.biggId);
  biochem_api.get_compound(cpd_id, null, function (data) {
    if (data && data.smiles) {
      chem_api.get_depict(data.smiles, 'smi', {}, function(svg_data) {
        //console.log(data);
        //console.log(svg_data);
        render_tooltip_compound({'seed.compound' : cpd_id}, data, svg_data, $('#tooltip_container'));
      });
    } else {
      render_tooltip_compound({'seed.compound' : cpd_id}, data, "", $('#tooltip_container'));
    }

  });
  //console.log(biochem_api.detect_id(args.state.biggId));
  //render_tooltip_compound();
};



const tooltip_reaction = function(args, ids) {
  /*
  rxn = model_rxns[0]

  if (rxn && rxn['dblinks'] && rxn['dblinks']['seed.reaction']) {
    _.each(rxn['dblinks']['seed.reaction'], function(seed_id) {
      seed_ids.push(seed_id)
    })
  }
  */
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
          href: 'view_annotation.html?rxn=' + args.state.biggId,
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
/*
      '!!!',

      tinier.createElement(
        'br'
      ),
      tinier.createElement(
        'b',
        {},
        'NO SEED ID'
      ),
      // Update the text to read out the identifier biggId
      '' //JSON.stringify(args.state)

 */
    ),
  );
  if (ids.length > 0) {
    reaction_tooltip.ttt2(ids, env.config['target_template'], env.config['genome_set']);
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
  if (reaction_tooltip.is_busy()) {
    console.log('reaction_tooltip', reaction_tooltip.is_busy());
    return
  }
  let map_rxn_id = args.state.biggId;
  let model_rxns = _.filter(e_model.reactions, function(x) {return x.id === map_rxn_id});
  let seed_ids = [];

  if (args.state.type === 'reaction' && args.state.biggId.startsWith("rxn")) {
    seed_ids.push(args.state.biggId)
  }

  //console.log(seed_ids, args.state);

  if (args.state.type === 'metabolite') {
    tooltip_metabolite(args)
  } else if (args.state.type === 'reaction') {
    tooltip_reaction(args, seed_ids);
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

var load_escher_map = function(dataset_id, map_id) {
    console.log('load_escher_map', dataset_id, map_id)
    api.get_escher_map(dataset_id, map_id, function(escher_map) {
        e_map = escher_map
        e_builder = escher.Builder(escher_map, e_model, null, d3.select('#map_container'), e_options)
    })
    
    /*
    $.getJSON(map_src, function(map_data) {
        e_map = map_data
        e_builder = escher.Builder(e_map, e_model, null, d3.select('#map_container'), e_options)
    })
    */
}

const load_catalog = function(catalog_dataset, result, cb) {
    
    if (catalog_dataset.length > 0) {
        let dataset_id = catalog_dataset.pop()
        
        api.get_escher_map_list(dataset_id, function(res) {
            result[dataset_id] = res;
            load_catalog(catalog_dataset, result, cb)
        })
    } else {
        cb(result);
    }
    /*
    let catalog_dataset = ['ModelSEED', 'BIOS']
    
    $.getJSON("data/catalog.json", function(catalog) {
        e_catalog = catalog
        cb()
    })*/
}

var e_catalog;
var e_model;
var e_map;
var e_builder;
var e_options;
var cfg;
// Fun this code after the page loads
var cloud_status = false
var server_status = false

var load_config = function() {
  cfg = get_config()
  if (!cfg['user']) {
      cfg['user'] = prompt("Please enter your username", "curator_1");
      localStorage.setItem('config', JSON.stringify(cfg))
  }
  if (!cfg['genome_set']) {
      
      console.log('genome_sets', server_status)
      if (server_status) {
          console.log('genome_sets')
          list_genome_sets(function(e) {
              if (e.indexOf('ModelSEED2') >= 0) {
                  cfg['genome_set'] = 'ModelSEED2'
              }
              localStorage.setItem('config', JSON.stringify(cfg))
              
          })
          
      }
      //cfg['genome_set'] = prompt("Please enter your username", "curator_1");
      
  }

  $('#label_genome_set').html(cfg['genome_set'])
  get_genome_set(cfg['genome_set'], function(e) {
      $('#label_genome_set').html(cfg['genome_set'] + '(' + e['genomes'].length + ')')
  })
  $('#label_user').html(cfg['user'])
  $('#label_target_template').html(cfg['target_template'])
    
  return cfg;
}

var label_ids = true;

var toggle_label = function() {
  label_ids = !label_ids
  if (label_ids) {
    e_builder.settings.set_option('identifiers_on_map', 'bigg_id')
  } else {
    e_builder.settings.set_option('identifiers_on_map', 'name')
  }
  e_builder.map.draw_everything()
}

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

$(function() {

/*
  $('#display_toggle').click(function(e) {
    if (label_ids) {
      $(this).html('<i class="fas fa-eye"></i> Name')
    } else {
      $(this).html('<i class="fas fa-eye"></i> ID')
    }
    toggle_label()
  })
    
  get_server_status(function(e) {
      if (e['server']) {
          var label = $('#label_server_status') 
          label.removeClass("badge-danger")
          label.addClass("badge-success")
          label.html('alive')
      }
      if (e['neo4j']) {
          var label = $('#label_database_status')
          label.removeClass("badge-danger")
          label.addClass("badge-success")
          label.html('alive')
          server_status = true;
      }
      if (e['mongo_atlas']) {
          var label = $('#label_cloud_status')
          label.removeClass("badge-danger")
          label.addClass("badge-success")
          label.html('alive')
      }
      console.log(e)
      cfg = load_config()
  }).fail(function(e) {
      console.log(':(')
  })
  */
  //var biodb_server = 'http://192.168.1.10:8058';
  //var rest_end_point = biodb_server + '';

  //CORS
    /*
  $.ajaxPrefilter( function( options, originalOptions, jqXHR) {
    options.url = rest_end_point + options.url;
  });*/
  //$.getJSON("/seed/annotation/rxn/rxn00002", function(e) { console.log(e)})
    
  load_catalog(['ModelSEED'], {}, function(catalog) {
      console.log(catalog);
      //first time table init
      var table = $("#table-escher-maps").DataTable();
      
        rows = []
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
      /*
        for (map_id in e_catalog) {
          map_data = e_catalog[map_id]
          button_html = '<a href="#" onclick="load_escher_map(\'' + map_data["src"] +'\');"><span class="oi oi-eye"></span></a>'
          row_data = [
            map_id, 
            '-', 
            '-', 
            '-', 
            button_html
          ];
          //rows.push(row_data)
        }*/
        
        table.rows.add(rows).draw();
      
      $.getJSON("data/ModelSEED/demo_map.json", function(map_data) {

        $.getJSON("data/ModelSEED2.json", function(model_data) {
          e_model = model_data
          e_map = map_data
          
              var a2 = document.getElementById("download_map");
    a2.href = URL.createObjectURL(new Blob([JSON.stringify(e_map)]));
          
          e_options = {
            //menu: '',
            fill_screen: false,
            tooltip_component: tooltip,
          }
          e_builder = escher.Builder(e_map, e_model, null, d3.select('#map_container'), e_options)
        });
      })
  })


  env = new CurationEnvironment(api, [new WidgetSystemStatus($('#top_bar'))]);
  env.load_config()
  env.init_ui()
});
