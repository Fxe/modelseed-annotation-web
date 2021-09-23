
class CurationAPI {

  constructor() {
    this.base = '/annotation/api';
  }

  post_get_biochem_sbml(model_id, fn_success, fn_always, fn_error) {
    let params = {}
    return this.post('/escher/biochem/sbml/' + model_id, params, fn_success, fn_always, fn_error)
  }

  post_get_biochem(config, fn_success, fn_always, fn_error) {
    const params = {
      'cmp_config': config
    }
    console.log('post_get_biochem', params)
    return this.post('/escher/biochem', params, fn_success, fn_always, fn_error)
  }

  get_annotation_template_t_reaction_list(seed_id, template_id, fn_success, fn_always, fn_error) {
    return this.get('/template/' + template_id + '/annotation/reaction/' + seed_id + '/list', fn_success, fn_always, fn_error)
  }

  post_get_refit_map(map_id, dataset, cmp_config, escher_map, fn_success, fn_always, fn_error) {
    const params = {
      'cmp_config': cmp_config
    }
    if (escher_map) {
      params['escher_map'] = escher_map
    }
    return this.post('/escher/dataset/' + dataset + '/map/' + map_id, params, fn_success, fn_always, fn_error)
  }

  get_bios_model_list(cb) {
    return this.get('/bios/sbml', cb)
  }

  get_bios_model_species(model_id, spi_id, cb, fn_always, fn_error) {
    return this.get('/bios/sbml/' + model_id + '/spi/' + spi_id, cb, fn_always, fn_error)
  }

  get_bios_all_model_species(model_id, cb, fn_always, fn_error) {
    return this.get('/bios/sbml/' + model_id + '/spi', cb, fn_always, fn_error)
  }

  get_bios_model_reaction(model_id, rxn_id, cb) {
    return this.get('/bios/sbml/' + model_id + '/rxn/' + rxn_id, cb)
  }

  get_bios_database_metabolite(database_id, cpd_id, cb) {
    return this.get('/bios/biodb/' + database_id + '/cpd/' + cpd_id, cb)
  }

  get_bios_database_reaction(database_id, rxn_id, cb) {
    return this.get('/bios/biodb/' + database_id + '/rxn/' + rxn_id, cb)
  }

  post_bios_model_species_mapping_report(database_id, min_score, model_ids, fn_success, fn_always, fn_error) {
    const params = {
      'database': database_id,
      'model_ids': model_ids,
      'score': min_score
    }
    return this.post('/bios/sbml-spi-mapping-report', params, fn_success, fn_always, fn_error)
  }

  post_bios_model_species_mapping(mapping, score, user, fn_success, fn_always, fn_error) {
    const params = {
      'score': score,
      'user': user,
      'mapping-species': mapping
    }
    return this.post('/bios/sbml-spi-mapping', params, fn_success, fn_always, fn_error)
  }

  post_bios_build_merge_model(model_ids, fn_success, fn_always, fn_error) {
    const params = {
      'model_ids': model_ids
    }
    return this.post('/bios/merge-model', params, fn_success, fn_always, fn_error)
  }

  get_server_status(fn_success, fn_always, fn_error) {
    return this.get("/status", fn_success, fn_always, fn_error)
  }

  get_modelseed_compound(seed_id, fn_success) {
    return $.getJSON(this.base + "/biochem/cpd/" + seed_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }
  get_modelseed_reaction(seed_id, fn_success) {
    return $.getJSON(this.base + "/biochem/rxn/" + seed_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }
    
  get_escher_map_list(dataset_id, fn_success) {
    return $.getJSON(this.base + "/escher/dataset/" + dataset_id + "/map", function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }

  get_escher_map(dataset_id, map_id, fn_success) {
    return $.getJSON(this.base + "/escher/dataset/" + dataset_id + "/map/" + map_id, function(ret_val) {
      if (fn_success) {
        fn_success(ret_val);
      }
    })
  }

  post_escher_map_save(map, dataset_id, map_id, user_id, fn_success, fn_always, fn_error) {
    let params = {
      'map' : map,
      'dataset_id' : dataset_id,
      'map_id' : map_id,
      'user_id' : user_id,
    }
    return this.post("/escher/dataset/" + dataset_id + "/map/" + map_id + "/save", params, fn_success, fn_always, fn_error)
    //return this.get("/escher/dataset/" + dataset_id + "/map/" + map_id + "/save", fn_success, fn_always, fn_error)
  }

  get_ortholog_annotation_from_rxn(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/ortholog/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_annotation_reaction(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/rxn/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }


  get_template_reaction_annotation_status(template_id, rxn_id, fn_success) {
    return $.getJSON(this.base + "/template/" + template_id + "/reaction/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_genome_set(genome_set_id, fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + "/annotation/genome_set/" + genome_set_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_genome_set_list(fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + "/annotation/genome_set", function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  get_template_reaction_gene(template_id, rxn_id, fn_success) {
    return $.getJSON(this.base + "/template/" + template_id + "/reaction/" + rxn_id + "/gene", function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  post_get_annotation_reaction_custom(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/rxn/" + rxn_id, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }
  //"/template/<template_id>/annotation/reaction/<rxn_id>/ko/<ko_id>"
  post_template_annotation_reaction_ko(template_id, reaction_id, ko_id, user, value, fn_success, fn_always, fn_error) {
    let params = {
      'user' : user,
      'value' : value
    }
    return this.post("/template/" + template_id + "/annotation/reaction/" + reaction_id + "/ko/" + ko_id, params, fn_success, fn_always, fn_error)
  }

  post_template_annotation_reaction_manual_function(template_id, reaction_id, function_id, user, value, fn_success, fn_always, fn_error) {
    let params = {
      'user' : user,
      'value' : value
    }
    return this.post("/template/" + template_id + "/annotation/reaction/" + reaction_id + "/function/" + function_id, params, fn_success, fn_always, fn_error)
  }

  post_template_annotation_reaction_status(template_id, reaction_id, compartment_config, genome_set_id, fn_success, fn_always, fn_error) {
    let params = {
      'compartment_config' : compartment_config
    }
    if (genome_set_id) {
      params['genome_set_id'] = genome_set_id;
    }
    return this.post("/template/" + template_id + "/annotation/reaction/" + reaction_id + "/status", params, fn_success, fn_always, fn_error)
  }

  post_template_reaction_function(function_id, reaction_id, user_id, template_id, logic, fn_success, fn_always, fn_error) {
    let params = {
      'function_id' : function_id,
      'user_id' : user_id,
      'template_id' : template_id,
      'logic' : logic
    }
    return this.post("/template/" + template_id + "/reaction/" + reaction_id, params, fn_success, fn_always, fn_error);
  }

  post_template_reaction_disable(template_id, reaction_id, fn_success, fn_always, fn_error) {

  }

  post_template_reaction_enable(template_id, reaction_id, fn_success, fn_always, fn_error) {

  }

  get_template_reaction_comment(template_id, reaction_id, fn_success, fn_always, fn_error) {
    return this.get("/template/" + template_id + "/reaction/" + reaction_id + '/comment', fn_success, fn_always, fn_error)
  }

  post_template_reaction_comment(template_id, reaction_id, user_id, comment, fn_success, fn_always, fn_error) {
    let params = {
      'user_id' : user_id,
      'comment' : comment,
    }
    return this.post("/template/" + template_id + "/reaction/" + reaction_id + '/comment', params, fn_success, fn_always, fn_error);
  }

  get_template_reaction_attribute(template_id, reaction_id, fn_success, fn_always, fn_error) {
    return this.get("/template/" + template_id + "/reaction/" + reaction_id + '/attributes', fn_success, fn_always, fn_error)
  }

  get_template_reactions_attribute(template_id, reaction_ids, fn_success, fn_always, fn_error) {
    let params = {
      'rxn_ids' : reaction_ids
    }
    return this.post("/template/" + template_id + "/reactions/get/attributes", params, fn_success, fn_always, fn_error)
  }

  post_template_reaction_attribute(template_id, reaction_id, attr, value, fn_success, fn_always, fn_error) {
    let params = {
      'attribute' : attr,
      'value' : value,
    }
    return this.post("/template/" + template_id + "/reaction/" + reaction_id + '/attributes', params, fn_success, fn_always, fn_error);
  }

  post_template_function_rxns(template_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/functions_rxn", params, fn_success, fn_always, fn_error);
  };

  post_build_grid(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/build/grid", params, fn_success, fn_always, fn_error);
  };

  post_escher_cluster(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/cluster", params, fn_success, fn_always, fn_error);
  }
    
  post_escher_cluster_merge(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/merge", params, fn_success, fn_always, fn_error);
  }

  post_escher_merge_map(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/merge2", params, fn_success, fn_always, fn_error);
  }

  post_template_reaction_gene(template_id, rxn_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/reaction/" + rxn_id + "/gene", params, fn_success, fn_always, fn_error);
  }

  post_template_model_compound_reference(template_id, mspi_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/model_compound/" + mspi_id + "/map", params, fn_success, fn_always, fn_error);
  }

  post_template_model_reaction_reference(template_id, mrxn_id, params, fn_success, fn_always, fn_error) {
    return this.post("/template/" + template_id + "/model_reaction/" + mrxn_id + "/map", params, fn_success, fn_always, fn_error);
  }

  get(url, fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + url, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    }).fail(function(e) {
      if (fn_error) {
        fn_error(e);
      }
    })
  }

  post(url, body, fn_success, fn_always, fn_error) {
    return $.ajax({
      url: this.base + url,
      type: "POST",
      dataType: "json", // expected format for response
      contentType: "application/json; charset=utf-8", // send as JSON
      data: JSON.stringify(body),

      complete: function(o) {
        console.log('complete!')
        if (fn_always) {
          fn_always(o);
        }
      },
      success: function(o) {
        console.log('success!')
        if (fn_success) {
          fn_success(o);
        }
      },
      error: function(o) {
        console.log('error!')
        if (fn_error) {
          fn_error(o);
        }
      },
    });
  }
}