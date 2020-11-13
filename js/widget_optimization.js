
class WidgetEscherOptimization {

  constructor(tinier, widgetEscher, widgetEscherPanel, containerId = 'tooltip_container') {
    this.tinier = tinier
    this.containerId = containerId;
    this.widgetEscher = widgetEscher;
    this.widgetEscherPanel = widgetEscherPanel
    this.modelReactions = {}
  }

  updateReactionIndex() {
    let that = this;
    _.each(that.widgetEscher.escher_model.reactions, function(rxn) {
      that.modelReactions[rxn.id] = rxn
    });
  }

  map_net_conversion() {
    let rxn_ids = _.map(this.widgetEscher.escher_map[1].reactions, function(v, k) {return v.bigg_id});
    console.log('map_net_conversion', rxn_ids)
    return this.net_conversion(rxn_ids);
  }

  net_conversion(rxn_ids) {
    let that = this;
    let net = {}

    _.each(rxn_ids, function(rxn_id) {
      if (that.widgetEscher.escher_builder.cobra_model.reactions[rxn_id]) {
        let r = that.widgetEscher.escher_builder.cobra_model.reactions[rxn_id]
        _.each(r.metabolites, function(s, cpd) {
          if (!net[cpd]) {
            net[cpd] = 0;
          }
          net[cpd] += s * parseFloat(r.data_string);
        });
      }
    })

    return net;
  }

  display(net) {
    let ct = widget_escher_optimization.widgetEscherPanel.getMetaboliteContainer();
    this.renderNet(net, ct);
  }

  renderNet(net, ct) {
    let that = this;
    ct.html("")
    _.each(net, function(value, met_id) {
      let n = undefined;
      if (that.widgetEscher.escher_builder.cobra_model.metabolites[met_id]) {
        n = that.widgetEscher.escher_builder.cobra_model.metabolites[met_id].name;
      }
      let row = $('<div>', {'class': 'clearfix'})
      value = value.toFixed(6);
      let color = 'gray'
      if (value > 0) {
        color = 'darkgreen';
      } else if (value < 0) {
        color = 'darkred';
      } else {

      }
      row.append($('<div>', {class: 'float-left'}).html(met_id))
        .append($('<div>', {class: 'float-left', style: 'margin: 0px 10px 0px;' + 'color: ' + color + ';'}).html(value))
        .append($('<div>', {class: 'float-right'}).html(n));
      ct.append(row)
    })
  }

  tooltip(args) {
    let that = this;
    that.tinier.render(
      args.el,
      that.tinier.createElement(
        'div',
        {style: tooltip_style},
        ' '+ args.state.biggId + ": " + args.state.name
      ),
      // Create a new div element inside args.el
      that.tinier.createElement(
        'div',
        // Style the text based on our tooltip_style object
        { style: tooltip_style, id: 'tooltip_container'},
      ),
    );
    this.renderFluxControls(args.state.biggId)
  }

  renderFluxControls(rxnId) {
    let ct = $('#' + this.containerId);
    let that = this;
    if (that.modelReactions[rxnId]) {
      let rxn = that.modelReactions[rxnId];
      let value = $('<div>').html(0)
      let slider = $('<input>', {type: 'range', min: rxn.lower_bound, max: rxn.upper_bound, value: 0, class: 'slider'})
      slider.change(function() {
        value.html(this.value);
      })
      $('<div>', {class: 'slidecontainer'}).append(slider)

      ct.append(slider)
      ct.append(value)
      let inputLb = $('<input>', {type: 'text', value: rxn.lower_bound})
      let inputUb = $('<input>', {type: 'text', value: rxn.upper_bound})
      inputLb.change(function() {
        let val = parseFloat(this.value)
        if (val && val <= parseFloat(inputUb.value)) {
          alert(this.value);
        } else {
          alert('no');
        }
      })
      inputUb.change(function() {
        alert(this.value);
      })
      ct.append(inputLb)
      ct.append(inputUb)
      console.log(rxn);
    } else {
      ct.append(rxnId + ' not in model')
    }
  }
}

//let model_rxns = _.filter(widget_escher.escher_model.reactions, function(o) { return rxn_ids.indexOf(o['id']) >= 0})

/*
_.each(model_rxns, function(r) {
  _.each(r.metabolites, function(s, cpd) {
    if (!net[cpd]) {
      net[cpd] = 0;
    }
    widget_escher.escher_builder.cobra_model.reactions.ATPS4r_c0.name = 'omggggg'
  });
})*/

//let ct = $('#met-test')
