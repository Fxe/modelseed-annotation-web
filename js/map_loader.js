const get_shadow_grid_layout = function(canvas, config) {
  let shadow_grid_layout = {};
  let w = canvas.width / config.x;
  let h = canvas.height / config.y;

  let index = 0;
  for (let xx = 0; xx < config.y; xx++) {
    for (let yy = 0; yy < config.x; yy++) {
      if (config.maps[index]) {
        let map_config = config.maps[index].split(';')
        let map_id = map_config[3];
        if (!shadow_grid_layout[map_id]) {
          shadow_grid_layout[map_id] = [];
        }
        shadow_grid_layout[map_id].push([yy, xx, w, h, map_config[2]]);
      }
      index++;
    }
  }

  return shadow_grid_layout
};

class MapLoader {

  constructor(widgetEscher, api, apiKbase, env) {
    console.log("MapLoader", widgetEscher, api, apiKbase, env);
    this.widgetEscher = widgetEscher;
    this.api = api;
    this.apiKbase = apiKbase;
    this.env = env;
  }

  load_env(fn_success, fn_error) {
    if (this.env.config && this.env.config.default_map) {

    }
  }

  page_change_map = function(escher_map, dataset_id, map_id, adapt_model=false) {
    if (adapt_model) {
      let adapter = new EscherMapAdapter(escher_map);
      adapter.adaptToModel(this.widgetEscher.escher_model);
    }
    this.widgetEscher.change_map(escher_map);
    this.widgetEscher.toggle_display();
    $('#label_map').html(map_id);
    this.env.set_config_property('default_map', dataset_id + '/' + map_id);
  };

  load_background_map(map_data, map_id) {
    //let values = $.map($('#select_build_list option') ,function(option) { return option.value;});
    let build_config = {
      maps : ['model_id;model_cmp;target_cmp;' + map_id],
      x : 1,
      y : 1
    };
    let current_canvas = map_data[1].canvas;
    let current_grid_layout = get_shadow_grid_layout(map_data[1].canvas, build_config);
    draw_show_grid_layout(current_grid_layout, api);
    return current_grid_layout
  }

  load_modelseed(dataset_id, map_id, adapt_model, fn_success) {
    let that = this;
    let map = undefined;
    if (this.env['config'] && this.env['config']['biochem_config']) {
      this.api.post_get_refit_map(map_id, dataset_id, this.env['config']['biochem_config'], null, function(escher_map) {
        that.page_change_map(escher_map, dataset_id, map_id, adapt_model);
      })
    } else {
      this.api.get_escher_map(dataset_id, map_id, function(escher_map) {
        that.page_change_map(escher_map, dataset_id, map_id, adapt_model);
      })
    }

  }

  load_file() {
    draw_show_grid_layout(get_shadow_grid_layout(current_canvas, current_build_config), api);
  }
}