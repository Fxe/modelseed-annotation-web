class WidgetEscherLeftPanel {

  constructor(panel_container) {
    this.container = panel_container;
    this.escher = null;
    this.section_pwy = null
    this.toggle_reaction = {}
    this.metaboliteContainer = undefined;
  }

  init_container() {
    this.container.html("");
    this.container.append($('<div>', {}).html('Pathways'));
    this.section_pwy = $('<div>', {'class' : 'seed-escher-panel-right-content'});
    this.container.append(this.section_pwy);
    let section_rxn = $('<div>', {}).html('Reaction')
    let section_met = $('<div>', {}).html('Metabolite')
    this.metaboliteContainer = $('<div>', {'class' : 'seed-escher-panel-right-content'})
    this.container.append(section_rxn)
                  .append(section_met)
                  .append(this.metaboliteContainer);
  }

  getMetaboliteContainer() {
    return this.metaboliteContainer;
  }

  refresh() {
    this.section_pwy.html("");
    let pwy_data = this.escher.get_map_pathway_data();
    let pwy_depth = 0;
    let that = this;

    _.each(pwy_data, function(pwy_data, pwy_id) {
      that.add_pathway_option(pwy_id, pwy_data, pwy_depth, that.section_pwy);
    });
  }

  paint_reaction_path(id, css) {
    let ct = $('#' + id);
    ct.children( "g" ).children('path').css(css);
  }

  update_paint() {
    let that = this;
    let uid_toggle = {}
    _.each(this.toggle_reaction, function(rxns, pwy_id) {
      _.each(rxns, function(v, uid) {
        if (!uid_toggle[uid]) {
          uid_toggle[uid] = v
        } else {
          uid_toggle[uid] |= v
        }
      });
    })
    _.each(uid_toggle, function(v, uid) {
      if (v) {
        that.paint_reaction_path(uid, {'stroke-dasharray' : '10 5'});
      } else {
        that.paint_reaction_path(uid, {'stroke-dasharray' : '10 0'});
      }
    })
  }

  add_pathway_option(pwy_id, pwy_data, depth, ct) {
    let that = this;
    let checkbox = $('<input>', {'type' : 'checkbox'})
    this.toggle_reaction[pwy_id] = {}
    let rxn_to_uid = this.escher.get_rxn_to_uid();
    _.each(pwy_data.rxns, function(rxn_id) {
      if (rxn_to_uid[rxn_id]) {
        _.each(rxn_to_uid[rxn_id], function(v, uid) {
          that.toggle_reaction[pwy_id]['r' + uid] = false;
        });
      }
    });



    checkbox.click(function(){
      if($(this).is(":checked")) {
        _.each(pwy_data.rxns, function(rxn_id) {
          if (rxn_to_uid[rxn_id]) {
            _.each(rxn_to_uid[rxn_id], function(v, uid) {
              that.toggle_reaction[pwy_id]['r' + uid] = true;
            });
          }
        });
        that.update_paint()
      }
      else if($(this).is(":not(:checked)")){
        _.each(pwy_data.rxns, function(rxn_id) {
          if (rxn_to_uid[rxn_id]) {
            _.each(rxn_to_uid[rxn_id], function(v, uid) {
              that.toggle_reaction[pwy_id]['r' + uid] = false;
            });
          }
        });
        that.update_paint()
      }
    })
    ct.append($('<div>', {'class' : ''}).append(depth).append(checkbox).append(' ' + pwy_data.name))
    _.each(pwy_data.childs, function(pwy_data, pwy_id) {
      that.add_pathway_option(pwy_id, pwy_data, depth + 1, ct);
    })
  }

  set_escher_widget(ew) {
    this.escher = ew
  }
/*
<div>Pathways</div>
<div><input type="checkbox"> 1!!</div>
<div>Overlay</div>
<div>Reaction</div>
<div>Metabolite</div>
*/
}
