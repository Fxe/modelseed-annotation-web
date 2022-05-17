const render_tooltip_compound = function(refs, data, svg_data, container, width = '800px') {
  seed_ids = []
  if (refs['seed.compound']) {
    seed_ids = refs['seed.compound']
  }
  
  console.log('render_tooltip_compound', seed_ids);

  let top_right_label = $('<div>', {'class' : 'top-right'}).append(
    $('<div>', {'class' : 'type-label'}).html('Metabolite'));

  container.html("");
  var base_container = $('<div>', {'style' : "width : " + width, 'class' : 'default-tooltip'})
  base_container.append('Metabolite').append($('<div>', {'class' : 'id'}).html(data.id))
    .append($('<div>', {'class' : 'name'}).html('name: ' + data.name))
    .append($('<div>', {'class' : 'smiles'}).html('smiles: ' + data.smiles))
    .append($('<div>', {'class' : 'name'}).html('aliases: ' + data.aliases))
  base_container.append(top_right_label);

  base_container.append(svg_data);

  container.append(base_container);
};

const tooltip_metabolite = function(args) {
  tinier.render(
    args.el,
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style, id: 'tooltip_container'},
      'Metabolite',

      tinier.createElement(
        'br'
      ),
      tinier.createElement(
        'b',
        {},
        args.state['name']
      ),
      // Update the text to read out the identifier biggId
      '' //JSON.stringify(args.state)
    ),
  );

  if (typeof biochem_api == 'undefined') {
    $('#tooltip_container').html('JS error, biochem API variable not set, use another tooltip');
  } else {
    let cpd_id = biochem_api.detect_id(args.state.biggId);
    biochem_api.get_compound(cpd_id, null, function (data) {
      if (data && data.smiles) {
        chem_api.get_depict(data.smiles, 'smi', {}, function(svg_data) {
          //console.log(data);
          //console.log(svg_data);
          render_tooltip_compound({'seed.compound' : cpd_id}, data, svg_data, $('#tooltip_container'));
        });
      } else {
        render_tooltip_compound({'seed.compound' : cpd_id}, data, "", $('#tooltip_container'));
      }

    });
  }

  //console.log(biochem_api.detect_id(args.state.biggId));
  //render_tooltip_compound();
};