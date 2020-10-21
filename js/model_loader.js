class BiochemLoader {
  constructor(widgetEscher, api, apiKbase, env) {
    this.widgetEscher = widgetEscher;
    this.api = api;
    this.apiKbase = apiKbase;
    this.env = env;
  }

  load_env(fn_success, fn_error) {
    if (this.env.config && this.env.config.biochem) {
      if (this.env.config.biochem[0] === 'modelseed') {
        this.load_modelseed(this.env.config.biochem[1], fn_success);
      } else if (this.env.config.biochem[0] === 'kbase') {
        this.load_kbase(this.env.config.biochem[2], this.env.config.biochem[1], fn_success);
      } else if (this.env.config.biochem[0] === 'bios') {
        this.load_bios(this.env.config.biochem[1], fn_success);
      } else {

      }
      console.log('load_env', this.env.config.biochem)
    } else {
      this.load_modelseed('0:', fn_success)
    }
  }

  load_modelseed(config_str, fn_success) {
    let that = this;
    let cmp_config = {};
    let valid = true;
    if (!config_str) {
      config_str = '0:'
    }
    _.each(config_str.split(';'), function(s) {
      let values = s.split(':');
      if (values.length === 2) {
        cmp_config[values[0]] = values[1]
      } else {
        valid = false
      }
    });
    if (valid) {
      that.api.post_get_biochem(cmp_config, function (res) {
        that.env.modelInfo = ['modelseed', config_str]
        that.env.set_config_property('biochem', that.env.modelInfo);
        that.env.set_config_property('biochem_config', config_str); // legacy soon to be removed
        $('#label_model').html(res['id']);
        $('#label_model_icon').html('seed');
        that.widgetEscher.change_model(res);
        if (fn_success) {
          fn_success(res);
        }
      })
    } else {
      alert('bad string: ' + cmp_config_str)
    }
  }

  load_file() {

  }

  load_bios(model_id, fn_success) {
    let that = this;
    if (model_id) {
      that.api.post_get_biochem_sbml(model_id, function(res) {
        that.env.modelInfo = ['bios', model_id]
        that.env.set_config_property('biochem', that.env.modelInfo);
        $('#label_model').html(model_id);
        $('#label_model_icon').html('literature');
        that.widgetEscher.change_model(res);
        if (fn_success) {
          fn_success(res);
        }
      });
    }
  }

  load_kbase(id, ws, cb) {
    let that = this;
    this.apiKbase.get_kbase_cobra_model(id, ws, this.env.config.kbase_token, function (model) {
      that.env.modelInfo = ['kbase', ws, id]
      that.env.set_config_property('biochem', that.env.modelInfo);
      $('#label_model').html(id);
      $('#label_model_icon').html('kbase');
      that.widgetEscher.change_model(model);
      if (cb) {
        cb(model);
      }
    })
  }
}