
const LOCALSTORAGE_KEY = 'config';

class CurationEnvironment {

  constructor(api, ui) {
    this.modelInfo = undefined
    this.config = null;
    this.server_status = null;
    this.api = api;
    this.ui = ui || [];


    let that = this;
    if (this.api) {
      this.api.get_server_status(function(e) {
        that.server_status = e;
        that.update_ui();
      }, undefined, function (e) {
          alert('unable to connect to server.')
        });
    }
  }

  load_catalog(catalog_dataset, fn_success, result={}) {
    let that = this;
    if (catalog_dataset.length > 0) {
      let dataset_id = catalog_dataset.pop()

      that.api.get_escher_map_list(dataset_id, function(res) {
        result[dataset_id] = res;
        that.load_catalog(catalog_dataset, fn_success, result)
      })
    } else {
      fn_success(result);
    }
  }

  load_escher_map = function(dataset_id, map_id) {
    console.log('load_escher_map', dataset_id, map_id);
    if (this.config && this.config['biochem_config']) {
      this.api.post_get_refit_map(map_id, dataset_id, env['config']['biochem_config'], null, function(escher_map) {
        page_change_map(escher_map, dataset_id, map_id);
      })
    } else {
      this.api.get_escher_map(dataset_id, map_id, function(escher_map) {
        page_change_map(escher_map, dataset_id, map_id);
      })
    }
  };

  init_catalog_table(tableId, catalog) {
    let table = $("#" +  tableId).DataTable();
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
  }

  init_ui() {
    let that = this;
    this.ui.forEach(function(w) {
      w.init_container(that);
    });
  }

  update_ui() {
    let that = this;
    this.ui.forEach(function(w) {
      w.update(that);
    });
  }

  save_model(model, dataset_id, model_id) {
    if (confirm("Save " + dataset_id + ": " + model_id)) {
      alert('failed: function not implemented :)')
    }
  }

  save_map(map, dataset_id, map_id) {
    if (confirm("Save " + dataset_id + ": " + map_id)) {
      this.api.post_escher_map_save(map, dataset_id, map_id, this.config['user'], function(o) {
        console.log('fn_success', o)
      })
    }
  }
    
  reset_config() {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    this.load_config();
  }

  load_config() {
    this.config = this.load_config_from_localstorage();
    if (!this.config['user']) {
      console.log('[user] not set');
      this.config['user'] = prompt("Please enter your username", "curator_1");
    }
    if (!this.config['genome_set']) {
      console.log('[genome_set] not set');
    }
      
    this.save_config_to_localstarage();
    this.update_ui();
  }

  set_config_property(prop, value) {
    let cfg = this.load_config_from_localstorage();
    cfg[prop] = value
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cfg))
    this.load_config();
  }

  set_config_template_id(template_id) {
    this.set_config_property('target_template', template_id)
  }

  set_tooltip(t, value) {
    let cfg = this.load_config_from_localstorage();
    if (!cfg['tooltip']) {
      cfg['tooltip'] = {
        'compound': 'default',
        'reaction': 'default',
        'gene': 'default'
      }
    }
    cfg['tooltip'][t] = value
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cfg))
    this.load_config();
  }

  load_config_from_localstorage() {

    let cfg = {
      'user' : null,
      'genome_set' : null,
      'target_template' : 'fungi',
      'kbase_token' : null,
      'default_map' : null,
      'default_model' : null,
      'tooltip' : {
        'compound': 'default',
        'reaction': 'default',
        'gene': 'default'
      }
    }

    if (!localStorage.getItem(LOCALSTORAGE_KEY)) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cfg))
    }

    return JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY))
  }

  save_config_to_localstarage() {
    if (this.config) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.config))
    }

    return this.config;
  }
}

