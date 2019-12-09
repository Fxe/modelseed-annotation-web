const draw_show_grid_layout = function(shadow_grid_layout, api) {
  if (_.size(shadow_grid_layout) > 0) {
    let map_id = _.keys(shadow_grid_layout).pop();
    api.get_escher_map('ModelSEED', map_id, function(map_data) {
      _.each(shadow_grid_layout[map_id], function(draw_coordinates) {
        let xx = draw_coordinates[0];
        let yy = draw_coordinates[1];
        let w = draw_coordinates[2];
        let h = draw_coordinates[3];
        let x_offset = (xx * w) + -1 * map_data[1].canvas.x;
        let y_offset = (yy * h) + -1 * map_data[1].canvas.y;
        draw_shadow_map(map_data, x_offset, y_offset);
      });
      //let draw_coordinates = shadow_grid_layout[map_id];
      //console.log(map_id, draw_coordinates);

      //console.log(map_id, (xx * w), (yy * h));
      //console.log(map_id, map_data[1].canvas.x, map_data[1].canvas.y);

      //console.log(map_id, x_offset, y_offset);

      delete shadow_grid_layout[map_id];
      draw_show_grid_layout(shadow_grid_layout, api);
    });
  }
};

const draw_shadow_map = function(map, x_offset = 0, y_offset = 0) {
  if (d3.select('#ghost').empty()) {
    d3.select('.escher-svg').select('g').append('g').attr('id', 'ghost');

  }
  //d3.select('#ghost')
  let g = d3.select('#ghost').append('g').attr('class', 'node');
  _.each(map[1].reactions, function(n, uid) {
    let label_x = n.label_x + x_offset;
    let label_y = n.label_y + y_offset;
    g.append('text')
      .attr('class', 'node-label-ghost label-ghost')
      .attr('visibility', 'visible')
      .attr('transform', 'translate(' + label_x + ',' + label_y + ')').text(n.bigg_id);
    _.each(n.segments, function(segment, segment_uid) {
      let from_x = map[1].nodes[segment.from_node_id].x + x_offset;
      let from_y = map[1].nodes[segment.from_node_id].y + y_offset;
      let to_x = map[1].nodes[segment.to_node_id].x + x_offset;
      let to_y = map[1].nodes[segment.to_node_id].y + y_offset;

      let d = "M" + from_x + "," + from_y;
      if (segment.b1 && segment.b2) {
        d += " C" + (segment.b1.x + x_offset) + "," + (segment.b1.y + y_offset);
        d += " " + (segment.b2.x + x_offset) + "," + (segment.b2.y + y_offset);
      }
      d += " " + to_x + "," + to_y;
      //console.log(d);
      g.append('path').attr('class', 'segment-ghost').attr('d', d);
      //console.log(segment);
    });
    //M-335.1683664477771,-1275.3853394874186 -335.1104687114156,-1255.3854232912902
  });

  _.each(map[1].nodes, function(n, uid) {
    let x = n.x + x_offset; //-519.6796043711398;
    let y = n.y + y_offset; //-1458.4653936863426;
    //console.log(n);
    let r = n.node_type === 'metabolite' ? 10 : 5;
    g.append('circle').attr('class', 'node-circle ' + n.node_type + '-circle-ghost')
      .attr('r', r)
      .attr('transform', 'translate(' + x + ',' + y + ')');
    if (n.node_type === 'metabolite') {
      let label_x = n.label_x + x_offset; //-519.6796043711398;
      let label_y = n.label_y + y_offset; //-1458.4653936863426;
      g.append('text')
        .attr('class', 'node-label-ghost label-ghost')
        .attr('visibility', 'visible')
        .attr('transform', 'translate(' + label_x + ',' + label_y + ')').text(n.bigg_id);
      g.append('text')
        .attr('class', 'node-label-ghost label-ghost')
        .attr('visibility', 'visible')
        .attr('transform', 'translate(' + label_x + ',' + (label_y + 16) + ')').text(n.name);
    } else {
      /*
      let label_x = n.x; //-519.6796043711398;
      let label_y = n.y; //-1458.4653936863426;
      g.append('text')
        .attr('class', 'node-label-ghost label-ghost')
        .attr('visibility', 'visible')
        .attr('transform', 'translate(' + label_x + ',' + label_y + ')').text(uid);
       */
    }
  });
  //d="M-335.0525709750543,-1235.3855070951631 C-334.91940618142394,-1189.3856998440708
  // -391.0237313550224,-1108.1164144028075 -489.75452289214724,-1068.5140724846096"

};