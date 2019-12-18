const d3_place_svg = function(svg_str, svg_node, x, y, img_size) {
    let svg_g = svg_node.insert('g')
                          .attr('transform', 'translate('
                            + (x - img_size / 2) + ','
                            + (y - img_size / 2) + ')')
                        .html(svg_str);
    return svg_g
}

const d3_place_label = function(svg_node, text, x, y, clazz = '') {
    svg_node.append('text')
        .attr('class', clazz)
        .attr('visibility', 'visible')
        .attr('transform', 'translate(' + x + ',' + y + ')').text(text);
}