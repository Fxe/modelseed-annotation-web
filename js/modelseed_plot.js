class ModelSEEDPlotGrid {

  constructor() {
    this.xLabelValues = [];
    this.yLabelValues = [];
  }

  placeGrid = function(atp_data, genomeOrder, yOrder, gridY, fnPolygon, fnMouseOver, fnColor) {
    let yOffset = 0;
    let v = [];
    for (let xIndex=0; xIndex<genomeOrder.length; xIndex++) {
      let genomeId = genomeOrder[xIndex];
      for (let yIndex=0; yIndex<yOrder.length; yIndex++) {
        let yId = yOrder[yIndex];
        if (atp_data[genomeId] && atp_data[genomeId][yId]) {
          let value = atp_data[genomeId][yId];
          if (value && value !== 0) {
            let color = value > 100 ? "red" : value > 20 ? "orange" : value > 10 ? "green" : "steelblue";
            if (fnColor) {
              color = fnColor(value)
            }
            v.push({
              rowId: yId,
              colId: genomeId,
              x: xIndex * (boxSize + boxSpacing),
              y: yOffset + yIndex * (boxSize + boxSpacing),
              v: value,
              color: color
            });
          }
        }
        //console.log(genomeId, yId, atp_data[genomeId][yId])
      }
    }
    let grid = svg.append("g").attr("transform", "translate(" + plotXOffset + ", " + gridY + ")");
    let rects = grid.selectAll("rect").data(v)
      .enter()
      .append("polygon")
      .attr("points", fnPolygon)
      /*
      .append("rect")
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("x", function(d) { return d.x})
      .attr("y", function(d) { return d.y})
      */
      .attr("fill", function(d) { return d.color})
      .on('mouseover', fnMouseOver);
  };

  placeYLabels = function(gridY) {
    let yLabelBlock = svg.append("g").attr("transform", "translate(" + (plotXOffset - 3) + ", " + gridY + ")");
    let k = 0;
    let labels = yLabelBlock.selectAll("g").data(this.yLabelValues).enter()
      .append("g")
      .attr("transform", function() {
        let x = 0;
        let y = boxTotal * k++;
        return "translate(" + x + ", " + y + ")"
      })
      .append("text")
      .attr("text-anchor", function(d) { return "end"})
      .attr('y', 8)
      .attr("font-family", function(d) { return "monospace"})
      .attr("font-size", function(d) { return "7px"})
      .text(function (d) { return d});
    return labels;
  };

  placeLabels = function(labelData, x, y) {
    let base = 0;
    let labelSet = svg.append("g")
      .attr("transform", "translate(" + x + "," + y + ")")
    //.attr("x", 50)
    //.attr("y", 50)
    //.attr("stroke", "black")
    //.attr("stroke-width", 1);
    labelSet.selectAll("g")
      .data(labelData).enter()
      .append("g")
      .attr("class", "top-label")
      .attr("transform", function(d) {
        base += d.len * boxTotal;
        let x = base - (d.len * boxTotal);
        let y = 40;
        return "rotate(-45, " + x + ", " + y + ") translate(" + x + "," + y +")"
      })
      //.attr("x", function(d) { base += d.len * 8; return base - (d.len * 8)})
      //.attr("y", function(d) { return 40})
      .append("text")
      .attr("font-family", function(d) { return "monospace"})
      .attr("font-size", function(d) { return "7px"})
      .text(function (d) { return d.value});
  };

  getBlocks = function(genomeOrder, labelX, index) {
    let blocks = [];
    let block = undefined;
    _.each(genomeOrder, function (i) {
      let v = '?';
      if (labelX[i]) {
        if (labelX[i].length > index) {
          v = labelX[i][index]
        } else {
          v = labelX[i][labelX[i].length - 1]
        }
        if (block && block.value !== v) {
          blocks.push(block);
          block = undefined;
        }
        if (block) {
          block.len += 1;
        } else {
          block = {
            'value': v,
            'len': 1
          }
        }
        //console.log(v)
      }
    });
    blocks.push(block);
    return blocks;
  };
}