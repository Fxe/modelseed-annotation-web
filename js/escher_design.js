
class EscherDesign {
  constructor(builder) {
    this.builder = builder;
  }

  init_ui() {
    let that = this;
    let ct = $('#escher-seed-bar2');
    const addButton = function(ct, title, icon, f) {
      let b = $('<button>', {'class': 'btn btn-default simple-button', 'title': title}).append($('<i>', {'class': icon}));
      b.click(f)
      ct.append($('<li>').append(b));
    }
    addButton(ct, 'title1', 'fas fa-arrows-alt-h',function() {
      that.hAlign();
    })
    addButton(ct, 'title1', 'fas fa-arrows-alt-v',function() {
      that.vAlign();
    })
    addButton(ct, 'title1', 'fas fa-align-justify',function() {
      that.hSpace();
    })
    addButton(ct, 'title1', 'fas fa-arrow-down',function() {
      that.vSpace();
    })
    addButton(ct, 'title1', 'fas fa-expand',function() {
      that.alignSegments();
    })
    addButton(ct, 'title1', 'fas fa-recycle',function() {
      that.moveLabel();
    })
    addButton(ct, 'title1', 'fas fa-bezier-curve',function() {
      that.vAlign();
    })
    addButton(ct, 'title1', 'fas fa-expand',function() {
      that.hAlign();
    })
    addButton(ct, 'title1', 'fas fa-text-height',function() {
      that.vAlign();
    })
    addButton(ct, 'title1', 'fas fa-spinner',function() {
      that.hAlign();
    })
    addButton(ct, 'title1', 'fas fa-shapes',function() {
      that.hAlign();
    })
  }

  moveNode = function(node, x, y) {
    let that = this;
    const map = this.builder.map;
    //move node (reaction + beziers + label)
    let xUpdate = x - node.x;
    let yUpdate = y - node.y;
    if (node.node_type === 'metabolite') {
      //console.log(node.x, x, xUpdate, node.y, y, yUpdate)
      node.label_x += xUpdate
      node.label_y += yUpdate
    }
    //console.log('move', node.node_id, node.node_type, node.x, node.y, xUpdate, yUpdate)
    //console.log('move', node.node_id, node.node_type, node.x, x)
    node.x = x;
    node.y = y;

    if (node.connected_segments) {
      node.connected_segments.forEach(function(s) {
        map.reactions[s.reaction_id]
        let segment = map.reactions[s.reaction_id].segments[s.segment_id];
        let from_node = map.nodes[segment.from_node_id]
        let to_node = map.nodes[segment.to_node_id]
        //console.log(node.node_type, from_node.node_type)
        if (node.node_type === 'midmarker' && from_node.node_type == 'multimarker') {
          //console.log('move multimarker', from_node.x, xUpdate, from_node.y, yUpdate)
          that.moveNode(from_node, from_node.x + xUpdate, from_node.y + yUpdate)
        }
        if (node.node_type === 'midmarker' && to_node.node_type == 'multimarker') {
          //console.log('move multimarker', to_node.x, xUpdate, to_node.y, yUpdate)
          that.moveNode(to_node, to_node.x + xUpdate, to_node.y + yUpdate)
        }
        if (segment.from_node_id == node.node_id && segment.b1) {
          segment.b1.x += xUpdate
          segment.b1.y += yUpdate
        }
        if (segment.to_node_id == node.node_id && segment.b2) {
          segment.b2.x += xUpdate
          segment.b2.y += yUpdate
        }
        //console.log(segment)
      });
    }
  }

  moveLabel() {
    let nodes = this.builder.map.get_selected_nodes()
    for (const uid in nodes) {
      let n = nodes[uid];
      //console.log(n)
      if (n.node_type == 'metabolite') {
        n.label_x = n.x
        n.label_y = n.y + 40
      } else if (n.node_type == 'midmarker') {
        if (n.connected_segments && n.connected_segments.length > 0) {
          let r = this.builder.map.reactions[n.connected_segments[0].reaction_id]
          r.label_x = n.x
          r.label_y = n.y + 40
          //console.log(r)
        }
      }
    }
    this.builder.map.draw_everything()
  }

  replaceNonPrimary() {

  }

  mergeMarkers() {

  }

  vAlign = function(primary = true) {
    let nodes = this.builder.map.get_selected_nodes()
    let xMax = -1 * Number.MAX_VALUE;
    for (const uid in nodes) {
      let n = nodes[uid];
      if ((n.node_type == 'metabolite' && (!primary || n.node_is_primary)) || n.node_type == 'midmarker') {
        if (n.x > xMax) {
          xMax = n.x;
        }
      }
    }

    for (const uid in nodes) {
      let n = this.builder.map.nodes[uid]
      if ((n.node_type == 'metabolite' && (!primary || n.node_is_primary)) || n.node_type == 'midmarker') {
        this.moveNode(n, xMax, n.y)
      }
    }

    this.builder.map.draw_everything()
  };

  hAlign = function(primary = true) {
    let nodes = this.builder.map.get_selected_nodes()
    let yMax = -1 * Number.MAX_VALUE;
    for (const uid in nodes) {
      let n = nodes[uid];
      if ((n.node_type == 'metabolite' && (!primary || n.node_is_primary)) || n.node_type == 'midmarker') {
        if (n.y > yMax) {
          yMax = n.y;
        }
      }
    }

    for (const uid in nodes) {
      let n = this.builder.map.nodes[uid]
      if ((n.node_type == 'metabolite' && (!primary || n.node_is_primary)) || n.node_type == 'midmarker') {
        this.moveNode(n, n.x, yMax)
      }
    }

    this.builder.map.draw_everything()
  };

  radToDeg(radians) {
    var pi = Math.PI;
    return radians * (180/pi);
  }

  alignSegments(primary = true, bezierOffset = 80) {
    let map = this.builder.map;
    let ss = this.getSelectedSegments()
    for (const segUid in ss) {
      let s = ss[segUid];
      if (s.b1 && s.b2) {
        let n1 = map.nodes[s.from_node_id];
        let n2 = map.nodes[s.to_node_id];
        let x1 = n1.x
        let y1 = n1.y
        let x2 = n2.x
        let y2 = n2.y

        let d = Math.sqrt(Math.pow(x2 - x1,2) + Math.pow(y2 - y1,2))
        let theta = Math.atan((x1 - x2) / (y1 - y2))
        let thetaRad = this.radToDeg(theta)
        console.log(s)
        console.log('p1', x1, y1)
        console.log('p2', x2, y2)
        console.log('d', d, 'theta deg/rad', this.radToDeg(theta), theta)
        console.log('x', Math.cos(theta) * d)
        console.log('y', Math.sin(theta) * d)

        console.log('b1', Math.cos(theta) * bezierOffset, Math.sin(theta) * bezierOffset)
        console.log('b2', Math.cos(theta) * (d - bezierOffset), Math.sin(theta) * (d - bezierOffset))
        if (theta < 0) {
          if (x1 > x2) {
            s.b1.x = x1 + Math.sin(theta) * bezierOffset
            s.b2.y = y1 + Math.sin(theta) * (d - bezierOffset)
          } else {
            s.b1.x = x1 - Math.sin(theta) * bezierOffset
            s.b2.y = y1 - Math.sin(theta) * (d - bezierOffset)
          }
          if (y1 > y2) {
            s.b1.y = y1 - Math.cos(theta) * bezierOffset
            s.b2.y = y1 - Math.cos(theta) * (d - bezierOffset)
          } else {
            s.b1.y = y1 + Math.cos(theta) * bezierOffset
            s.b2.y = y1 + Math.cos(theta) * (d - bezierOffset)
          }
        } else {
          if (x1 > x2) {
            s.b1.x = x1 - Math.sin(theta) * bezierOffset
            s.b2.x = x1 - Math.sin(theta) * (d - bezierOffset)
          } else {
            s.b1.x = x1 + Math.sin(theta) * bezierOffset
            s.b2.x = x1 + Math.sin(theta) * (d - bezierOffset)
          }
          if (y1 > y2) {
            s.b1.y = y1 - Math.cos(theta) * bezierOffset
            s.b2.y = y1 - Math.cos(theta) * (d - bezierOffset)
          } else {
            s.b1.y = y1 + Math.cos(theta) * bezierOffset
            s.b2.y = y1 + Math.cos(theta) * (d - bezierOffset)
          }
        }
      }
    }
    this.builder.map.draw_everything()
  }

  getSelectedSegments(primary = true) {
    let map = this.builder.map;
    let nodes = map.get_selected_nodes()
    let selectedUids = {}
    for (const uid in nodes) {
      let n = nodes[uid];
      if ((n.node_type == 'metabolite' && (!primary || n.node_is_primary)) || n.node_type == 'midmarker' || n.node_type == 'multimarker') {
        selectedUids[uid] = true;
      }
    }
    let selectedSegments = {}
    for (const uid in nodes) {
      let n = nodes[uid];
      if (n.connected_segments) {
        n.connected_segments.forEach(function(s) {
          let segment = map.reactions[s.reaction_id].segments[s.segment_id];
          if (selectedUids[segment.from_node_id] && selectedUids[segment.to_node_id]) {
            selectedSegments[s.segment_id] = segment
          }
        });
      }
    }

    return selectedSegments
  }

  hSpace = function(primary = true) {
    let that = this;
    let nodes = this.builder.map.get_selected_nodes()

    let nodesSort = []
    for (const uid in nodes) {
      if ((nodes[uid].node_type === 'metabolite' && (!primary || nodes[uid].node_is_primary)) ||
        nodes[uid].node_type === 'midmarker')

        nodesSort.push(nodes[uid])
    }
    //console.log(nodesSort)
    if (nodesSort.length > 2) {
      nodesSort.sort(function(a, b) {return a.x - b.x});
      var xMin = nodesSort[0].x;
      var xMax = nodesSort[nodesSort.length - 1].x;
      var space = (xMax - xMin) / (nodesSort.length - 1);
      console.log(xMax, xMin, xMax - xMin, space)
      let i = 0;
      nodesSort.forEach(function(n) {
        let updatedX = xMin + space * i++;
        console.log(n.node_type, updatedX)
        that.moveNode(n, updatedX, n.y)
      });
    }

    this.builder.map.draw_everything()
  };

  vSpace = function(escherBuilder) {
    let that = this;
    let nodes = this.builder.map.get_selected_nodes()

    let nodesSort = []
    for (const uid in nodes) {
      if (nodes[uid].node_type === 'metabolite' || nodes[uid].node_type === 'midmarker')
        nodesSort.push(nodes[uid])
    }
    //console.log(nodesSort)
    if (nodesSort.length > 2) {
      nodesSort.sort(function(a, b) {return a.y - b.y});
      var yMin = nodesSort[0].y;
      var yMax = nodesSort[nodesSort.length - 1].y;
      var space = (yMax - yMin) / (nodesSort.length - 1);

      let i = 0;
      nodesSort.forEach(function(n) {
        let updatedY = yMin + space * i++;
        //console.log(n.node_type, updatedY)
        that.moveNode(n, n.x, updatedY)
      });
    }

    this.builder.map.draw_everything()
  };
}







