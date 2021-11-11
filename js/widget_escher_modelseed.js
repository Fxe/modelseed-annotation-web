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
    this.maps = [];
    this.layer = [];
    this.activeLayer = undefined;
    this.model = null;
    this.escher_model = null;
    this.submodels = {};
    this.biochem = null;
    this.toggle_escher_label = null;
    this.fn_draw_underlay = undefined;
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
    ];
    this.container = container;
    this.escher_display = "bigg_id";
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
    };

    this.tooltip = {
      'fn_tooltip_cpd': default_tooltip,
      'fn_tooltip_rxn': default_tooltip,
      'fn_tooltip_gene': default_tooltip
    };
  }

  colorCompartment(w_panel, colorConfig) {
    const colorCompartmentConfig = {
      "[\"c0\",\"m0\"]": 'rgb(255, 0, 0)',
      "[\"c0\",\"e0\"]": 'rgb(255,162,10)',
      "[\"c0\",\"r0\"]": 'rgb(184,123,255)',
      "[\"c0\",\"x0\"]": 'rgb(108,108,108)',
      "[\"c0\"]": 'rgb(0,102,0)',
      "[\"x0\"]": 'rgb(59,59,59)',
      "[\"m0\"]": 'rgb(153, 0, 0)',
      "[\"e0\"]": 'rgb(204, 204, 0)',
      "[\"r0\"]": 'rgb(105,11,204)',
    };
    if (!colorConfig) {
      colorConfig = colorCompartmentConfig
    }
    let rxn_cmp = {};
    let met_cmp = {};
    let rxn_is_transport = {};
    _.each(this.escher_model.metabolites, function(met) {
      if (met && met.id && met.compartment) {
        met_cmp[met.id] = met.compartment;
      }
    });
    _.each(this.escher_model.reactions, function(rxn) {
      rxn_cmp[rxn.id] = {};
      _.each(rxn.metabolites, function(stoich_val, met_id) {
        if (met_cmp[met_id]) {
          rxn_cmp[rxn.id][met_cmp[met_id]] = true;
        }
      });
      rxn_is_transport[rxn.id] = _.size(rxn_cmp[rxn.id]) > 1
    });
    let rxn_to_uid = this.get_rxn_to_uid();
    _.each(this.escher_map[1].reactions, function(escher_rxn, rxn_uid) {
      let rxn_id = escher_rxn['bigg_id'];
      if (rxn_cmp[rxn_id]) {
        let is_transport = rxn_is_transport[rxn_id];
        if (rxn_to_uid[rxn_id]) {
          _.each(rxn_to_uid[rxn_id], function(v, uid) {
            let svg_uid = 'r' + uid;
            if (is_transport) {
              w_panel.paint_reaction_path(svg_uid, {'stroke-dasharray' : '30 10'});
            }
            let m = JSON.stringify(_.keys(rxn_cmp[rxn_id]).sort());
            if (colorConfig[m]) {
              w_panel.paint_reaction_path(svg_uid, {'stroke' : colorConfig[m]});
              w_panel.paint_reaction_label(svg_uid, {'fill': colorConfig[m]})
            } else {
              console.log(m);
            }
            //== "[\"c0\",\"m0\"]"

            //
          });
        }
      }
    });
  };


  load_map(fn_load, layer_number) {
    let that = this;
    fn_load(function(escher_map) {
      that.load_map_to_layer(escher_map, layer_number);
      that.render()
    })
  }

  getGlobalCanvas() {
    let xs = [];
    let ys = [];
    _.each(this.maps, function(em) {
      let x = em[1]['canvas']['x'];
      let y = em[1]['canvas']['y'];
      let w = em[1]['canvas']['width'];
      let h = em[1]['canvas']['height'];
      xs.push(x);
      xs.push(x + w);
      ys.push(y);
      ys.push(y + h);
    });

    let xMin = Math.min(...xs);
    let xMax = Math.max(...xs);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);
    return {x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin}
  }

  build_map_layer_control($, ct, layer_index, label_value, fnSave) {
    let that = this;
    let control_group = $('<div>');

    let radio = $('<input>', {type: 'radio', id: 'radio1', name: 'escher-map-radio'});
    radio.change(
      function(){
        if ($(this).is(':checked')) {
          that.activeLayer = layer_index;
          that.escher_map[1].canvas = {
            height: that.escher_builder.map.canvas.height,
            width: that.escher_builder.map.canvas.width,
            x: that.escher_builder.map.canvas.x,
            y: that.escher_builder.map.canvas.y
          };
          that.escher_map = undefined;
          that.render();
          //console.log(layer_index);
        }
      });
    let icon_eye = $('<i>', {class: 'fas fa-eye'});

    let icon_delete = $('<i>', {class: 'fas fa-trash-alt'});
    icon_delete.click(function() {
      if (confirm('Remove layer: ' + label_value)) {
        if (that.activeLayer === layer_index) {
          alert('cannot remove active layer');
        } else {
          that.maps[layer_index] = undefined;
          that.render();
          control_group.remove();
        }
      }
    });
    let icon_save = $('<i>', {class: 'fas fa-save'});
    if (fnSave) {
      icon_save.click(fnSave);
    }

    let label = $('<label>', {for: 'radio1'}).html(label_value);

    let toggle_visible = $('<label>', {'class': 'switch'});
    toggle_visible.append($('<input>', {'type': 'checkbox', checked: 'checked'}));
    toggle_visible.append($('<span>', {'class': 'slider round'}));

    control_group.append(layer_index).append(radio).append(' ')
      .append(icon_eye).append(' ')
      .append(toggle_visible).append(' ')
      .append(icon_save).append(' ')
      .append(icon_delete).append(' ')
      .append(label);

    ct.append(control_group);
    control_group.label = label_value;
    control_group.fnSave = fnSave;

    return control_group;
  };

  deleteLayer(layerNumber) {
    if (this.layer[layerNumber]) {
      this.layer[layerNumber].remove();
      this.layer[layerNumber] = undefined;
    }
    if (this.maps[layerNumber]) {
      this.maps[layerNumber] = undefined;
    }
  }

  load_map_to_layer(map, layer_number, label_value, fnSave, render=false) {
    if (!this.activeLayer) {
      this.activeLayer = layer_number;
    }
    let controlGroup = this.build_map_layer_control($, $('#left_panel'), layer_number, label_value, fnSave);
    this.layer[layer_number] = controlGroup;
    this.maps[layer_number] = JSON.parse(JSON.stringify(map));
    if (render) {
      this.render();
    }
  }

  flip(layer_number) {
    if (this.maps[layer_number]) {
      let t = this.maps[layer_number];
      this.maps[layer_number] = widget_escher.escher_map;
      this.escher_map = t;
      this.render()
    }
  }

  render() {

    console.log('render', this.escher_map);

    if (!this.escher_map) {
      console.log('render check active layer', this.activeLayer);
      if (this.maps[this.activeLayer]) {
        this.escher_map = this.maps[this.activeLayer]
      }
    }
    if (this.escher_map) {
      console.log('render', this.escher_map);
      this.change_map(this.escher_map);
      if (this.fn_draw_underlay) {
        for (let i=0; i<this.maps.length; i++) {
          if (i !== this.activeLayer && this.maps[i]) {
            console.log('draw underlay', i);
            this.fn_draw_underlay(this.maps[i], 0, 0);
          }
        }
      }

    } else {
      alert('no map loaded')
    }
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