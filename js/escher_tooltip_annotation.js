class EscherTooltipAnnotation {

  constructor(tinier, curation_api, env, container_id = 'tooltip_container') {
    this.tinier = tinier
    this.container_id = container_id;
    this.curation_api = curation_api;
    this.biochem_api = null;
    this.chem_api = null;
    this.env = env;
    //default user tagged as system
    this.default_option = "opt_null";
    this.system_users = {
      'system' : true
    }
    this.control_options = {
      'opt_score1' : 'fas fa-star',
      'opt_score2' : 'fas fa-star-half-alt',
      'opt_score3' : 'far fa-star',
      'opt_rej' : 'fas fa-ban',
      'opt_null' : 'fas fa-question'
    };
    this.source_alias = {
      'KBASE_RAST' : 'Legacy RAST'
    }
    this.active_xhr = 0;
  }

  is_busy() {
    return this.active_xhr != 0;
  }

  render_function(function_str, metadata) {
    //https://enzyme.expasy.org/EC/1.1.1.1
    function_str = function_str.replace(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/gm,
      '<a href="https://www.kegg.jp/dbget-bin/www_bget?ec:$1" target="_blank">$1</a> <a href="https://enzyme.expasy.org/EC/$1" target="_blank"><img src="https://web.expasy.org/favicon.ico" /></a>')
    if (metadata.subsystems && _.size(metadata.subsystems) > 0) {
      //console.log('render_function', metadata.subsystems, _.size(metadata.subsystems))
      let ss = "";
      _.each(metadata.subsystems, function(ss_data, ss_source) {
        ss += ss_source + "; ";
        if (ss_data[0]) {
          ss += ': ' + ss_data[0]
        }

      })
      function_str = '<span class="e-subsystem" data-toggle="tooltip" title="' + ss + '">' + function_str + '</span>'
      let el = $(function_str)
      el.tooltip();
      return el
    }

    return function_str;
  }

  get_annotation_status_old(api, template_id, rxns, result, fn_success, fn_error) {
    rxn_id = rxns.pop()
    if (rxn_id) {
      api.get_template_reaction_annotation_status(template_id, rxn_id, function(e) {
        result[rxn_id] = e
        get_annotation_status(api, template_id, rxns, result, fn_success, fn_error)
      }).fail(function() {
        if (fn_error) {
          fn_error()
        }
      });
    } else {
      if (fn_success) {
        fn_success(result);
      }
    }
  }

  set_annotation(function_id, reaction_id, user_id, template_id, logic) {
    console.log('set_annotation', function_id, reaction_id, user_id, template_id, logic)
    this.curation_api.post_template_reaction_function(function_id, reaction_id, user_id,
      template_id, logic, function() {
        console.log('s');
      }, function() {
        console.log('a');
      }, function () {
        alert('server failed to set annotation')
      })
  }

  xset_annotation_temp(function_id, reaction_id, logic) {
    this.set_annotation(function_id, reaction_id, env.config['user'], env.config['target_template'], logic)
  }

  create_control_group(opts, def_opt, target_id, seed_id, user, is_system) {
    let that = this;
    if (!def_opt) {
      def_opt = this.default_option;
    }
    //console.log('create_control_group', target_id, def_opt, user, is_system)
    let curation_decorator = ""
    if (user && is_system) {
      curation_decorator = "seed-annotation-auto-group"
    } else if (user) {
      curation_decorator = "seed-annotation-curated-group"
    } else {
      curation_decorator = "seed-annotation-none-group"
    }
    let base = $('<div>', {'class' : 'btn-group btn-group-toggle ' + curation_decorator, 'data-toggle' : 'buttons'})
    if (user) {
      base.append($('<div>', {'class' : 'seed-annotation-control-label', 'text' : user}))
    }
    _.each(opts, function(k, v) {
      let label_class = {'class' : 'btn btn-seed-sm btn-warning'}
      if (def_opt === v) {
        label_class['class'] += ' active'
      }
      var label = $('<label>', label_class)
      var input = $('<input>', {'type' : 'radio', 'name' : 'options', 'autocomplete' : 'off'})
      var icon = $('<i>', {'class' : k})
      label.append(input)
      label.append(icon)

      label.on("change", function(e) {
        console.log('label.on::change', target_id, seed_id, v)
        that.xset_annotation_temp(target_id, seed_id, v);
      });

      base.append(label)
    })

    return base;
  }

  get_annotation_status(template_id, rxns, result, cb, fn_fail) {
    //console.log(rxns);
    let rxn_id = rxns.pop()
    let that = this;
    if (rxn_id) {
      this.curation_api.get_template_reaction_annotation_status(template_id, rxn_id, function(e) {
        result[rxn_id] = e
        that.get_annotation_status(template_id, rxns, result, cb, fn_fail)
      }).fail(function() {
        if (fn_fail) {
          fn_fail()
        }
      });
    } else {
      if (cb) {
        cb(result);
      }
    }
  }

  build_controls_container(container, rxn_id, template_id) {
    let that = this;
    this.active_xhr += 1;
    this.curation_api.get_template_reaction_attribute(template_id, rxn_id, function(o) {
      container.html('');
      if (o.active === undefined) {
        o.active = true;
      }
      let active = o.active;
      let is_review = o.review;
      let is_spontaneous = o.spontaneous;
      let check_active = $('<input>', {'type' : 'checkbox', 'checked' : active})
      let check_spont = $('<input>', {'type' : 'checkbox', 'checked' : is_spontaneous})
      let check_review = $('<input>', {'type' : 'checkbox', 'checked' : is_review})

      check_active.click(function() {
        if($(this).is(":checked")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'active', true)
        } else if($(this).is(":not(:checked)")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'active', false)
        }
      });
      check_spont.click(function() {
        if($(this).is(":checked")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'spontaneous', true)
        } else if($(this).is(":not(:checked)")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'spontaneous', false)
        }
      });
      check_review.click(function() {
        if($(this).is(":checked")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'review', true)
        } else if($(this).is(":not(:checked)")){
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'review', false)
        }
      });

      /*
      let button_flag_reaction = $('<button>', {'class' : 'badge-seed-large badge-seed'}).html('Flag Reaction for Review')
      let button_clear_reaction = $('<button>', {'class' : 'badge-seed-large badge-seed'}).html('Clear')
      button_flag_reaction.click(function() {
        if (confirm("Request review?")) {
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'review', true)
        }
      })
      button_clear_reaction.click(function() {
        if (confirm("Clear review?")) {
          that.curation_api.post_template_reaction_attribute(template_id, rxn_id, 'review', false)
        }
      })
       */

      container.append($('<div>').append('Include reaction in template? ').append(check_active))
               .append($('<div>').append('Spontaneous ? ').append(check_spont))
               .append($('<div>').append('Review ? ').append(check_review))

      console.log(o)
    }).always(function() {
      that.active_xhr -= 1;
      console.log('done', rxn_id, 'remaing:', that.loading_count);
    });
  }

  build_comment_section(user_id, date, value) {
    let comment_section = $('<div>', {'class' : 'comment-section'}).append(
      $('<div>', {'class' : ''}).append($('<div>', {'class' : 'float-left'}).html(user_id))
        .append($('<div>', {'class' : 'float-right'}).html(date.toISOString()))).append($('<div>', {'style' : 'clear: both'}).html(value))
    return comment_section
  }

  build_comments_container(container, rxn_id, template_id) {
    let that = this;
    this.active_xhr += 1;

    this.curation_api.get_template_reaction_comment(template_id, rxn_id, function(o) {
      container.html("");
      let comment_container = $('<div>', {'class' : ''});
      container.append(comment_container)
      _.each(o, function(comment) {
        var d = new Date(0);
        d.setUTCSeconds(comment.timestamp);
        let comment_section = that.build_comment_section(comment.user_id, d, comment.comment)

        comment_container.append(comment_section);
        console.log(comment);
      })

      let text_area = $('<textarea>')
      let button_push_comment = $('<button>', {'class' : 'badge-seed-large badge-seed'}).html('Comment')
      button_push_comment.click(function() {
        if (confirm("Post Comment?")) {
          that.curation_api.post_template_reaction_comment(
            template_id,
            rxn_id,
            that.env.config.user,
            text_area.val(), function(o) {
              console.log('posted', o)
              let comment_section = that.build_comment_section(that.env.config.user, new Date(), text_area.val())
              text_area.val('')
              comment_container.append(comment_section);
            })
        }
      });
      container.append($('<div>', {'class' : 'comment-section'}).append(text_area).append(button_push_comment))
      console.log(o)
    }).always(function() {
      that.active_xhr -= 1;
      console.log('done', rxn_id, 'remaing:', that.loading_count);
    });
  }

  build_annotation_container(container, rxn_id, seed_id, cmp_config, template_id, genome_set_id, wide) {
    let that = this;
    this.active_xhr += 1;
    this.curation_api.post_template_annotation_reaction_status(template_id, rxn_id, cmp_config, genome_set_id, function(e) {
      container.html('');
      container.append(that.escher_tooltip_annotation(
        rxn_id,
        seed_id,
        cmp_config,
        'seed.reaction',
        e.annotation,
        e.curation,
        e.manual_function,
        e.manual_ko,
        e.function_rxns,
        wide));
      //console.log('post_template_annotation_reaction_status', e);
    }, undefined, function (e) {
      console.log('@@@', e)
      container.html('<span class="badge badge-danger"><i class="fas fa-bug"></i> Error: ' + rxn_id + '</span> Try refresh the page. If this problem persist contact page admin.');
    }).always(function() {
      that.active_xhr -= 1;
      console.log('done', rxn_id, 'remaing:', that.loading_count);
    });
  }

  ttt3(rxn_id, seed_id, cmp_config, template_id, genome_set_id, ct, wide) {
    let that = this
    if (ct.length) {
      let rxn_annotation_container = $('<div>', {'class' : 'annotation-section'}).html('<i class="fas fa-spinner fa-spin"></i> Loading: ' + rxn_id);
      console.log('ttt2', rxn_id, seed_id, cmp_config, template_id);
      if (wide) {
        let left_section = $('<div>', {'class' : 'col-md-3'})
        let center_section = $('<div>', {'class' : 'col-md-6'})
        let right_section = $('<div>', {'class' : 'col-md-3'})
        let section = $('<div>', {'class' : 'row'}).append(left_section).append(center_section).append(right_section)

        let rxn_controls_container = $('<div>').html('Loading data ...');
        let rxn_comments_container = $('<div>').html('Loading comments ...');

        left_section.html('big phat species tree')
        center_section.append(rxn_annotation_container);
        right_section.append(rxn_controls_container);
        right_section.append(rxn_comments_container);
        ct.append(section);

        that.build_annotation_container(rxn_annotation_container, rxn_id, seed_id, cmp_config, template_id, genome_set_id, wide);
        that.build_controls_container(rxn_controls_container, rxn_id, template_id);
        that.build_comments_container(rxn_comments_container, rxn_id, template_id);
      } else {
        let center_section = $('<div>', {'class' : 'col-md-12'})
        let section = $('<div>', {'class' : 'row'}).append(center_section);
        center_section.append(rxn_annotation_container);
        ct.append(section);

        that.build_annotation_container(rxn_annotation_container, rxn_id, seed_id, cmp_config, template_id, genome_set_id, wide);
      }
    }
  }

  ttt2(rxn_id, seed_id, cmp_config, template_id, genome_set_id, wide = false) {
    let ct = $('#' + this.container_id);
    this.ttt3(rxn_id, seed_id, cmp_config, template_id, genome_set_id, ct, wide)
  }

  ttt(rxn_ids, template_id) {
    let rxn_id = rxn_ids[0];
    let that = this
    api.get_annotation_reaction(rxn_id, function(e1) {
      that.get_annotation_status(template_id, [rxn_id], {}, function(e2) {
        let function_ids = [];
        _.each(e1, function(function_data, function_name) {
          function_ids.push(function_data['id']);
        });
        api.post_template_function_rxns(env.config['target_template'], function_ids, function(e3) {
          //console.log('get_annotation_reaction', e1);
          //console.log('get_template_reaction_annotation_status', e2);
          //console.log('post_template_function_rxns', e3);
          that.escher_tooltip_annotation({'seed.reaction' : [rxn_id]}, e1, $('#view_container'), e2, e3, true)
        })
      });
    }).done(function() {
      console.log('next!')
    });
  }

  build_link_span(text, href) {
    return $('<a>', {
      //'text' : text,
      'href' : href,
      'class' : 'badge badge-sq badge-success badge-annotation-evi',
      'target' : '_blank'
    }).html(text);
  }

  render_source_tag(data) {
    //<a href="#" class="badge badge-success">Success</a>
    //var source_tag = $('<span>', {'text' : '', 'class' : 'label label-annotation-evi'})
    var source = data['source']
    //console.log('render_source', data)
    if (source[0] == 'KEGG') {
      let href = 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + source[1];
      return $('<a>', {
        'text' : source[1] + ' ('+ data['score'] + ')',
        'href' : href,
        'class' : 'badge badge-sq badge-success badge-annotation-evi',
        'target' : '_blank'
      }); //'<a href= target="_blank">' + source[1] + '</a>' + ' ('+ data['score'] + ')'
    }
    if (source[0] == 'template') {
      return $('<span>', {'text' : source[1], 'class' : 'label label-annotation-evi'});
    }
    if (source[0] == 'manual') {
      return $('<span>', {'text' : source[1], 'class' : 'label badge-info'});
    }
    return source
  }

  build_source_tags(source_tags) {

  }

  build_annotation_row(default_opt, seed_id, annotation, annotation_id, subsystems, source, evidence, user, is_system, other_rxns) {
    let that = this;
    let control_group = this.create_control_group(this.control_options, default_opt, annotation_id, seed_id, user, is_system);
    let annotation_label = this.render_function(annotation, {subsystems : subsystems});
    let source_tags = $('<div>', {'class' : 'float-left'});
    _.each(source, function(data, text) {
      if (that.source_alias[text]) {
        text = that.source_alias[text]    
      }
      source_tags.append($('<span>',
        {
          'text' : text + ' (' + data[0] + '/' + data[1] + ')',
          'class' : 'label label-annotation-source'
        }));
      source_tags.append(' ')
    });
    if (other_rxns) {
      _.each(other_rxns, function(url, text) {
        source_tags.append(that.build_link_span(text, url));
        source_tags.append(' ')
      });
    }
    let row_container = $('<div>', {'class' : 'seed-annotation-group'})
      .append($('<div>', {'class' : 'float-left'}).append(control_group))
      .append($('<div>', {'class' : 'float-left'}).append(annotation_label))
      .append(source_tags);
    return row_container;
  }

  get_last_users(template_rxns) {
    let result = {}
    if (!template_rxns || !template_rxns.log) {
      return result;
    }
    _.each(template_rxns.log, function(log) {
      let target_id = log.target;
      if (!result[target_id]) {
        result[target_id] = {
          user : undefined,
          timestamp : 0,
          action : undefined
        }
      }
      if (log.timestamp > result[target_id].timestamp) {
        result[target_id].timestamp = log.timestamp;
        result[target_id].user = log.user_id;
        result[target_id].action = log.action;
      }
    });

    return result;
  }

  get_annotation_control_option(curation_data, annotation_id) {
    let default_opt = this.default_option;
    if (curation_data) {
      default_opt = curation_data['functions'][annotation_id];
    }
    return default_opt
  }

  build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, result_container) {
    let annotation_str = function_name;
    let annotation_id = annotation_data.id;
    let that = this;
    let subsystems = annotation_data.subsystems;
    let annotation_source = annotation_data.sources;
    let user = undefined;
    let default_opt = that.get_annotation_control_option(template_rxns, annotation_data.id);
    let others = {}
    if (other_rxns[annotation_id]) {
      _.each(other_rxns[annotation_id], function(other_rxn_opt, other_rxn_id) {
        if (other_rxn_id !== rxn_id) {
          let icon = $('<div>').append($('<i>', {'class' : that.control_options[other_rxn_opt]}))
          console.log(icon.html() + ' ' + other_rxn_id)
          let cmp_config_str = Object.keys(cmp_config).map(x=> x + ':' + cmp_config[x]).join(';')
          others[icon.html() + ' ' + other_rxn_id] = 'view_annotation.html?rxn=' + other_rxn_id +
            '&seed_id=' + seed_id + '&config=' +cmp_config_str
        }
      });
    }
    if (curation_data[annotation_id]) {
      user = curation_data[annotation_id].user;
    }
    let annotation_row = that.build_annotation_row(
      default_opt,
      rxn_id,
      annotation_str,
      annotation_id,
      subsystems,
      annotation_source,
      {},
      user,
      that.system_users[user],
      others);
    result_container.append(annotation_row);

    let row_container = $('<div>', {'class' : 'seed-annotation-group-second'})
    _.each(annotation_data.hits, function(hit) {
      row_container.append(that.render_source_tag(hit));
      row_container.append(' ')
    });
    result_container.append(row_container);

    return annotation_id
  }

  build_reaction_section(rxn_id, database_id, label, wide) {
    let container_section = $('<div>', {'class' : 'seed-annotation-group'})
    container_section.append(this.build_link_span(label, 'http://modelseed.org/biochem/reactions/' + rxn_id));
    //$('<div>', {'id' : 'rxn_container_' + rxn_id})

    api.get_modelseed_reaction(rxn_id, function(o) {
      container_section.append(' ' + o.definition);
    })
    return container_section
  }

  //https://www.uniprot.org/uniprot/?query=AMED_2634&sort=score
  escher_tooltip_annotation(rxn_id, seed_id, cmp_config, database_id,
                            data, template_rxns, manual_functions, manual_kos, other_rxns, wide) {
    let that = this;
    let result_container = $('<div>');
    result_container.append(this.build_reaction_section(seed_id, database_id, rxn_id, wide));
    let star3_container = $('<div>');
    let star2_container = $('<div>');
    let star1_container = $('<div>');
    let star_null_container = $('<div>');
    let star_rej_container = $('<div>');
    result_container.append(star3_container)
    result_container.append(star2_container)
    result_container.append(star1_container)
    result_container.append(star_null_container)
    result_container.append(star_rej_container)
    //console.log('escher_tooltip_annotation',rxn_id, database_id, data)
    console.log('escher_tooltip_annotation',manual_functions, manual_kos)


    let curation_data = this.get_last_users(template_rxns);

    let kegg_kos = {}
    let functions_display = {}
    _.each(data, function(annotation_data, function_name) {
      _.each(annotation_data.hits, function(hit) {
        if (hit['source'][0] == 'KEGG') {
          kegg_kos[hit['source'][1]] = true;
        }
      });
    });

    _.each(data, function(annotation_data, function_name) {
      let default_opt = that.get_annotation_control_option(template_rxns, annotation_data.id);
      console.log(default_opt)
      if (default_opt === 'opt_score1') {
        let annotation_id = that.build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, star3_container)
        functions_display[annotation_id] = true;
      } else if (default_opt === 'opt_score2') {
        let annotation_id = that.build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, star2_container)
        functions_display[annotation_id] = true;
      } else if (default_opt === 'opt_score3') {
        let annotation_id = that.build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, star1_container)
        functions_display[annotation_id] = true;
      } else if (default_opt === 'opt_rej') {
        let annotation_id = that.build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, star_rej_container)
        functions_display[annotation_id] = true;
      } else {
        let annotation_id = that.build_annotation_row_section(rxn_id, annotation_data, function_name, curation_data, other_rxns, cmp_config, template_rxns, star_null_container)
        functions_display[annotation_id] = true;
      }
    });


    _.each(manual_functions.functions, function(value, function_id) {
      if (!functions_display[function_id] && value) {
        let default_opt = that.default_option;
        if (template_rxns) {
          default_opt = template_rxns['functions'][function_id];
        }
        let user = undefined;
        if (curation_data[function_id]) {
          user = curation_data[function_id].user;
        }
        let annotation_row = that.build_annotation_row(
          default_opt,
          rxn_id,
          'manual ' + function_id,
          function_id,
          {},
          {},
          {},
          user,
          that.system_users[user],
          {});
        result_container.append(annotation_row);
        let row_container = $('<div>', {'class' : 'seed-annotation-group-second'})
         row_container.append(that.render_source_tag({'score': 0, 'source': ['manual', 'Manual']}));
        row_container.append(' ')

        result_container.append(row_container);
      }
    });
    console.log('escher_tooltip_annotation', functions_display)


    if (wide) {
      let ko_icons = $('<div>', {'class' : 'float-left', 'style' : 'padding: 5px'});
      let ko_container = $('<div>', {'class' : 'seed-annotation-group', style : 'height: 50px;'})

      _.each(kegg_kos, function(v, ko_id) {
        ko_icons.append(that.build_link_span(ko_id, 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + ko_id))
                .append(' ');
      });


      let input_add_ko = $('<input>', {'class' : 'e-block', placeholder : "KEGG KO ID"});
      let button_add_ko = $('<button>', {'class' : 'btn btn-outline-secondary', 'text' : '+'});
      button_add_ko.click(function() {
        if (input_add_ko.val()) {
          that.curation_api.post_template_annotation_reaction_ko(that.env.config['target_template'], rxn_id, input_add_ko.val(), that.env.config['user'], true, function(e) {
            if (e) {
              ko_icons.append(that.build_link_span(input_add_ko.val(), 'https://www.kegg.jp/dbget-bin/www_bget?ko:' + input_add_ko.val()))
                      .append(' ');
            } else {
              alert('KO ' + input_add_ko.val() + ' not in database');
            }
            console.log('post_template_annotation_reaction_ko', e)

          }, undefined, function() {
            alert('error: ' + input_add_ko.val());
          });
        }
      })

      ko_container.append($('<div>', {'class' : 'float-left'}).append(
        $('<div>', {'class' : 'input-group mb-3'})
          .append($('<div>', {'class' : 'input-group-prepend'}).append($('<span>', {'class' : 'input-group-text', 'text' : 'Add'})))
          .append(input_add_ko)
          .append($('<div>', {'class' : 'input-group-append'}).append(button_add_ko))));
      ko_container.append(ko_icons)
      result_container.append(ko_container);

      let fn_container = $('<div>', {'class' : 'seed-annotation-group', style : 'height: 50px;'})
      let input_add_fn = $('<input>', {'class' : 'e-block', placeholder : "Function ID"});
      let button_add_fn = $('<button>', {'class' : 'btn btn-outline-secondary', 'text' : '+'});
      button_add_fn.click(function() {
        if (input_add_fn.val()) {
          that.curation_api.post_template_annotation_reaction_manual_function(that.env.config['target_template'], rxn_id, input_add_fn.val(), that.env.config['user'], true, function(e) {
            console.log(e);
            console.log('post_template_annotation_reaction_ko', e)

          }, undefined, function() {
            alert('error: ' + input_add_fn.val());
          });
        }
      })
      fn_container.append($('<div>', {'class' : 'float-left'}).append(
        $('<div>', {'class' : 'input-group mb-3'})
          .append($('<div>', {'class' : 'input-group-prepend'}).append($('<span>', {'class' : 'input-group-text', 'text' : 'Add'})))
          .append(input_add_fn)
          .append($('<div>', {'class' : 'input-group-append'}).append(button_add_fn))));
      fn_container.append(JSON.stringify(manual_functions.functions))
      result_container.append(fn_container);
    }

    return result_container;
  }

  get_cmp_config(args) {
    let cmp_config = {'0' : ''};
    if (args.state.annotation && args.state.annotation['seed.compartment']) {
      cmp_config = Object.fromEntries(args.state.annotation['seed.compartment'].split(';').map(x => x.split(':')));
    }
    return cmp_config;
  };

  get_single_seed_id_from_args(args) {
    let seed_id;
    if (args.state.type === 'reaction') {
      if (args.state.annotation && args.state.annotation['seed.reaction']) {
        if (typeof args.state.annotation['seed.reaction'] === "string") {
          seed_id = args.state.annotation['seed.reaction']
        } else {
          _.each(args.state.annotation['seed.reaction'], function(other_seed_id) {
            seed_id = other_seed_id
          });
        }
      } else if (args.state.biggId.startsWith("rxn")) {
        seed_id = args.state.biggId
      }
    }

    return seed_id;
  };

  get_seed_id_from_args(args) {
    let seed_ids = {};

    let cmp_config = get_cmp_config(args);
    console.log(args);
    if (args.state.type === 'reaction') {
      if (args.state.annotation && args.state.annotation['seed.reaction']) {
        if (typeof args.state.annotation['seed.reaction'] === "string") {
          seed_ids[args.state.annotation['seed.reaction']] = cmp_config
        } else {
          _.each(args.state.annotation['seed.reaction'], function(seed_id) {
            seed_ids[seed_id] = cmp_config
          });
        }
      } else if (args.state.biggId.startsWith("rxn")) {
        seed_ids[args.state.biggId] = cmp_config
      }
    }

    return seed_ids;
  };

  is_generic = function (cmp_config) {
    return _.values(cmp_config).indexOf('') >= 0
  };

  tooltip(args) {
    if (this.is_busy()) {
      console.log('reaction_tooltip', this.is_busy());
      return
    }

    let cmp_config = get_cmp_config(args);
    let seed_ids = get_seed_id_from_args(args);
    let seed_id = get_single_seed_id_from_args(args);
    let cmp_config_str = Object.keys(cmp_config).map(x=> x + ':' + cmp_config[x]).join(';');

    this.tinier.render(
      args.el,
      this.tinier.createElement(
        'div',
        {style: tooltip_style},
        this.tinier.createElement(
          'a',
          {
            class: 'badge badge-primary',
            href: 'view_annotation.html?rxn=' + args.state.biggId + '&seed_id=' + seed_id + '&config=' + cmp_config_str,
            target: '_blank'
          },
          this.tinier.createElement(
            'i',
            {class: 'fas fa-external-link-alt'}
          )
        ),
        ' '+ args.state.biggId + ": " + args.state.name
      ),
      // Create a new div element inside args.el
      this.tinier.createElement(
        'div',
        // Style the text based on our tooltip_style object
        { style: tooltip_style, id: 'tooltip_container'},
      ),
    );

    console.log(seed_ids);

    if (_.size(seed_ids) > 0) {
      let seed_id = _.keys(seed_ids)[0];
      if (is_generic(cmp_config)) {
        console.log('tooltip_reaction::generic', seed_id);
        this.curation_api.get_annotation_template_t_reaction_list(seed_id, env.config['target_template'], function(res) {
          console.log('get_annotation_template_t_reaction_list', res);
        })
      } else {
        console.log('tooltip_reaction::cmp_config', seed_id);
        console.log(args.state.biggId, seed_id, seed_ids[seed_id], env.config['target_template'], env.config['genome_set']);

        this.ttt2(args.state.biggId, seed_id, seed_ids[seed_id],
          env.config['target_template'], env.config['genome_set'], false);
      }
    }

    /*
    if (seed_ids.length > 0) {
      get_annotation_status(env.config['target_template'], JSON.parse(JSON.stringify(seed_ids)), {}, function(template_rxns) {
        console.log('template_rxns', template_rxns);
        server_render_tooltip(seed_ids[0], $('#tooltip_container'), template_rxns)
      }, function() {
        console.log('!!! FAIL')
      })
    }

     */
  }
}







