
class WidgetEscherDepict {
  constructor(biochem_api, chem_api) {
    this.escher = null;
    this.img_size = 160;
    this.biochem_api = biochem_api;
    this.chem_api = chem_api;
    this.depict_containers = {};
    this.display_depict = false;

    window.fn_node_label_drag_end = function(d) {
      if (d && d.label_x && d.label_y) {
        $('#n' + d.node_id + '_label_meta').attr(
          'transform', 'translate('+ d.label_x + ',' + (d.label_y + 10) + ')')
      }
      //console.log('change of coord', d.label_x, d.label_y)
    }
  }

  refresh() {

  }

  get_smiles = function(cpd_id) {
    let model = this.escher.escher_builder.cobra_model
    let smiles = null;
    _.each(model.metabolites, function(m, m_id) {
      if (m_id === cpd_id && m.smiles) {
        smiles = m.smiles
      }
    });
    return smiles;
  }

  set_escher_widget(ew) {
    this.escher = ew;
  }

  init_container() {
    let that = this;
    if (this.escher && this.escher.container) {
      this.toggle_depict = $('<button>', {'class' : 'btn btn-seed-sm btn-dark'}).html('<i class="fas fa-eye-slash"> Structures</i>');
      this.toggle_depict.click(function(e) {
        that.display_depict = !that.display_depict;

        if (that.display_depict) {
          that.toggle_depict.html('<i class="fas fa-eye"> Structures</i>')
          that.depict_compounds();
        } else {
          that.toggle_depict.html('<i class="fas fa-eye-slash"> Structures</i>')
          that.clear_depict_containers();
        }
      })
      this.escher.container.append(' ').append(this.toggle_depict);
    }
  }

  draw_svg = function(svg_data, seed_id, img_size, primary = true) {
    let that = this;
    if (svg_data) {
      d3.select('#map_container')
        .selectAll('.metabolite-circle')
        .each(function (data) {
          if ((that.biochem_api.detect_id(data.bigg_id)) === seed_id && (!primary || data.node_is_primary)) {
            console.log('render svg on node', data);
            let svg_id = 'n' + data.node_id + '_label_meta'
            if (that.depict_containers[svg_id]) {

            } else {
              let circle = d3.select(this);
              let circle_parent = circle.node().parentNode
              let svg_node = d3.select(circle.node().parentNode)
                .insert('g')
                .attr('id', svg_id)
                .attr('transform', 'translate('
                  + (data.label_x) + ','
                  + (data.label_y + 10) + ')')
                //.attr('width', img_size)
                //.attr('height', img_size)
                //.attr('viewBox', '0 0 ' + img_size + ' ' + img_size)
                //.attr('preserveAspectRatio', 'xMinYMin meet')
                .html(svg_data);
              svg_node.select('svg').attr('width', that.img_size);
              svg_node.select('svg').attr('height', that.img_size);
              d3.select(d3.select(circle_parent).select('svg').node()).select('svg').attr('width', img_size).attr('height', that.img_size)
              that.depict_containers[svg_id] = svg_node;
            }
          }
        });
    }
  }

  clear_depict_containers() {
    let that = this;
    _.each(this.depict_containers, function(o, o_id) {
      $('#' + o_id).remove()
      that.depict_containers[o_id] = false;
      //o[0].nodes()[0].remove()
      //o[0][0].remove();
    })
  }

  depict_compounds(primary = true) {

    let builder = this.escher.escher_builder
    let that = this;
    _.each(builder.map.nodes, function(node, uid) {
      if (node.node_type === 'metabolite' && (!primary || node.node_is_primary)) {
        if (node.bigg_id) {
          let seed_id = that.biochem_api.detect_id(node.bigg_id);
          let x = that.biochem_api.get_compound(seed_id, null, function (cpd) {
            if (cpd && cpd.smiles) {
              console.log(uid, node.bigg_id, seed_id, cpd.name);
              that.chem_api.get_depict(cpd.smiles, 'smi', {}, function (svg_data) {
                if (svg_data) {
                  that.draw_svg(svg_data, seed_id, that.img_size, primary)
                  /*
                  d3.select('#map_container')
                    .selectAll('.metabolite-circle')
                    .each(function (data) {
                      if ((biochem_api.detect_id(data.bigg_id)) === seed_id && (!primary || data.node_is_primary)) {
                        console.log('render svg on node', data);
                        let svg_id = 'n' + data.node_id + '_label_meta'

                        let circle = d3.select(this);
                        let circle_parent = circle.node().parentNode
                        let svg_node = d3.select(circle.node().parentNode)
                          .insert('g')
                          .attr('id', 'n' + data.node_id + '_label_meta')
                          .attr('transform', 'translate('
                            + (data.label_x) + ','
                            + (data.label_y + 10) + ')')
                          //.attr('width', img_size)
                          //.attr('height', img_size)
                          //.attr('viewBox', '0 0 ' + img_size + ' ' + img_size)
                          //.attr('preserveAspectRatio', 'xMinYMin meet')
                          .html(svg_data);
                        svg_node.select('svg').attr('width', that.img_size);
                        svg_node.select('svg').attr('height', that.img_size);
                        d3.select(d3.select(circle_parent).select('svg').node()).select('svg').attr('width', that.img_size).attr('height', that.img_size);
                        that.depict_containers.push(svg_node);
                      }
                    });

                   */
                }
                //console.log(cpd.id, svg_data);
              });
            }
          });
          //draw compound from model object
          if (!x) {
            let smiles = that.get_smiles(node.bigg_id)
            console.log(seed_id, x, smiles)
            that.chem_api.get_depict(smiles, 'smi', {}, function (svg_data) {
              that.draw_svg(svg_data, seed_id, that.img_size, primary)
            })
          }
        }
      }
    });
  }
}

const render_damage_products = function (e_builder, primary = true) {
  //console.log(escher_map)
  _.each(e_builder.map.nodes, function(node, uid) {
    if (node.node_type === 'metabolite' && (!primary || node.node_is_primary)) {
      if (node.bigg_id) {
        //console.log(node.bigg_id)

        let img_size = 160;
        let seed_id = biochem_api.detect_id(node.bigg_id);
        //console.log('!!', img_size, seed_id, node.bigg_id)
        let x = biochem_api.get_compound(seed_id, null, function (cpd) {
          if (cpd && cpd.smiles) {
            console.log(uid, node.bigg_id, seed_id, cpd.name);
            chem_api.get_depict(cpd.smiles, 'smi', {}, function (svg_data) {
              if (svg_data) {
                d3.select('#map_container')
                  .selectAll('.metabolite-circle')
                  .each(function (data) {
                    if ((biochem_api.detect_id(data.bigg_id)) === seed_id && (!primary || data.node_is_primary)) {
                      console.log('render svg on node', data);

                      let circle = d3.select(this);
                      let circle_parent = circle.node().parentNode
                      let svg_node = d3.select(circle.node().parentNode)
                        .insert('g')
                        .attr('id', 'n' + data.node_id + '_label_meta')
                        .attr('transform', 'translate('
                          + (data.label_x) + ','
                          + (data.label_y) + ')')
                        //.attr('width', img_size)
                        //.attr('height', img_size)
                        //.attr('viewBox', '0 0 ' + img_size + ' ' + img_size)
                        //.attr('preserveAspectRatio', 'xMinYMin meet')
                        .html(svg_data);
                      svg_node.select('svg').attr('width', img_size);
                      svg_node.select('svg').attr('height', img_size);
                      d3.select(d3.select(circle_parent).select('svg').node()).select('svg').attr('width', img_size).attr('height', img_size)
                    }
                  });
              }
              //console.log(cpd.id, svg_data);
            });
          }
        });


      }
    }
  });
};