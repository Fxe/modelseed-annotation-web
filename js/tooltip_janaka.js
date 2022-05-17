const render_tooltip_reaction_janaka = function(rxnMapId, data, container, width = '800px') {
  container.html("");
  const base_container = $('<div>', {'style' : "width : " + width, 'class' : 'default-tooltip'});
  base_container.append('Reaction').append($('<div>', {'class' : 'id'}).html(rxnMapId))
    .append($('<div>', {'class' : 'name'}).html('definition: ' + data.definition));
  if (data.aliases && data.aliases['KEGG']) {
    const containerReferences = $('<div>', {'class' : 'name'}).append('KEGG:');
    _.each(data.aliases['KEGG'], function(referenceId) {
      containerReferences.append($('<a>', {target: '_blank', 'href' : 'https://www.genome.jp/entry/' + referenceId, 'class': 'janaka-ref-link'}).text(referenceId))
    });
    base_container.append(containerReferences);
  }
  if (data.aliases && data.aliases['MetaCyc']) {
    const containerReferences = $('<div>', {'class' : 'name'}).append('MetaCyc:');
    _.each(data.aliases['MetaCyc'], function(referenceId) {
      containerReferences.append($('<a>', {target: '_blank', href : 'https://metacyc.org/META/NEW-IMAGE?object=' + referenceId, 'class': 'janaka-ref-link'}).text(referenceId))
    });
    base_container.append(containerReferences);
  }
  if (data['ec_numbers']) {
    const containerReferences = $('<div>', {'class' : 'name'}).append('EC:');
    _.each(data['ec_numbers'].split('|'), function(referenceId) {
      containerReferences.append($('<a>', {target: '_blank', 'href' : 'https://enzyme.expasy.org/EC/' + referenceId, 'class': 'janaka-ref-link'}).text(referenceId))
    });
    base_container.append(containerReferences);
  }

  if (displayTable) {
    base_container.append('<iframe width="100%" height="800" src="https://bioseed.mcs.anl.gov/~janakae/fungal_ortho/' + rxnMapId + '.html" title="Protein Table"></iframe>');
  }


  container.append(base_container);
};

let displayTable = false;
const cachedTooltipData = {};

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
          href: 'https://bioseed.mcs.anl.gov/~janakae/fungal_ortho/' + args.state.biggId + '.html',
          target: '_blank'
        },
        tinier.createElement(
          'i',
          {class: 'fas fa-external-link-alt'}, ' Protein Family Table'
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

  if (cachedTooltipData[seedId]) {
    render_tooltip_reaction_janaka(args.state.biggId, cachedTooltipData[seedId], $('#tooltip_container'));
  } else {
    api.get_modelseed_reaction(seedId,
      function(o) {
        cachedTooltipData[seedId] = o;
        render_tooltip_reaction_janaka(args.state.biggId, o, $('#tooltip_container'));
      },
      function(){

      },
      function () {
        let o = {
          definition: 'reaction ' + args.state.biggId + ' not found in ModelSEED annotation system'
        };
        cachedTooltipData[seedId] = o;
        render_tooltip_reaction_janaka(args.state.biggId, o, $('#tooltip_container'));
      });
  }
};
