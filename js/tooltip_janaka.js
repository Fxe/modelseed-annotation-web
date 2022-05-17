

const tooltip_reaction_janaka = function(args) {
  console.log('tooltip_reaction_janaka');

  //console.log(seed_ids, rxn)
  tinier.render(
    args.el,
    tinier.createElement(
      'div',
      {style: tooltip_style},
      tinier.createElement(
        'a',
        {
          class: 'badge badge-primary',
          href: 'view_annotation.html?rxn=' + args.state.biggId + '&seed_id=' + args.state.biggId + '&config=' + args.state.biggId,
          target: '_blank'
        },
        tinier.createElement(
          'i',
          {class: 'fas fa-external-link-alt'}
        )
      ),
      ' '+ args.state.biggId + ": " + args.state.name
    ),
    // Create a new div element inside args.el
    tinier.createElement(
      'div',
      // Style the text based on our tooltip_style object
      { style: tooltip_style, id: 'tooltip_container'},
    ),
  );
  let seedId = args.state.biggId;
  if (seedId.slice(0, 3) === 'rxn') {
    seedId = seedId.slice(0, 8)
  }
  api.get_modelseed_reaction(seedId,
    function(o) {
      console.log(o)
    },
    function(){

    },
    function () {
      console.log('error', args.state)
  });
};