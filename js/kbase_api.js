
class KBaseAPI {

  constructor() {
    this.base = '/annotation/api/kbase';
  }

  get_object(id, workspace_id, token, fn_success, fn_always, fn_error) {
    let url = '/ws/' + workspace_id + '/' + id + '?token=' + token;
    return this.get(url, fn_success, fn_always, fn_error);
  }

  post_export_template(annotation_namespace, input_id, input_workspace, output_id, output_workspace, token,
                       fn_success, fn_always, fn_error) {
    let body = {
      annotation_namespace : annotation_namespace,
      input_id : input_id,
      input_workspace : input_workspace,
      output_id : output_id,
      output_workspace : output_workspace,
      token : token
    }
    return this.post("/export/template", body, fn_success, fn_always, fn_error, "PUT", 600000);
  }

  get(url, fn_success, fn_always, fn_error) {
    return $.getJSON(this.base + url, function(e) {
      if (fn_success) {
        fn_success(e);
      }
    })
  }

  post(url, body, fn_success, fn_always, fn_error, t="POST", timeout=30000) {
    return $.ajax({
      url: this.base + url,
      type: t,
      dataType: "json", // expected format for response
      contentType: "application/json; charset=utf-8", // send as JSON
      data: JSON.stringify(body),
      timeout: timeout,

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