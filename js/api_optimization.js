class OptimizationAPI {
  constructor() {
    this.base = '/annotation/api/optimization';
  }

  post_get_model_list(userId, fn_success, fn_always, fn_error) {
    let params = {user: userId}
    return this.post('/model', params, fn_success, fn_always, fn_error)
  }

  put_model(userId, modelId, model, fn_success, fn_always, fn_error) {
    let params = {user: userId, model: model}
    return this.post('/model/' + modelId, params, fn_success, fn_always, fn_error)
  }

  get_model_drains(userId, modelId, fn_success, fn_always, fn_error) {
    let params = {user: userId}
    return this.post('/model', params, fn_success, fn_always, fn_error)
  }

  get_model_drains222(userId, modelId, fn_success, fn_always, fn_error) {
    let params = {user: userId}
    return this.post('/model', params, fn_success, fn_always, fn_error)
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