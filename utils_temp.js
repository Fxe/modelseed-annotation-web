const ui_tooltip_options = function(ct, widget_escher, env) {
  let config = env.config.tooltip || {'compound': 'default', 'reaction': 'default', 'gene': 'default'};
  const tooltip_fn_map = {
    'compound': 'fn_tooltip_cpd',
    'reaction': 'fn_tooltip_rxn',
    'gene' : 'fn_tooltip_gene'
  };
  _.each(tooltip_fn_map, function(target_prop, option_group) {
    let options = widget_escher.fn_tooltip_options[option_group];

    if (options) {
      let radioGroupName = 'rad-tooltip-' + option_group;
      ct.append($('<h4>').html('Tooltip: ' + option_group));
      _.each(options, function(fn, options_name) {
        let rad = $('<input>', {'type': 'radio', 'name': radioGroupName, 'value': options_name});
        if (config[option_group] === options_name) {
          rad.attr('checked', 'checked');
          widget_escher.tooltip[target_prop] = fn
        }
        let lbl = $('<label>').html(options_name);
        ct.append(rad).append(lbl).append($('<br>'))
      });
      $('input:radio[name="' + radioGroupName + '"]').change(function() {
        let tooltip_name = $(this).val();
        env.set_tooltip(option_group, tooltip_name);
        widget_escher.tooltip[target_prop] = widget_escher.fn_tooltip_options[option_group][tooltip_name]
      });
    }
  });
};