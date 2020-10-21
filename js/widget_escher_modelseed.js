var load_model = function(map_path, cb) {
  $.getJSON(map_path, function(model_data) {
    e_model = model_data;
    //e_builder.load_model(e_model, true);
    cb(model_data)
  });
};

const default_tooltip = function(args) {
  tinier.render(
    args.el,
    tinier.createElement(
      'div',
      { style: tooltip_style, id: 'tooltip_container'},
      args.state.type + ': ' + args.state.biggId,

      tinier.createElement(
        'br'
      ),
      tinier.createElement(
        'b',
        {},
        args.state['name']
      ),
    ),
  );
}




class WidgetEscherModelseed {

  constructor(container, map_container, e_options, has_modelselect = true, has_display_toggle = true, plugins = []) {

    this.escher_map = null;
    this.model = null;
    this.escher_model = null;
    this.submodels = {}
    this.biochem = null;
    this.toggle_escher_label = null;
    this.escher_builder = escher.Builder(null, null, null, map_container, e_options);
    this.escher_builder.options.cofactors = [
      "atp", "adp", "nad", "nadh", "nadp", "nadph", "gtp", "gdp", "h", "coa", "ump", "h2o", "ppi", "akg",
      "cpd00001", "cpd00013", "cpd00067", //h2o, nh4, h+
      "cpd00005", "cpd00004", "cpd00006", "cpd00003", //nad
      "cpd00008", "cpd00002", //adp, atp
      "cpd00009", "cpd00012", //pi, ppi
      "cpd00017", "cpd00019", //sam,amet
      "cpd00010", //coa
      "cpd00015", "cpd00982", //fad, fadh2
      "cpd11620", "cpd11621", //red, ox ferredoxin
    ]
    this.container = container;
    this.escher_display = "bigg_id"
    this.options = {
      'z' : 'Generic',
      'c' : 'Cytosol',
      'm' : 'Mitochondria',
      //'e' : 'Extracellular',
      'c_e' : 'Cytosol > Extracellular',
      'c_m' : 'Cytosol > Mitochondria',
      'm_c' : 'Mitochondria > Cytosol',
    };
    this.options_path = {
      'z' : 'data/ModelSEED2.json',
      'c' : 'data/TempModels/seed_c.json',
      'm' : 'data/TempModels/seed_m.json',
      //'e' : 'data/TempModels/seed_e.json',
      'c_e' : 'data/TempModels/seed_c_e.json',
      'c_m' : 'data/TempModels/seed_c_m.json',
      'm_c' : 'data/TempModels/seed_m_c.json',
    };
    this.plugins = plugins;

    this.has_modelselect = has_modelselect;

    this.has_display_toggle = has_display_toggle;
    this.diplay_ids = true;
    console.log('loading plugins...')
    let that = this;
    _.each(this.plugins, function(p) {
      p.set_escher_widget(that);
    });

    this.fn_tooltip_options = {
      'compound' : {
        'default' : default_tooltip
      },
      'reaction' : {
        'default' : default_tooltip
      },
      'gene' : {
        'default' : default_tooltip
      }
    }

    this.tooltip = {
      'fn_tooltip_cpd': default_tooltip,
      'fn_tooltip_rxn': default_tooltip,
      'fn_tooltip_gene': default_tooltip
    };
  }



  get_map_pathway_data() {
    if (this.escher_map && this.escher_map[0].metadata && this.escher_map[0].metadata.pathways) {
      return this.escher_map[0].metadata.pathways
    }
    /*
    let pwy_data = {
      'pw1' : {
        'name' : 'the parent pathway !',
        'rxns' : ['rxn00459', 'rxn00153', 'rxn00004', 'rxn00250', 'rxn00266'],
        'childs' : {
          'pwy2' : {
            'name' : 'sub branch !',
            'rxns' : ['rxn00250', 'rxn00266'],
            'childs' :{}
          }
        },
      }
    }

     */
    return {};
  }

  get_rxn_to_uid() {
    let rxn_to_uid = {}
    _.each(this.escher_builder.map.reactions, function(rxn, uid) {
      if (!rxn_to_uid[rxn.bigg_id]) {
        rxn_to_uid[rxn.bigg_id] = {}
      }
      rxn_to_uid[rxn.bigg_id][uid] = true
    })
    return rxn_to_uid
  }

  change_map(map) {
    let that = this;
    if (this.escher_builder && map) {
      this.escher_map = map;
      this.escher_builder.load_map(map, true);
      _.each(this.plugins, function(p) {
        p.refresh(that);
      });
    }
  }

  get_submodel(rxn_filter) {
    if (!this.model) {
      this.model = this.escher_model;
    }
    let escher_model_copy = JSON.parse(JSON.stringify(this.model));
    let rxns = _.filter(this.model.reactions, function(o) { return rxn_filter.indexOf(o.id) >= 0})
    escher_model_copy.reactions = rxns;

    return escher_model_copy;
  }

  load_submodel(rxn_filter) {
    if (!rxn_filter) {
      this.change_model(this.model)
    } else {
      let submodel = this.get_submodel(rxn_filter)
      this.change_model(submodel)
    }
  }

  change_model(model) {
    let that = this;
    if (this.escher_builder && model) {
      this.escher_model = model;
      this.escher_builder.load_model(this.escher_model, true);
      _.each(this.plugins, function(p) {
        p.refresh(that);
      });
    }
  }

  update() {

  }

  toggle_display() {
    this.escher_builder.settings.set_option('identifiers_on_map', this.escher_display);
    this.escher_builder.map.draw_everything()
  }

  toggle_label() {
    this.diplay_ids = !this.diplay_ids
    if (this.diplay_ids) {
      this.escher_display = "bigg_id"
      this.toggle_display()
    } else {
      this.escher_display = "name"
      this.toggle_display()
    }
  }
    
  load_catalog(dataset_id_list, fn_success) {
      load_catalog_it(dataset_id_list, {}, fn_success)
  }
    
  load_catalog_it(dataset_id_list, catalog_result, fn_success) {
      if (dataset_id_list.length > 0) {
        let dataset_id = dataset_id_list.pop()
        
        this.api.get_escher_map_list(dataset_id, function(res) {
            catalog_result[dataset_id] = res;
            this.load_catalog_it(dataset_id_list, catalog_result, cb)
        })
    } else {
        if (fn_success) {
            fn_success(catalog_result);
        }
    }
  }

  init_container() {
    let that = this;

    if (this.container) {
      if (this.has_modelselect) {
        let el_select = $('<select>', {});
        _.each(this.options, function(text, value) {
          el_select.append(new Option(text, value, false, false));
        });
        this.container.append($('<label>', {}).html('Biochemistry: '))
          .append(el_select);
        el_select.select2();
        el_select.on('select2:select', function (e) {
          let data = e.params.data;
          load_model(that.options_path[data.id], function(model_data) {
            console.log('changed to', data.id);
            that.change_model(model_data);
            that.update();
          });
        });
      }

      if (this.has_display_toggle) {
        this.toggle_escher_label = $('<button>', {'class' : 'btn btn-seed-sm btn-dark'}).append(
          $('<i>', {'class' : 'fas fa-eye'}).html(' ID'));
        this.toggle_escher_label.click(function(e) {
          //should be on update
          if (that.diplay_ids) {
            $(this).html('<i class="fas fa-eye"> Name</i>');
          } else {
            $(this).html('<i class="fas fa-eye"> ID</i>');
          }
          that.toggle_label();
        })

        this.container.append(' Display: ')
          .append(this.toggle_escher_label);
      }
    }

    _.each(this.plugins, function(p) {
      p.init_container();
    });

  }
}