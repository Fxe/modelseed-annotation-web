

class KBaseObject {

  constructor(data, info) {
    this.data = data;
    this.info = info;
  }
}

class KBaseAPI {

  constructor() {
    this.base = '/annotation/api/kbase';
  }

  getInfo(objectIdentity, token, fn_success, fn_always, fn_error) {
    let url = '/reference_info/' + objectIdentity;
    return this.get(url, fn_success, fn_always, fn_error, 30000, token);
  }

  getWorkspaceList(token, fn_success, fn_always, fn_error) {
    let url = '/ws';
    return this.get(url, fn_success, fn_always, fn_error, 30000, token);
  }

  get_object_list(workspace_id, token, fn_success, fn_always, fn_error, object_type) {
    let url = '/ws/' + workspace_id;
    if (object_type) {
      url += "?type=" + object_type
    }
    return this.get(url, fn_success, fn_always, fn_error, 30000, token);
  }

  save_object_escher_map(id, workspace_id, escher_map, token, fn_success, fn_always, fn_error) {
    let url = '/ws/' + workspace_id + '/' + id;
    let body = {
      'kbase_type': 'KBaseFBA.EscherMap',
      'data': escher_map
    };
    return this.put(url, body, fn_success, fn_always, fn_error, 600000, token)
  }

  get_object(id, workspace_id, token, fn_success, fn_always, fn_error) {
    let url = '/ws/' + workspace_id + '/' + id;
    let p = id.split('/');
    if (p.length === 3) {
      url = '/ws/' + p[0] + '/' + p[1] + '/' + p[2];
    }
    return this.get(url, fn_success, fn_always, fn_error, 30000, token);
  }

  getObjectEscherMap(id, workspace_id, token, fn_success, fn_always, fn_error) {
    let that = this;
    let p = id.split('/');
    if (p.length === 3) {
      return that.getInfo(id, token, function(info) {
        let url = '/ws/' + info[7] + '/' + info[1] + '/escher_map';
        that.getObject(url, info, token, function (data) {
          let o = new KBaseObject(data, info);
          fn_success(o);
        }, fn_always, fn_error);
      }, fn_always, fn_error);
    } else {
      if (p.length === 2) {
        workspace_id = p[0];
        id = p[1];
      }
      return that.getInfo(workspace_id + '/' + id, token, function(info) {
        let url = '/ws/' + info[7] + '/' + info[1] + '/escher_map';
        that.getObject(url, info, token,function (data) {
          let o = new KBaseObject(data, info);
          fn_success(o);
        }, fn_always, fn_error);
      }, fn_always, fn_error);
    }
  }

  getObjectCobraModel(id, workspace_id, token, fn_success, fn_always, fn_error) {
    let that = this;
    let p = id.split('/');
    if (p.length === 3) {
      that.getInfo(id, token, function(info) {
        let url = '/cobra/' + info[7] + '/' + info[1];
        that.getObject(url, info, token, function (data) {
          let o = new KBaseObject(data, info);
          fn_success(o);
        }, fn_always, fn_error);
      }, fn_always, fn_error)
    } else {
      if (p.length === 2) {
        workspace_id = p[0];
        id = p[1];
      }
      that.getInfo(workspace_id + '/' + id, token, function(info) {
        let url = '/cobra/' + info[7] + '/' + info[1];
        that.getObject(url, info, token,function (data) {
          let o = new KBaseObject(data, info);
          fn_success(o);
        }, fn_always, fn_error);
      }, fn_always, fn_error)
    }

/*
    let url = '/cobra/' + workspace_id + '/' + id;
    if (id.indexOf('/') >= 0) {
      url = '/cobra/none/' + id.replaceAll('/', '_');
    }
    return this.get(url, fn_success, fn_always, fn_error, 30000, token);*/
  }

  post_export_template(annotation_namespace, input_id, input_workspace, output_id, output_workspace, token,
                       clear_reactions, clear_roles, clear_complexes, rxn_ids,
                       fn_success, fn_always, fn_error) {
    let body = {
      annotation_namespace : annotation_namespace,
      input_id : input_id,
      input_workspace : input_workspace,
      output_id : output_id,
      output_workspace : output_workspace,
      clear_reactions: clear_reactions,
      clear_roles: clear_roles,
      clear_complexes: clear_complexes,
      rxn_ids: rxn_ids
    };
    return this.put("/export/template", body, fn_success, fn_always, fn_error, 600000, token);
  }

  getObject(url, info, token, fn_success, fn_always, fn_error, timeout=30000) {
    return this.post(url, undefined, fn_success, fn_always, fn_error, 'GET', timeout, token)
  }

  get(url, fn_success, fn_always, fn_error, timeout=30000, auth=undefined) {
    return this.post(url, undefined, fn_success, fn_always, fn_error, 'GET', timeout, auth)
  }

  put(url, body, fn_success, fn_always, fn_error, timeout=30000, auth=undefined) {
    return this.post(url, body, fn_success, fn_always, fn_error, 'PUT', timeout, auth)
  }

  post(url, body, fn_success, fn_always, fn_error, t="POST", timeout=30000, auth=undefined) {
    console.debug(t, 'url', url);
    let ajax = {
      url: this.base + url,
      type: t,
      dataType: "json", // expected format for response
      contentType: "application/json; charset=utf-8", // send as JSON
      timeout: timeout,

      complete: function(o) {
        console.debug(t, 'url', url, 'complete!');
        if (fn_always) {
          fn_always(o);
        }
      },
      success: function(o) {
        console.debug(t, 'url', url, 'success!');
        if (fn_success) {
          fn_success(o);
        }
      },
      error: function(o) {
        console.debug(t, 'url', url, 'error!');
        if (fn_error) {
          fn_error(o);
        }
      },
    };
    if (body) {
      ajax.data = JSON.stringify(body)
    }
    if (auth) {
      ajax.beforeSend = function (xhr) {
        xhr.setRequestHeader("Authorization", auth);
      }
    }
    return $.ajax(ajax);
  }
}