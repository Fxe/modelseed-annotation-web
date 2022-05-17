class WidgetEscherLayerControl {

  constructor(mapData, layerIndex, fnSave, fnSaveAs, escherWidget) {
    this.fnSave = fnSave;
    this.fnSaveAs = fnSaveAs;
    this.mapData = mapData;
    this.layerIndex = layerIndex;
    this.escherWidget = escherWidget;
    this.labelName = undefined;
    this.dom = this.init();
    this.visible = true;
    this.kbaseWorkspace = undefined;
  }

  download() {
    console.log('download')
    let data = this.mapData;
    escher.utils.download_json(data, this.layerName())
  }

  validateName(name) {
    let valid = name && name.length > 0 && name.indexOf(' ') === -1;
    if (!valid) {
      alert('Invalid name: ' + name + '. Must be non empty and cannot contain spaces')
    }
    return valid;
  }

  rename() {
    let newValue = prompt(this.layerName());
    if (newValue !== null) {
      console.log('rename', newValue);
      if (this.validateName(newValue)) {
        this.mapData[0]['map_name'] = newValue;
        this.labelName.text(newValue);
      }
    }
  }

  fnRename(newValue) {
    this.mapData[0]['map_name'] = newValue;
    this.labelName.text(newValue);
  }

  fnSaveAction(saveObjectId, saveData) {
    if (this.fnSave) {
      console.log('saaaaave', saveObjectId, saveData)
      this.fnSave(saveObjectId, saveData)
    }
  }

  save() {
    console.log('save')
    this.fnSaveAction(this.layerName(), this.mapData);
  }

  saveAs() {
    console.log('saveAs')
    let newValue = prompt('New Map Name', this.layerName() + '_copy');
    if (this.validateName(newValue)) {
      this.fnRename(newValue);
      this.fnSaveAction(newValue, this.mapData);
    }
  }

  destroy(render=true) {
    delete this.escherWidget.layer[this.layerIndex];
    if (render) {
      this.escherWidget.render();
    }
    this.escherWidget = undefined;
    this.dom.remove();
  }

  removeLayer() {
    console.log('remove');
    if (this.escherWidget.activeLayer === this.layerIndex) {
      alert('cannot remove active layer');
    } else {
      if (confirm('Remove layer: ' + this.layerName())) {
        this.destroy();
      }
    }
  }

  copy() {
    console.log('copy')
    let newValue = prompt('New Copy Map Name', this.layerName() + '_copy');
    if (newValue !== null) {
      let map = JSON.parse(JSON.stringify(this.mapData))
      map[0]['map_name'] = newValue
      let targetLayer = 10;
      let layer = new WidgetEscherLayerControl(map, targetLayer, this.fnSave, this.fnSaveAs, this.escherWidget);
      this.escherWidget.loadLayer(layer);
    }
  }

  layerName() {
    return this.mapData[0]['map_name'];
  }

  init() {
    let that = this;
    let control_group = $('<div>');

    let radio = $('<input>', {type: 'radio', id: 'radio1', name: 'escher-map-radio'});
    radio.change(
      function() {
        if ($(this).is(':checked')) {
          that.escherWidget.activeLayer = that.layerIndex;
          that.escherWidget.escher_map[1].canvas = {
            height: that.escherWidget.escher_builder.map.canvas.height,
            width: that.escherWidget.escher_builder.map.canvas.width,
            x: that.escherWidget.escher_builder.map.canvas.x,
            y: that.escherWidget.escher_builder.map.canvas.y
          };
          that.escherWidget.escher_map = undefined;
          that.escherWidget.render();
        }
      });

    let icon_eye = $('<i>', {class: 'fas fa-eye'});
    let icon_delete = $('<i>', {class: 'fas fa-cog'});
    icon_delete.click(function() {
      console.log('options')
      let modal = $('#modal-map-options');
      modal.find('.modal-title').text(that.layerName());
      modal.modal();
      let actionLabel = $('#icon_label');
      let actionControl= $('#icon_1');

      let fnControlSetup = function(labelValue, domObject, fnClick) {
        domObject.mouseover(function() {actionLabel.text(labelValue);});
        domObject.mouseout(function() {actionLabel.text('');});
        domObject.off('click');
        domObject.click(fnClick);
      }

      fnControlSetup('Save', $('#icon_1'), function() {
        that.save();
      })
      fnControlSetup('Save As', $('#icon_2'), function() {
        that.saveAs();
      })
      fnControlSetup('Download JSON', $('#icon_3'), function() {
        that.download();
      })
      fnControlSetup('Copy to new Layer', $('#icon_4'), function() {
        that.copy();
      })
      fnControlSetup('Rename Map', $('#icon_5'), function() {
        that.rename();
      })
      fnControlSetup('Remove Layer', $('#icon_6'), function() {
        that.removeLayer();
      })
      /*
      if (confirm('Remove layer: ' + label_value)) {
        if (that.activeLayer === layer_index) {
          alert('cannot remove active layer');
        } else {
          that.maps[layer_index] = undefined;
          that.render();
          control_group.remove();
        }
      }*/
    });

    this.labelName = $('<label>', {for: 'radio1'}).html(that.layerName());

    let toggle_visible = $('<label>', {'class': 'switch'});
    toggle_visible.append($('<input>', {'type': 'checkbox', checked: 'checked'}));
    toggle_visible.append($('<span>', {'class': 'slider round'}));

    control_group.append(this.layerIndex).append(radio).append(' ')
      .append(icon_eye).append(' ')
      .append(toggle_visible).append(' ')
      .append(icon_delete).append(' ')
      .append(this.labelName);

    control_group.label = that.layerName();
    control_group.fnSave = that.fnSave;
    control_group.fnSaveAs = that.fnSaveAs;

    return control_group;
  }
}