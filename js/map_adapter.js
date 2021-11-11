

class EscherMapAdapter {

  constructor(map) {
    this.map = map;
    this.nodeToReaction = {};
    let that = this;
    _.each(this.map[1].reactions, function(r, reaction_uid) {
      _.each(r.segments, function(s, segment_uid) {

          if (!that.nodeToReaction[s.from_node_id]) {
            that.nodeToReaction[s.from_node_id] = {}
          }
          that.nodeToReaction[s.from_node_id][reaction_uid] = true;
          if (!that.nodeToReaction[s.to_node_id]) {
            that.nodeToReaction[s.to_node_id] = {}
          }
          that.nodeToReaction[s.to_node_id][reaction_uid] = true

        /*
        if (that.map[1].nodes[s.from_node_id].node_type === 'metabolite') {
          if (!that.nodeToReaction[s.from_node_id]) {
            that.nodeToReaction[s.from_node_id] = {}
          }
          that.nodeToReaction[s.from_node_id][reaction_uid] = true
        }
        if (that.map[1].nodes[s.to_node_id].node_type === 'metabolite') {
          if (!that.nodeToReaction[s.to_node_id]) {
            that.nodeToReaction[s.to_node_id] = {}
          }
          that.nodeToReaction[s.to_node_id][reaction_uid] = true
        }
        */
      })
    });
    //console.log(this.nodeToReaction)
  }

  getProtonCompounds(model) {
    let protons = {};
    widget_escher.escher_model.metabolites.forEach(function(o) {
      if (o.annotation && o.annotation['seed.compound']) {
        if (Array.isArray(o.annotation['seed.compound'])) {
          if (o.annotation['seed.compound'].indexOf('cpd00067') >= 0) {
            protons[o.id] = true;
          }
        } else {
          if (o.annotation['seed.compound'] === 'cpd00067') {
            protons[o.id] = true;
          }
        }
      }
    });
    return protons;
  }

  renameReaction(uid, value) {
    this.map[1].reactions[uid].bigg_id = value;
  }

  renameCompound(uid, value) {
    let prev = this.map[1].nodes[uid].bigg_id;
    this.map[1].nodes[uid].bigg_id = value;
    let that = this;
    if (this.nodeToReaction[uid]) {
      _.each(this.nodeToReaction[uid], function(v, reaction_uid) {
        //console.log(uid, value, prev, that.map[1].reactions[reaction_uid].metabolites)
        _.each(that.map[1].reactions[reaction_uid].metabolites, function(o) {
          if (o.bigg_id === prev) {
            o.bigg_id = value
          }
        })
      })
    }

    //renameCompound[that.map[1].nodes[uid].bigg_id] = o.id
  }

  getCompoundAnnotation(c, targetAnnotation) {
    if (c.annotation && c.annotation[targetAnnotation]) {
      if (Array.isArray(c.annotation[targetAnnotation])) {
        return c.annotation[targetAnnotation][0]
      }
      return c.annotation[targetAnnotation]
    }

    if (c.bigg_id) {
      if (c.bigg_id.startsWith('cpd') && c.bigg_id.indexOf('_') == 8) {
        return c.bigg_id.split('_')[0];
      }
      return c.bigg_id
    }

    return c.id
  }

  getReactionAnnotation(r, targetAnnotation) {
    if (r.annotation && r.annotation[targetAnnotation]) {
      if (Array.isArray(r.annotation[targetAnnotation])) {
        return r.annotation[targetAnnotation][0]
      }
      return r.annotation[targetAnnotation]
    }

    if (r.bigg_id) {
      return r.bigg_id
    }

    return r.id
  }

  isMatchMetabolites(reactionMap, reactionModel, protons) {
    //console.log(reactionMap.bigg_id, reactionModel.id, protons)
    let m1 = {}
    _.each(reactionMap.metabolites, function(o) {
      //console.log(o['bigg_id'], protons, protons[o['bigg_id'])
      if (!protons[o['bigg_id']]) {
        m1[o['bigg_id']] = o['coefficient']
      }
    })
    let m2 = {}
    _.each(reactionModel.metabolites, function(coeff, cpd_id) {
      //console.log(cpd_id, coeff, protons, protons.indexOf[cpd_id])
      if (!protons[cpd_id]) {
        m2[cpd_id] = coeff
      }
    })
    //console.log(reactionMap.bigg_id, '->', m1, m2)
    if (_.isEqual(m1, m2)) {
      return true
    }
    let m_ = {}
    _.each(m1, function(v, k) {
      m_[k] = -1 * v
      //console.log(k, -1 * v, m1[k])
    })
    m1 = m_
    //console.log(reactionMap.bigg_id, '<-', m1, m2)
    return _.isEqual(m1, m2);
  }

  adaptToModel2(model, deleteUnmapped=true) {
    let adaptedMap = JSON.parse(JSON.stringify(this.map));
    let modelReactions = {};
    _.each(model.reactions, function(o) {
      modelReactions[o.id] = o
    });
    let deletedReactions = {};
    let keep = {};
    _.each(this.map[1].reactions, function(r, uid) {
      let id = r.bigg_id;
      if (!modelReactions[id]) {
        deletedReactions[uid] = r;
        console.debug('delete', id);
      } else {
        keep[uid] = r;
      }
    });

    let nodes = {};
    let deletedReactionIds = _.keys(deletedReactions);
    _.each(this.nodeToReaction, function(reactions, nodeId) {
      let diff = _.difference(_.keys(reactions), deletedReactionIds);
      //console.log(diff, nodeId, reactions, _.keys(reactions));
      if (diff.length === 0) {
        //console.log('delete', nodeId);
      } else {
        nodes[nodeId] = adaptedMap[1].nodes[nodeId];
        //console.log('kegg', nodeId);
      }
    });

    adaptedMap[1].reactions = keep;
    adaptedMap[1].nodes = nodes;
    return adaptedMap;
  }

  adaptToModel(model, compartment='c0', deleteUnmapped=true) {
    let that = this;
    let targetReactionDatabase = 'seed.reaction';
    let targetCompoundDatabase = 'seed.compound';
    let renameCompound = {};
    let compoundObjects = {};
    let reactionObjects = {};
    let mappedCompounds = {};
    let mappedReactions = {};
    _.each(this.map[1].nodes, function(o, uid) {
      if (o.node_type === 'metabolite') {
        mappedCompounds[uid] = false;
        let i = that.getCompoundAnnotation(o, targetCompoundDatabase);
        if (!compoundObjects[i]) {
          compoundObjects[i] = [];
        }
        compoundObjects[i].push(uid);
      }
    });
    _.each(this.map[1].reactions, function(r, uid) {
      mappedReactions[uid] = false;
      let i = that.getReactionAnnotation(r, targetReactionDatabase);
      if (!reactionObjects[i]) {
        reactionObjects[i] = [];
      }
      reactionObjects[i].push(uid);
    });

    console.log('compoundObjects', compoundObjects);
    console.log('reactionObjects', reactionObjects);

    _.each(model.metabolites, function(o) {
      if (o.compartment === compartment) {
        let compoundAnnotation = that.getCompoundAnnotation(o, targetCompoundDatabase);
        if (compoundObjects[compoundAnnotation]) {
          _.each(compoundObjects[compoundAnnotation], function(node_uid) {
            //console.log(node_uid, that.map[1].nodes[node_uid].bigg_id, o.id)
            that.renameCompound(node_uid, o.id)
            mappedCompounds[node_uid] = true
          });
        }
      }
    });


    let protons = this.getProtonCompounds(model);
    let cpdUidKeep = {};
    _.each(model.reactions, function(r) {
      let reactionAnnotation = that.getReactionAnnotation(r, targetReactionDatabase);
      //console.log(r.id, reactionAnnotation)
      if (reactionObjects[reactionAnnotation]) {
        _.each(reactionObjects[reactionAnnotation], function(reaction_uid) {
          let mapReaction = that.map[1].reactions[reaction_uid];
          let match = that.isMatchMetabolites(mapReaction, r, protons);
          //console.log(r.id, reaction_uid, match);
          if (match) {
            that.renameReaction(reaction_uid, r.id);
            mappedReactions[reaction_uid] = true;

            _.each(mapReaction.segments, function(s, segment_uid) {
              cpdUidKeep[s.from_node_id] = true;
              cpdUidKeep[s.to_node_id] = true;
            })
          }
        })
      }
    });

    let toDelete = [];
    let toDeleteNodes = [];
    _.each(mappedReactions, function(v, reaction_uid) {
      if (!v) {
        toDelete.push(reaction_uid);
        let r = that.map[1].reactions[reaction_uid];
        _.each(r.segments, function(s, segment_uid) {
          if (!cpdUidKeep[s.from_node_id]) {
            toDeleteNodes[s.from_node_id] = true;
          }
          if (!cpdUidKeep[s.to_node_id]) {
            toDeleteNodes[s.to_node_id] = true;
          }
        })
        //delete that.map[1].reactions[reaction_uid];
      }
    });


    return [_.keys(toDeleteNodes), toDelete];
  }
}