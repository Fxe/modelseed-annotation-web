class WidgetPaperBlast {
  constructor(paperblast_data, container) {
    console.log('!!')
    this.data = paperblast_data;
    this.container = container;
    this.table = null;

    let icons = {
      'EV-EXP' : '<i class="fas fa-flask"></i>',
      'EV-EXP-IDA' : '<i class="fas fa-vial"></i>',
      'EV-COMP-HINF-SEQ-ORTHOLOGY' : '<i class="fas fa-laptop"></i>',
      'EV-COMP-HAINF-FN-FROM-SEQ' : '<i class="fas fa-user-check"></i><i class="fas fa-laptop"></i>',
      'a' : '<i class="fas fa-pastafarianism"></i>', //mutant
      'ban' : '<i class="fas fa-ban"></i>',
      'EV-EXP-IMP-REACTION-BLOCKED' : '<i class="fas fa-pastafarianism"></i><i class="fas fa-ban"></i>'
    };
    let formatSelection = function(state) {
      console.log('formatSelection', state);
      if (icons[state.id]) {
        let res = $('<span>').append(icons[state.id]);
        return res;
      }
      return state.text;
    }
    let formatState = function(state) {
      //console.log(state);
      if (!state.id) {
        return state.text;
      }

      let baseUrl = "/user/pages/images/flags";
      let $state = $(
        '<span><img src="' + baseUrl + '/' + state.element.value.toLowerCase() + '.png" class="img-flag" /> ' + state.text + '</span>'
      );
      let res = $('<span>')
      if (icons[state.id]) {
        res.append(icons[state.id]).append(' ');
      }
      res.append(state.text);
      return res;
    };
    let that = this;
    this.table_config = {
      "aoColumnDefs": [
        {
          // `data` refers to the data for the cell (defined by `mData`, which
          // defaults to the column being worked with, in this case is the first
          // Using `row[0]` is equivalent.
          "mRender": function ( data, type, row ) {
            return data['gene_hit'] + '<br>' + data['gene_id'] + '<br>' + data['gene_db'];
          },
          "width": "200px",
          "aTargets": [ 0 ]
        },
        {
          "mRender": function ( data, type, row ) {
            return (data[0] * 100) + '% / ' + (data[1] * 100) + '%';
          },
          "width": "100px",
          "aTargets": [ 1 ]
        },
        {
          "width": "100px",
          "aTargets": [ 2 ]
        },
        {
          "mRender": function ( data, type, row ) {
            return data['title'] + '<br>' + '<small>' + data['journal']  + '</small>' + '<br>' +
              '<small>' + data['authors']  + '</small>';
          },
          "aTargets": [ 3 ]
        },
        {
          "mRender": function ( data, type, row ) {
            return '<div class="js-example-basic-multiple"></div>'
          },
          "aTargets": [ 5 ]
        },
        {
        },
      ],
      "drawCallback": function( settings ) {

        $('.js-example-basic-multiple').select2({
          maximumSelectionLength: 5,
          placeholder: 'This is my placeholder',
          allowClear: true,
          multiple: true,
          //width: '600px',
          templateSelection: that.formatSelection,
          templateResult: that.formatState,
          data : [
            {
              "id": "EV-EXP-IMP-REACTION-BLOCKED",
              "text": "Reaction blocked in mutant"
            },
            {
              "id": "EV-EXP-IDA-PURIFIED-PROTEIN-HH",
              "text": "Assay of protein purified to homogeneity from a heterologous host",
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-PURIFIED-PROTEIN-NH",
              "text": "Assay of protein purified to homogeneity from its native host",
              "disabled": true
            },
            {
              "id": "EV-EXP-IDA-PURIFIED-PROTEIN",
              "text": "Assay of protein purified to homogeneity",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IGI-FUNC-COMPLEMENTATION",
              "text": "Inferred by functional complementation",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-UNPURIFIED-PROTEIN-HH",
              "text": "Assay of unpurified protein expressed in a heterologous host",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-UNPURIFIED-PROTEIN",
              "text": "Assay of unpurified protein",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-UNPURIFIED-PROTEIN-NH",
              "text": "Assay of unpurified protein expressed in its native host",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-PART-PURIFIED-PROTEIN-NH",
              "text": "Assay of protein partially-purified from its native host",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IMP",
              "text": "Inferred from mutant phenotype",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP",
              "text": "Inferred from experiment",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA",
              "text": "Inferred from direct assay",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-PART-PURIFIED-PROTEIN",
              "text": "Assay of partially-purified protein",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-COMP-HINF-FN-FROM-SEQ",
              "text": "Human inference of function from sequence",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IMP-REACTION-ENHANCED",
              "text": "Reaction enhanced in mutant",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IDA-PART-PURIFIED-PROTEIN-HH",
              "text": "Assay of protein partially-purified from a heterologous host",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IGI",
              "text": "Inferred from genetic interaction",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-IEP",
              "text": "Inferred from expression pattern",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-COMP-HINF-SEQ-ORTHOLOGY",
              "text": "Human inference of function by sequence orthology",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-EXP-TAS",
              "text": "Traceable author statement to experimental support",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-COMP-HAINF-FN-FROM-SEQ",
              "text": "Inferred by a human author based on computational evidence",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-COMP-AINF-FN-FROM-SEQ",
              "text": "Automated inference of function from sequence",
              "disabled": false,
              "selected": false
            },
            {
              "id": "EV-IC-HINF-FN-FROM-SEQ",
              "text": "Curator inference of function from sequence",
              "disabled": false,
              "selected": false
            }
          ]
        });
      }
    }
  }

  init_container() {
    this.container.html("");
    let table = $('<table>', {'class' : 'table'}).append($('<thead>').append($('<tr>').append($('<th>').html("Gene Hit"))
                                                                                      .append($('<th>').html("Identity/ <br> Coverage"))
                                                                                      .append($('<th>').html("Organism"))
                                                                                      .append($('<th>').html("Title"))
                                                                                      .append($('<th>').html("Text"))
                                                                                      .append($('<th>').html("Controls"))
    ));

    this.container.append(table)



    this.table = table.DataTable(this.table_config);
    this.update();
  }

  update() {
    let rows = [];
    _.each(this.data, function(gene_data, gene_hit) {
      //console.log(gene_hit)
      let gene_db = gene_data['db']
      let gene_id = gene_data['gene_id']
      let gene_url = gene_data['url']
      let organism = gene_data['organism']
      let score_identity = gene_data['identity']
      let score_coverage = gene_data['coverage']
      console.log(gene_data)
      _.each(gene_data.papers, function(lit) {
        let authors = lit.authors;
        let journal = lit.journal;
        let title = lit.title;
        let lit_url = lit.url;
        let text = lit.text;

        let row_data = [
          {'gene_hit' : gene_hit, 'gene_id' : gene_id, 'gene_url' : gene_url, 'gene_db' : gene_db},
          [score_identity, score_coverage],
          organism,
          {'title' : title, 'journal' : journal, 'authors' : authors, 'url' : lit_url},
          text,
          []
        ]
        rows.push(row_data);
      })
    })
    this.table.rows.add(rows).draw();
  }
}