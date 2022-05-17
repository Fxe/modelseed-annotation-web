
class ModelSEEDEscherApp {

  constructor(widgetEscher, modalMapSelect, modalModelSelect, modalSettings, topBar) {
    console.log("ModelSEEDEscherApp", widgetEscher, modalMapSelect, modalModelSelect, modalSettings, topBar);
    this.widgetEscher = widgetEscher;
    this.modalMapSelect = modalMapSelect;
    this.modalModelSelect = modalModelSelect;
    this.modalSettings = modalSettings;
    this.topBar = topBar;
    this.dtEscherMaps = undefined;
    this.mapLabel = undefined;
    this.modelLabel = undefined;
    this.curationApi = undefined;

    this.toggleEscherKeyManager(this.modalMapSelect);
    this.toggleEscherKeyManager(this.modalModelSelect);
    this.toggleEscherKeyManager(this.modalSettings);
  }

  pageChangeMap(escher_map, dataset_id, map_id) {
    this.widgetEscher.change_map(escher_map);
    this.widgetEscher.toggle_display();
    this.mapLabel.html(map_id);
    this.env.set_config_property('default_map', dataset_id + '/' + map_id);
  };

  loadEscherMap(dataset_id, map_id) {
    let that = this;
    console.log('load_escher_map', dataset_id, map_id);
    if (this.env['config'] && this.env['config']['biochem_config']) {
      this.curationApi.post_get_refit_map(map_id, dataset_id, env['config']['biochem_config'], null, function(escher_map) {
        that.pageChangeMap(escher_map, dataset_id, map_id);
      })
    } else {
      this.curationApi.get_escher_map(dataset_id, map_id, function(escher_map) {
        that.pageChangeMap(escher_map, dataset_id, map_id);
      })
    }
  };

  init() {
    this.env = new CurationEnvironment(api, [
      new WidgetSystemStatus(this.topBar),
      this.widgetEscher
    ]);
    this.env.load_config();
    this.env.init_ui();
  }

  toggleEscherKeyManager(modal) {
    if (modal) {
      let that = this;
      modal.on('hide.bs.modal', function (e) {
        if (that.widgetEscher) {
          that.widgetEscher.escher_builder.map.key_manager.toggle(true)
        }
      });
      modal.on('show.bs.modal', function (e) {
        if (that.widgetEscher) {
          that.widgetEscher.escher_builder.map.key_manager.toggle(false)
        }
      });
    }
  }

  loadModelSEEDMapCatalog(datasetList) {
    let that = this;
    if (this.dtEscherMaps) {
      this.env.load_catalog(datasetList, function(catalog) {
        let table = that.dtEscherMaps.DataTable();
        let rows = [];
        _.each(catalog, function(map_list, dataset_id) {
          _.each(map_list, function(map_id) {
            let button_html = '<a href="#" onclick="load_escher_map(\'' + dataset_id +'\', \'' + map_id + '\');"><span class="oi oi-eye"></span></a>'

            let map_str = map_id;
            if (map_id.indexOf(dataset_id) === 0) {
              map_str = map_id.substring(dataset_id.length + 1)
            }
            rows.push([
              dataset_id,
              map_str,
              '-',
              '-',
              button_html
            ])
          });
        });

        table.rows.add(rows).draw();
        const default_map = 'data/ModelSEED/demo_map.json';
        const default_model = "data/ModelSEED2.json";
        const auto_load = true;
        if (auto_load) {
          biochemLoader.load_env(function() {
            let b = this.widgetEscher.escher_builder;
            if (this.env.config.default_map) {
              let map_id = this.env.config.default_map.split('/');
              load_escher_map(map_id[0], map_id[1]);
              b.settings.set_conditional('show_gene_reaction_rules', true);
              b.map.draw_everything();
            } else {
              console.log('default map not found. loading demo');
              $.getJSON(default_map, function(map_data) {
                that.widgetEscher.change_map(map_data);
              });
            }
          });
        }
      });
    }

  }
}