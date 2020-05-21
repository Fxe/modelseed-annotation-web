class WidgetEscherMetadata {
  constructor(biochem_api, curation_api, env) {
    this.biochem_api = biochem_api;
    this.curation_api = curation_api;
    this.escher = null;
    this.env = env;
  }

  init_container() {

  }

  refresh() {

  }
//#9a9a9a
  set_escher_widget(ew) {
    this.escher = ew;
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
      console.log(id)
      that.curation_api.post_template_annotation_reaction_status(that.env.config.target_template, id, that.env.config.genome_set, function(e) {

        let id_to_function_str = {}
        _.each(e.annotation, function(v, function_str) {
          id_to_function_str[v.id] = function_str
        });
        console.log(id_to_function_str);
        _.each(nodes, function(node, uid) {
          console.log(node);
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

        console.log(e);
      }, undefined, function (e) {
        console.log('@@@', e)
      }).always(function() {
        console.log('done', id, 'remaing:', that.loading_count);
      });
    });
  }

  omg(primary = true) {
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
              let n = d3.select(this);
              n.insert('g').attr('id', 'n' + uid + '_label_meta').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 20) +')').insert('text')
                .attr('class', 'node-label label')
                .attr('visibility', 'visible')
                .html(alias_kegg.join(';'))
              n.insert('g').attr('id', 'n' + uid + '_label_meta').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 50) +')').insert('text')
                .attr('class', 'node-label label')
                .attr('visibility', 'visible')
                .html(alias_meta.join(';'))
              n.insert('g').attr('id', 'n' + uid + '_label_meta').attr('transform', 'translate(' + data.label_x +',' + (data.label_y + 80) +')').insert('text')
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