
class CurationAPI {

  constructor() {
    this.base = '/annotation/api';
  }



  get_server_status(cb) {
    return $.getJSON(this.base + "/status", function(e) {
      if (cb) {
        cb(e);
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

  get_ortholog_annotation_from_rxn(rxn_id, fn_success) {
    return $.getJSON(this.base + "/annotation/ortholog/" + rxn_id, function(e) {
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

  post_build_grid(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/build/grid", params, fn_success, fn_always, fn_error);
  };

  post_escher_cluster(params, fn_success, fn_always, fn_error) {
    return this.post("/escher/cluster", params, fn_success, fn_always, fn_error);
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

  post(url, body, fn_success, fn_always, fn_error) {
    return $.ajax({
      url: this.base + url,
      type: "POST",
      dataType: "json", // expected format for response
      contentType: "application/json; charset=utf-8", // send as JSON
      data: JSON.stringify(body),

      complete: function(o) {
        if (fn_always) {
          fn_always(o);
        }
      },
      success: function(o) {
        if (fn_success) {
          console.log(typeof o)
          fn_success(o);
        }
      },
      error: function(o) {
        if (fn_error) {
          fn_error(o);
        }
      },
    });
  }
}