class TableCompoundMapping {

  constructor(data, ct, api) {
    this.objects = {};
    this.mappings = {};
    this.api = api;
    this.data = {}
    this.render_table(data, ct);

    this.mock = {
      "bios_id": 3786779,
      "comparment": null,
      "crossreferences": [
        {
          "id": 3870360,
          "ref": "MetaCyc",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "META:PHENYL-PYRUVATE"
        },
        {
          "id": 3934726,
          "ref": "LigandCompound",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "C00166"
        },
        {
          "id": 2706002,
          "ref": "ModelSeed",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "cpd00143"
        },
        {
          "id": 2656164,
          "ref": "BiGGMetabolite",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "phpyr"
        },
        {
          "id": 2626357,
          "ref": "BiGG",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "phpyr"
        },
        {
          "id": 2820725,
          "ref": "HMDB",
          "source": "UNKNOWN",
          "type": "DATABASE",
          "value": "HMDB00205"
        }
      ],
      "description": "",
      "entityType": null,
      "entry": "species_5845_7@iWV1213",
      "enzymeIdSet": [],
      "enzymeMap": {},
      "formula": null,
      "id": "M_PHPYR_c",
      "metaboliteClass": "COMPOUND",
      "name": "keto-phenylpyruvate",
      "properties": {
        "boundaryCondition": "false",
        "compartment": "c",
        "constant": "false",
        "created_at": 1545980681197,
        "entry": "species_5845_7@iWV1213",
        "hasOnlySubstanceUnits": "false",
        "id": "M_PHPYR_c",
        "major_label": "MetaboliteSpecie",
        "name": "keto-phenylpyruvate",
        "notes": "<notes>\n          <body xmlns=\"http://www.w3.org/1999/xhtml\">\n            <p>FORMULA: </p>\n            <p>CHARGE: 0</p>\n          </body>\n        </notes>",
        "proxy": false,
        "updated_at": 1545980681197
      },
      "reactionDegree": 2,
      "reactionIdSet": [],
      "reactionMap": {},
      "source": null,
      "version": null
    }
  }

  get_selected_mappings() {
    let mappings = {}
    _.each(this.mappings, function (model_tuples, database_tuple) {
      _.each(model_tuples, function (active, model_tuple) {
        if (active) {
          if (!mappings[database_tuple]) {
            mappings[database_tuple] = []
          }
          mappings[database_tuple].push(model_tuple)
        }
      })
    })
    return mappings
  }

  get_table_model_list() {
    let res = {}
    _.each(this.objects, function(o, cell_id) {
      if (o.type === 'model') {
        res[o.ns] = true
      }
    })
    return _.keys(res)
  }

  load_cell_model_species(cell_id, ns, id, match) {
    let that = this;
    this.api.get_bios_model_species(ns, id,
      function(res) {
      that.render_model_cell(cell_id, res, match)
    },
      function(res) {
        console.log('alwats')
      },
      function(res) {
        let cell = $('#' + cell_id).addClass('bg-danger')
      }
    );
  }

  load_model_data(models, fn_done) {
    let model_id = models.pop();
    let that = this;
    if (model_id) {
      console.log('load', model_id)
      this.api.get_bios_all_model_species(model_id, function (model_spis) {
        that.data[model_id] = {}
        _.each(model_spis, function(o) {
          if (o['id']) {
            that.data[model_id][o['id']] = o
          }
        });
        that.load_model_data(models, fn_done);
      });
    } else {
      if (fn_done) {
        return fn_done()
      }
    }
  }

  load_stuff() {
    let that = this;
    if (this.api) {
      this.load_model_data(this.get_table_model_list(), function () {
        _.each(that.objects, function(o, cell_id) {
          if (o.type === 'model') {
            if (that.data[o.ns] && that.data[o.ns][o.id]) {
              that.render_model_cell(cell_id, that.data[o.ns][o.id], o.match)
            } else {
              that.load_cell_model_species(cell_id, o.ns, o.id, o.match)
            }

          } else if (o.type === 'database') {
            that.api.get_bios_database_metabolite(o.ns, o.id, function(res) {
              that.render_model_cell(cell_id, res)
            });
          } else {
            console.log(o)
          }
        });
      });
    }
  }

  render_model_cell(cell_id, data, match) {
    //console.log(cell_id)
    //console.log(data)
    //console.log(match)
    let match_count = 0;
    let cell = $('#' + cell_id).html("")
    cell.html("")
    _.each(match, function(v, k) {
      let s = k.split('@');
      let database_id = s[1]
      let cpd_id = s[0]
      if (data.crossreferences) {
        let f = _.filter(data.crossreferences, function(x) { return x.value === cpd_id})
        if (f.length > 0) {
          match_count++
        }
      } else if (data.bios_references) {
        let f = _.filter(data.bios_references, function(x) { return x[0] === cpd_id})
        if (f.length > 0) {
          match_count++
        }
      }
    })
    let bg_color = 'bg-light'
    if (_.size(match) == 0) {
      bg_color = 'bg-info'
    } else if (match_count == _.size(match)) {
      bg_color = 'bg-success'
    } else if (match_count > 0) {
      bg_color = 'bg-warning'
    }
    cell.append($('<div>', {'class' : 'clearfix ' + bg_color})
      .append($('<div>', {'class' : 'text-dark float-left'}).text(data['id']))
      .append($('<div>', {'class' : 'text-muted float-right'}).text(data['bios_id'])));
    cell.append($('<div>', {'class' : ''}).text(data['name']))
  }

  render_table = function(ct, data) {
    ct.html("");
    let that = this;
    let uid = 0;
    let table = $('<table>', {'class' : 'table table-bordered'});
    let thead = $('<thead>', {'class' : 'thead-light'});
    let header = $('<tr>');
    let d_order = [];
    let m_order = [];
    _.each(data['databases'], function(db) {
      d_order.push(db);
      header.append($('<th>').text(db))
    });
    header.append($('<th>').text(''));
    _.each(data['models'], function(model) {
      m_order.push(model);
      header.append($('<th>').text(model))
    });
    thead.append(header);

    let tbody = $('<tbody>');

    _.each(data['records'], function(record) {
      let row = $('<tr>');
      let databaseRecords = {}
      let db_row_span = _.size(record['model_data']);
      _.each(d_order, function(db) {
        let td = $('<td>', {'rowspan' : db_row_span})
        if (record['database'][db]) {
          _.each(record['database'][db], function(cpd_id) {
            let cell_uid = 'table-cell-' + uid++
            let compound_cell = $('<div>', {'id' : cell_uid}).text(cpd_id)
            that.objects[cell_uid] = {
              type : 'database',
              ns : db,
              id : cpd_id
            }
            databaseRecords[cpd_id + '@' + db] = true;
            that.mappings[cpd_id + '@' + db] = {}
            td.append(compound_cell)
          })
        }
        row.append(td);
      });
      _.each(record['model_data'], function(data, cmp) {
        if (row === undefined) {
          row = $('<tr>');
        }
        row.append($('<td>').text(cmp));
        _.each(m_order, function(model) {
          if (data[model]) {
            let td = $('<td>')
            _.each(data[model], function(model_sid) {
              let cell_uid = 'table-cell-' + uid++
              let compound_cell = $('<div>', {'id' : cell_uid}).text(model_sid)
              _.each(databaseRecords, function(i, o) {
                that.mappings[o][model_sid + '@' + model] = true
              });
              that.objects[cell_uid] = {
                type : 'model',
                ns : model,
                id : model_sid,
                match : databaseRecords,
              }
              td.append(compound_cell)
            })
            row.append(td);
          } else {
            row.append($('<td>'));
          }
        });
        tbody.append(row);
        row = undefined
      });

    });

    table.append(thead);
    table.append(tbody);
    ct.append(table);
  };
}