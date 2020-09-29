
const LOCALSTORAGE_KEY = 'config';

class CurationEnvironment {

  constructor(api, ui) {
    this.config = null;
    this.server_status = null;
    this.api = api;
    this.ui = ui || [];

    let that = this;
    if (this.api) {
      this.api.get_server_status(function(e) {
        that.server_status = e;
        that.update_ui();
      });
    }
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

  load_config_from_localstorage() {

    let cfg = {
      'user' : null,
      'genome_set' : null,
      'target_template' : 'fungi',
      'kbase_token' : null,
      'default_map' : null,
      'default_model' : null,
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

