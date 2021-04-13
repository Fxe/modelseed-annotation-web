//@import('curation_api')

class WidgetEscherMetadata {
  constructor(biochem_api, curation_api, env) {
    this.biochem_api = biochem_api;
    this.curation_api = curation_api;
    this.escher = null;
    this.env = env;
    this.rxn_attributes = {}
    this.groups = {'attributes' : {}}
    this.drawing = false;
    this.xhr_calls = 0
  }

  init_container() {

  }

  delete_attributes() {
    console.log('WidgetEscherMetadata', 'delete_attributes')
    _.each(this.groups['attributes'], function(group_id) {
      d3.select('#' + group_id).remove()
    })
  }

  refresh() {
    console.log('WidgetEscherMetadata', 'refresh')
    this.display_attributes();
  }
//#9a9a9a
  set_escher_widget(ew) {
    this.escher = ew;
  }

  get_database_id_to_node() {
    let builder = this.escher.escher_builder
    let database_id_to_node = {}
    _.each(builder.map.reactions, function(node, uid) {
      if (node.bigg_id) {
        if (!database_id_to_node[node.bigg_id]) {
          database_id_to_node[node.bigg_id] = {}
        }
        database_id_to_node[node.bigg_id][uid] = node
      }
    });
    return database_id_to_node
  }

  draw_attributes(uid, attr) {
    let that = this;
    let y_position = 0;
    let x_offset = 40;
    let x_position = 0;
    d3.select('#r' + uid).selectAll('.reaction-label-group').each(function (data) {
      //console.log(uid, data);
      let n = d3.select(this);
      //console.log(uid, attr);
      let group_id = 'n' + uid + '_label_meta_attributes';
      let g = n.insert('g').attr('id', group_id).attr('transform', 'translate(' + (140) +',' + (0 + 20 * y_position) +')')
      that.groups['attributes'][uid] = group_id;
      if (attr.review) {
          g.insert('text').attr('class', '').attr('x', x_offset + 30 * x_position)
                                            .attr('style', 'font-family: "Font Awesome 5 Free" !important; font-weight: 900; fill: red; font-size: 30px')
            .attr("font-family","Font Awesome 5 Free").attr('visibility', 'visible').text(function(d) { return '\uf071'; });
        x_position++;
      }
      if (attr['active'] === false) {
        //n.insert('g').attr('id', 'n' + uid + '_label_meta_attributes').attr('transform', 'translate(' + (140 + 30 * x_position) +',' + (0 + 20 * y_position) +')')
          g.insert('text').attr('class', '').attr('x', x_offset + 30 * x_position)
            .attr('style', 'font-family: "Font Awesome 5 Free" !important; font-weight: 900; fill: red; font-size: 30px')
            .attr("font-family","Font Awesome 5 Free").attr('visibility', 'visible').text(function(d) { return '\uf05e'; });
        x_position++;
      }
      if (attr.type && attr.type === 'spontaneous') {
        //n.insert('g').attr('id', 'n' + uid + '_label_meta_attributes').attr('transform', 'translate(' + (140 + 30 * x_position) +',' + (0 + 20 * y_position) +')')
          g.insert('text').attr('class', '').attr('x', x_offset + 30 * x_position)
            .attr('style', 'font-family: "Font Awesome 5 Free" !important; font-weight: 900; fill: green; font-size: 30px')
            .attr("font-family","Font Awesome 5 Free").attr('visibility', 'visible').text(function(d) { return '\uf5d2'; });
        x_position++;
      }
      if (attr.type && attr.type === 'universal') {
        //n.insert('g').attr('id', 'n' + uid + '_label_meta_attributes').attr('transform', 'translate(' + (140 + 30 * x_position) +',' + (0 + 20 * y_position) +')')
        g.insert('text').attr('class', '').attr('x', x_offset + 30 * x_position)
          .attr('style', 'font-family: "Font Awesome 5 Free" !important; font-weight: 900; fill: blue; font-size: 30px')
          .attr("font-family","Font Awesome 5 Free").attr('visibility', 'visible').text(function(d) { return '\uf069'; });
        x_position++;
      }
      if (attr.type && attr.type === 'gapfilling') {
        //n.insert('g').attr('id', 'n' + uid + '_label_meta_attributes').attr('transform', 'translate(' + (140 + 30 * x_position) +',' + (0 + 20 * y_position) +')')
        g.insert('text').attr('class', '').attr('x', x_offset + 30 * x_position)
          .attr('style', 'font-family: "Font Awesome 5 Free" !important; font-weight: 900; fill: red; font-size: 30px')
          .attr("font-family","Font Awesome 5 Free").attr('visibility', 'visible').text(function(d) { return '\uf542'; });
        x_position++;
      }
    });
  }

  display_attributes() {
    console.log('display attributes:')
    if (!this.drawing) {
      console.log('WidgetEscherMetadata', 'display_attributes')
      this.drawing = true;
      this.delete_attributes();
      let that = this;
      //template_id, rxn_id,
      let database_id_to_node = this.get_database_id_to_node();
      let ids = {}
      _.each(database_id_to_node, function(nodes, id) {
        console.log('display_attributes', id)

        _.each(nodes, function(node, uid) {
          that.xhr_calls++;
          ids[id] = undefined;
          /*
          that.curation_api.get_template_reaction_attribute(that.env.config.target_template, id, function(e) {
            that.rxn_attributes[id] = e
            that.draw_attributes(uid, e);
            that.xhr_calls--;
            if (that.xhr_calls == 0) {
              that.drawing = false;
            } else {
              that.drawing = true;
            }
          })
          */
        });

      });
      that.curation_api.get_template_reactions_attribute(that.env.config.target_template, _.keys(ids), function(e) {
        _.each(e, function(attributes, rxn_id) {
          ids[rxn_id] = attributes;
        })
        _.each(database_id_to_node, function(nodes, id) {
          _.each(nodes, function(node, uid) {
            if (ids[id]) {
              that.draw_attributes(uid, ids[id]);
            }
            /*
            that.curation_api.get_template_reaction_attribute(that.env.config.target_template, id, function(e) {
              that.rxn_attributes[id] = e
              that.draw_attributes(uid, e);
              that.xhr_calls--;
              if (that.xhr_calls == 0) {
                that.drawing = false;
              } else {
                that.drawing = true;
              }
            })
            */
          });

        });
      });
    }
    if (this.xhr_calls == 0) {
      this.drawing = false;
    }
  }

  get_database_id_to_node_reaction() {
    let builder = this.escher.escher_builder
    let database_id_to_node = {}
    _.each(builder.map.reactions, function(node, uid) {
      if (node.annotation && node.annotation['seed.reaction']) {
        let database_id = undefined
        if (typeof (node.annotation['seed.reaction']) === 'string') {
          database_id = node.annotation['seed.reaction']
        } else {
          database_id = node.annotation['seed.reaction'][0]
        }
        if (database_id) {
          if (!database_id_to_node[database_id]) {
            database_id_to_node[database_id] = {}
          }
          database_id_to_node[database_id][uid] = node
        }
      } else if (node.bigg_id) {
        if (!database_id_to_node[node.bigg_id]) {
          database_id_to_node[node.bigg_id] = {}
        }
        database_id_to_node[node.bigg_id][uid] = node
      }
    });

    return database_id_to_node
  }

  display_annotation() {
    let builder = this.escher.escher_builder
    let that = this;
    let database_id_to_node = {}
    _.each(builder.map.reactions, function(node, uid) {
      if (node.bigg_id) {
        if (!database_id_to_node[node.bigg_id]) {
          database_id_to_node[node.bigg_id] = {}
        }
        database_id_to_node[node.bigg_id][uid] = node
      }
    });

    const score_order = ['opt_score1', 'opt_score2', 'opt_score3']
    _.each(database_id_to_node, function(nodes, id) {
      //console.log('display_annotation', id)
      let cmp_config = Object.fromEntries(that.env.config.biochem_config.split(';').map(x => x.split(':')))
      that.curation_api.post_template_annotation_reaction_status(that.env.config.target_template, id, cmp_config, that.env.config.genome_set, function(e) {

        let id_to_function_str = {}
        _.each(e.annotation, function(v, function_str) {
          id_to_function_str[v.id] = function_str
        });
        //console.log('display_annotation', 'post_template_annotation_reaction_status', id_to_function_str);
        _.each(nodes, function(node, uid) {
          //console.log('display_annotation', 'post_template_annotation_reaction_status', node);
          let y_position = 1
          d3.select('#r' + uid).selectAll('.reaction-label-group').each(function (data) {
            if (data.bigg_id === id) {
              let n = d3.select(this);
              _.each(score_order, function(score_value) {
                _.each(e.curation['functions'], function(function_score, function_id) {
                  if (function_score == score_value) {
                    n.insert('foreignObject').attr('width', '300').attr('height', '200').attr('x', '0').attr('y', '0').insert('div').html('<i class="fas fa-download"></i> ' + id_to_function_str[function_id])
                    n.insert('g').attr('id', 'n' + uid + '_label_meta').attr('transform', 'translate(' + 0 +',' + (0 + 20 * y_position) +')')
                      .insert('text').attr('class', 'node-label label').attr('visibility', 'visible').html(score_value + ' ' + id_to_function_str[function_id])
                    n.insert('path').attr('d', 'M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z')
                    y_position++;
                  }
                })
              });

            }
          });
        })

        //console.log(e);
      }, undefined, function (e) {
        console.log('@@@', e)
      }).always(function() {
        console.log('done', id, 'remaing:', that.loading_count);
      });
    });
  }

  display_ec() {
    let that = this;
    let database_id_to_node = this.get_database_id_to_node_reaction();

    _.each(database_id_to_node, function(nodes, seed_id) {
      let x = that.curation_api.get_modelseed_reaction(seed_id, function(rxn) {
        let ec_str = "no ec";
        if (rxn.ec_numbers && rxn.ec_numbers.length > 0) {
          ec_str = rxn.ec_numbers;
        }
        _.each(nodes, function(v, uid) {
          d3.select('#r' + uid).each(function (data) {
            let y_position = 0;
            let group_id = 'n' + uid + '_label_lower_meta_attributes';
            let n = d3.select(this);
            let g = n.insert('g').attr('id', group_id).attr('transform', 'translate(' + (0) +',' + (0 + 20 * y_position) +')')
            g.insert('g').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 25) +')').insert('text')
              .attr('class', 'node-label label')
              .attr('visibility', 'visible')
              .html(ec_str)
          });
        });
      });
    });

    return database_id_to_node;
  }

  display_bigg_kegg_meta(primary = true) {
    let builder = this.escher.escher_builder
    let that = this;
    let database_id_to_node = {}
    _.each(builder.map.nodes, function(node, uid) {
      if (node.node_type === 'metabolite' && (!primary || node.node_is_primary)) {
        if (node.bigg_id) {
          if (!database_id_to_node[node.bigg_id]) {
            database_id_to_node[node.bigg_id] = {}
          }
          database_id_to_node[node.bigg_id][uid] = node
        }
      }
    });

    _.each(database_id_to_node, function(nodes, id) {
      let seed_id = that.biochem_api.detect_id(id);
      let x = that.biochem_api.get_compound(seed_id, null, function (cpd) {
        console.log(id, seed_id)
        console.log(cpd)
        _.each(nodes, function(v, uid) {
          console.log(id, seed_id, uid);
          d3.select('#n' + uid).each(function (data) {
            if (data.bigg_id === id) {
              let alias_kegg = ['Not in KEGG'];
              let alias_bigg = ['Not in BiGG'];
              let alias_meta = ['Not in MetaCyc'];
              if (cpd && cpd.aliases && cpd.aliases['KEGG']) {
                alias_kegg = cpd.aliases['KEGG']
              }
              if (cpd && cpd.aliases && cpd.aliases['MetaCyc']) {
                alias_meta = cpd.aliases['MetaCyc']
              }
              if (cpd && cpd.aliases && cpd.aliases['BiGG']) {
                alias_bigg = cpd.aliases['BiGG']
              }
              let y_position = 0;
              let group_id = 'n' + uid + '_label_lower_meta_attributes';
              let n = d3.select(this);
              let g = n.insert('g').attr('id', group_id).attr('transform', 'translate(' + (0) +',' + (0 + 20 * y_position) +')')

              g.insert('g').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 25) +')').insert('text')
                .attr('class', 'node-label label')
                .attr('visibility', 'visible')
                .html(alias_kegg.join(';'))
              g.insert('g').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 55) +')').insert('text')
                .attr('class', 'node-label label')
                .attr('visibility', 'visible')
                .html(alias_meta.join(';'))
              g.insert('g').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 85) +')').insert('text')
                .attr('class', 'node-label label')
                .attr('visibility', 'visible')
                .html(alias_bigg.join(';'))
            }
          });
        });
      })
    })
  }
}