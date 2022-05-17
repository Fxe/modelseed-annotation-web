
class ModelSEEDEscherIOWidget {

  constructor(mapSelectMSTab, mapSelectKBaseTab, modelSelectMSTab, modelSelectKBaseTab, selectKBaseWorkspace, selectKBaseWorkspaceModel,
              tableMSEscherMaps, tableKBaseFBAModels, tableKBaseEscherMaps, widgetEscher,
              env, curationApi, kbaseApi) {
    console.log('ModelSEEDEscherIOWidget::constructor')
    this.env = env;
    this.curationApi = curationApi;
    this.kbaseApi = kbaseApi;

    this.widgetEscher = widgetEscher;

    this.tableMSEscherMaps = tableMSEscherMaps;
    this.tableKBaseFBAModels = tableKBaseFBAModels;
    this.tableKBaseEscherMaps = tableKBaseEscherMaps;

    this.selectKBaseWorkspace = selectKBaseWorkspace;
    this.selectKBaseWorkspaceModel = selectKBaseWorkspaceModel;
    this.mapSelectMSTab = mapSelectMSTab;
    this.mapSelectKBaseTab = mapSelectKBaseTab;
    this.kbaseNarrativeSelect = undefined;
    this.msMapTableData = undefined;

    this.modelSelectMSTab = modelSelectMSTab;
    this.modelSelectKBaseTab = modelSelectKBaseTab;

    this.wsList = undefined;

    this.adaptToModel = false;
    this.selectedLayer = 4;

    let that = this;
    this.mapSelectMSTab.on('shown.bs.tab', function () {
      that.loadMSCatalog(['ModelSEED', 'Test'])
    });

    function formatSelection (d) {
      if (!d.id) {
        return d.text;
      }

      return $('<div class="narrative-select-element"><div class="clearfix">\n' +
        '        <div class="float-left"><h6>' + d['label'] + '</h6></div>\n' +
        '        <div class="float-left" style="margin-left: 5px"><i>' + d['id'] + '</i></div>\n' +
        '        <div class="float-right"><i>' + d['owner'] + '</i></div></div></div>');
    }

    function formatOption (d) {
      if (!d.id) {
        return d.text;
      }
      return $('<div class="narrative-select-option"><div class="clearfix">' +
        '<div class="float-left"><h6>' + d['label'] + '</h6></div>' +
        '<div class="float-right"><i>' + d['id'] + '</i></div></div><div class="clearfix">' +
        '<div class="float-left">' + d['owner'] + '</div><div class="float-left">w r<i class="fas fa-user"></i><i class="fas fa-user-shield"></i><i class="fas fa-user-edit"></i><i class="fas fa-user-times"></i></div>' +
        '<div class="float-right"><i>' + d['mod_data'] + '</i> <i class="fas fa-lock"></i><i class="fas fa-lock-open"></i></i></div></div></div>');
    }

    this.mapSelectKBaseTab.on('shown.bs.tab', function () {
      if (!that.kbaseNarrativeSelect) {
        that.kbaseApi.getWorkspaceList(that.getToken(), function(wsList) {
          that.kbaseNarrativeSelect = wsList;
          let data = [];
          _.each(wsList, function(o) {
            data.push({
              "id": o[0],
              "id2": o[1],
              "text": o[8] && o[8]['narrative_nice_name'] ? o[8]['narrative_nice_name'] + " " + o[0]:o[0],
              "label": o[8] && o[8]['narrative_nice_name'] ? o[8]['narrative_nice_name']:o[0],
              "owner": o[2],
              "mod_data": o[3],
              "permission": o[5]
            })
          });
          let s2config = {
            theme: "classic",
            placeholder: 'select workspace',
            data: data,
            /*
            matcher: function(params, data) {
              if (!params.term) {
                return true;
              }
              return data.text.toUpperCase().indexOf(params.term.toUpperCase()) >= 0 ||
                data.id.toUpperCase().indexOf(params.term.toUpperCase()) >= 0;
            },*/
            templateResult: formatOption,
            templateSelection: formatSelection,
          };
          that.selectKBaseWorkspace.select2(s2config);
          that.selectKBaseWorkspaceModel.select2(s2config);
          that.selectKBaseWorkspaceModel.on('select2:select', function (e) {
            let data = e.params.data;
            that.selectKBaseWorkspaceModel.val(data.id).trigger('change');

            that.kbaseApi.get_object_list(data.id, that.getToken(), function(os) {
              if (!that.isDataTable(that.tableKBaseFBAModels)) {
                let g = that.tableKBaseFBAModels.DataTable();
                that.enableKBaseTableFn(that.tableKBaseFBAModels.find("tbody"), g, function(data) {
                  alert(JSON.stringify(data));
                });
                that.tableKBaseFBAModels = g;
              }
              let table = that.tableKBaseFBAModels;
              let rows = [];
              _.each(os, function(o) {
                //let button_html = '<a href="#" onclick="load_escher_map(\'' + '?' +'\', \'' + '?' + '\');"><span class="oi oi-eye"></span></a>';
                let buttonHtml = '<button>Load</button>';
                rows.push([
                  o[0],
                  data.id2,
                  o[1],
                  o[2],
                  o[3],
                  o[5],
                  o[4],
                  buttonHtml
                ]);
              });
              console.log('tableKBaseFBAModels', rows.length);
              table.clear();
              table.rows.add(rows).draw();
            }, undefined, function(e) {
              console.log('!!!!!!!!!!!!!!!!!!')
            }, 'KBaseFBA.FBAModel');
          });
          that.selectKBaseWorkspace.on('select2:select', function (e) {
            let data = e.params.data;
            that.selectKBaseWorkspace.val(data.id).trigger('change');

            that.kbaseApi.get_object_list(data.id, that.getToken(), function(os) {
              if (!that.isDataTable(that.tableKBaseEscherMaps)) {
                let g = that.tableKBaseEscherMaps.DataTable();
                that.enableKBaseTableFn(that.tableKBaseEscherMaps.find("tbody"), g, function(data) {
                  that.loadKBaseMap(data[2], data[1], that.selectedLayer);
                  that.selectedLayer += 1;
                });
                that.tableKBaseEscherMaps = g;
              }
              let table = that.tableKBaseEscherMaps;
              let rows = [];
              _.each(os, function(o) {
                //let button_html = '<a href="#" onclick="load_escher_map(\'' + '?' +'\', \'' + '?' + '\');"><span class="oi oi-eye"></span></a>';
                let buttonHtml = '<button>Load</button>';
                rows.push([
                  o[0],
                  data.id2,
                  o[1],
                  o[2],
                  o[3],
                  o[5],
                  o[4],
                  buttonHtml
                ]);
              });
              table.clear();
              table.rows.add(rows).draw();
            }, undefined, undefined, 'KBaseFBA.EscherMap');
          });
        });
      }
    });
  }

  updateWsList(fnSuccess) {
    this.kbaseApi.getWorkspaceList(this.getToken(), function(wsList) {
      fnSuccess(wsList)
    }, undefined, function (e) {
      console.log('!!!');
    })
  }

  getToken() {
    return this.env.config.kbase_token;
  }

  fnDownloadJson(exportObj, exportName) {
    //https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  s2selectKBaseLoadTableData(table, os, ws) {
    let rows = [];
    _.each(os, function(o) {
      //let button_html = '<a href="#" onclick="load_escher_map(\'' + '?' +'\', \'' + '?' + '\');"><span class="oi oi-eye"></span></a>';
      let buttonHtml = '<button>Load</button>';
      rows.push([
        o[0],
        ws,
        o[1],
        o[2],
        o[3],
        o[5],
        o[4],
        buttonHtml
      ]);
    });
    table.clear();
    table.rows.add(rows).draw();
  }

  fnLoadMapPostProcess(mapData) {
    if (this.adaptToModel && this.widgetEscher.escher_model) {
      let DEBUG_adapt_cmp = 'c0';
      let ema = new EscherMapAdapter(mapData);
      let uid = ema.adaptToModel(this.widgetEscher.escher_model, DEBUG_adapt_cmp);
      let uidNodes = uid[0];
      let uidReactions = uid[1];
      this.widgetEscher.escher_builder.map.delete_node_data(uidNodes);
      this.widgetEscher.escher_builder.map.delete_reaction_data(uidReactions);
      this.widgetEscher.escher_builder.map.convert_map();
      this.widgetEscher.escher_builder.map.draw_everything();
    }
  }

  enableKBaseTableFn(o, dt, fn) {
    o.on( 'click', 'button', function () {
      let data = dt.row($(this).parents('tr')).data();
      fn(data);
    });
  }

  fnSaveKBaseMap(x, ws) {
    let that = this;
    console.log('fnSaveKBaseMap', ws);
    return function(objectId, data) {
      if (confirm('Save ' + objectId + ' to ' + ws)) {
        that.kbaseApi.save_object_escher_map(objectId, ws, data, that.getToken(),
          function(e) {
            alert('map saved: ' + objectId  + ' v' + e[4])
          }, undefined,
          function(e) {
            alert('error unable to save ' + e);
          });
      }
    }
  }

  loadMap(map, mapId, kbaseWorkspace, fnSave) {
    let layerId = this.widgetEscher.getNextLayerId();
    this.widgetEscher.load_map_to_layer(map, layerId, mapId, kbaseWorkspace, fnSave);
    this.widgetEscher.render();
  }

  loadMapLayer(map, mapId, layerId, kbaseWorkspace, fnSave) {
    this.widgetEscher.load_map_to_layer(map, layerId, mapId, kbaseWorkspace, fnSave);
    this.widgetEscher.render();
  }

  loadKBaseMap(objectId, ws, layer, fnSuccess) {
    let that = this;
    this.kbaseApi.getObjectEscherMap(objectId, ws, this.getToken(), function(res) {
      console.log('loadKBaseMap', res, objectId, ws, layer);
      that.widgetEscher.load_map_to_layer(res.data, layer, objectId, ws, that.fnSaveKBaseMap(objectId, ws, layer));
      that.widgetEscher.render();
      if (fnSuccess) {
        fnSuccess(res);
      }
    });
    /*
    this.kbaseApi.get_object_escher_map(objectId, ws, this.getToken(), function(res) {
      that.widgetEscher.load_map_to_layer(res, layer, objectId, that.fnSaveKBaseMap(objectId, ws, layer));
      that.widgetEscher.render();
    });

     */
  }

  mergeLayers(indexes) {
    let that = this;
    let params = {
      maps: [],
    };
    let invalid = [];
    for (const i of indexes) {
      if (this.widgetEscher.layer[i]) {
        params.maps.push(this.widgetEscher.layer[i].mapData)
      } else {
        invalid.push(i);
      }
    }
    if (invalid.length > 0) {
      alert('error bad index: ' + JSON.stringify(invalid));
    } else {
      this.curationApi.postEscherMergeMap(params, function(mergedMap) {
        mergedMap[0] = that.widgetEscher.layer[indexes[0]].mapData[0]; // copy first merged map metadata
        let layerLabel = mergedMap[0]['map_name'];
        let workspaceId = that.widgetEscher.layer[indexes[0]].kbaseWorkspace;
        console.log('active layer', that.widgetEscher.activeLayer);
        _.each(indexes, function(i) {
          if (i == that.widgetEscher.activeLayer) {
            console.log('merging active layer clearing active map');
            that.widgetEscher.escher_map = undefined;
          }
          console.log('delete layer', i, widget_escher.layer[i].layerName());
          that.widgetEscher.layer[i].destroy(false);

          //widget_escher.deleteLayer(i);
        });
        console.log('merge map', layerLabel, workspaceId, indexes[0]);
        console.log('merge map', mergedMap[0]['map_name'], _.size(mergedMap[1]['reactions']));

        that.widgetEscher.activeLayer = indexes[0];
        that.loadMapLayer(mergedMap, layerLabel, indexes[0], workspaceId, that.fnSaveKBaseMap(layerLabel, workspaceId, indexes[0]))
      });
    }
  }

  loadMapFromFile() {
    console.log('wut')
    let that = this;
    return function() {
      console.log(this);
      let file = this.files[0];
      let reader = new FileReader();
      console.log(file);
      reader.onload = function(e) {
        let escherMap = JSON.parse(e.target.result);
        console.log('map', escherMap);
        that.widgetEscher.change_map(escherMap);
      };
      reader.readAsText(file);
    }
  }

  loadModelFromFile() {
    let that = this;
    return function() {
      console.log(this);
      let file = this.files[0];
      let reader = new FileReader();
      console.log(file);
      reader.onload = function(e) {
        let escherModel = JSON.parse(e.target.result);
        console.log('model', escherModel);
        that.widgetEscher.change_model(escherModel);
      };
      reader.readAsText(file);
    }
  }

  loadEscherConfiguration(config) {
    this.widgetEscher.maps = [];
    this.widgetEscher.active_layer = 0;
    let that = this;
    this.loadEscherConfiguration__(config, undefined, function() {
      that.widgetEscher.render();
    });
  }

  loadEscherConfiguration__(config, model, fnDone, index=0) {
    console.debug('load config', config, index);
    let that = this;
    if (!model && config['models_ref'][0]) {
      console.debug('load config', config, 'model', config['models_ref'][0]);
      this.kbaseApi.getObjectCobraModel(config['models_ref'][0], '',
        that.env.config.kbase_token, function(d) {
          that.widgetEscher.change_model(d.data);
          that.loadEscherConfiguration__(config, d.data, fnDone, index);
        }, undefined, function () {
          alert('fail to load model');
        });
    } else if (config['maps_ref'][index]) {
      this.kbaseApi.getObjectEscherMap(config['maps_ref'][index], '', that.env.config.kbase_token, function(o) {
        let objectId = o.info[1];
        let ws = o.info[7];
        if (config['maps_options'][index] && config['maps_options'][index]['adapt_to_model']) {
          let ema = new EscherMapAdapter(o.data);
          o.data = ema.adaptToModel2(that.widgetEscher.escher_model);
        }

        that.widgetEscher.load_map_to_layer(o.data, index, objectId, that.fnSaveKBaseMap(objectId, ws, index));
        that.loadEscherConfiguration__(config, model, fnDone, index + 1);
      });
    } else {
      fnDone(model);
    }
  }

  isDataTable(v) {
    return $.fn.DataTable.isDataTable(v)
  }

  loadMSCatalog(catalogs) {
    let that = this;
    if (!that.msMapTableData) {
      that.env.load_catalog(catalogs, function(catalog) {
        if (!that.isDataTable(that.tableMSEscherMaps)) {
          that.tableMSEscherMaps = that.tableMSEscherMaps.DataTable();
        }
        let table = that.tableMSEscherMaps;
        let rows = [];
        _.each(catalog, function(map_list, dataset_id) {
          _.each(map_list, function(map_id) {
            let button_html = '<a href="#" onclick="load_escher_map(\'' + dataset_id +'\', \'' + map_id + '\');"><span class="oi oi-eye"></span></a>';
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
            ]);
          });
        });
        that.msMapTableData = rows;
        table.rows.add(rows).draw();
      });
    }
  }
}