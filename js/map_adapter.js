

class EscherMapAdapter {

  constructor(map) {
    this.map = map;
    this.nodeToReaction = {}
    let that = this;
    _.each(this.map[1].reactions, function(r, reaction_uid) {
      _.each(r.segments, function(s, segment_uid) {
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
      })
    });
    console.log(this.nodeToReaction)
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
      return r.bigg_id
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

  adaptToModel(model, compartment='c0', deleteUnmapped=true) {
    let that = this;
    let targetReactionDatabase = 'seed.reaction';
    let targetCompoundDatabase = 'seed.compound';
    let renameCompound = {}
    let compoundObjects = {}
    let reactionObjects = {}
    let mappedCompounds = {}
    let mappedReactions = {}
    _.each(this.map[1].nodes, function(o, uid) {
      if (o.node_type === 'metabolite') {
        mappedCompounds[uid] = false;
        let i = that.getCompoundAnnotation(o, targetCompoundDatabase)
        if (!compoundObjects[i]) {
          compoundObjects[i] = [];
        }
        compoundObjects[i].push(uid);
      }
    });
    _.each(this.map[1].reactions, function(r, uid) {
      mappedReactions[uid] = false;
      let i = that.getReactionAnnotation(r, targetReactionDatabase)
      if (!reactionObjects[i]) {
        reactionObjects[i] = [];
      }
      reactionObjects[i].push(uid);
    });

    console.log('compoundObjects', compoundObjects)
    console.log('reactionObjects', reactionObjects)

    _.each(model.metabolites, function(o) {
      if (o.compartment == compartment) {
        let compoundAnnotation = that.getCompoundAnnotation(o, targetCompoundDatabase)
        if (compoundObjects[compoundAnnotation]) {
          _.each(compoundObjects[compoundAnnotation], function(node_uid) {
            //console.log(node_uid, that.map[1].nodes[node_uid].bigg_id, o.id)
            that.renameCompound(node_uid, o.id)
            mappedCompounds[node_uid] = true
          });
        }
      }
    })

    _.each(model.reactions, function(r) {
      let reactionAnnotation = that.getReactionAnnotation(r, targetReactionDatabase)
      //console.log(r.id, reactionAnnotation)
      if (reactionObjects[reactionAnnotation]) {
        _.each(reactionObjects[reactionAnnotation], function(reaction_uid) {
          let mapReaction = that.map[1].reactions[reaction_uid]

          if (that.isMatchMetabolites(mapReaction, r, {'M_h_c':true, 'M_h_m':true, 'M_h_e':true})) {
            that.renameReaction(reaction_uid, r.id)
            mappedReactions[reaction_uid] = true
          }
        })
      }
    });

    let toDelete = []
    _.each(mappedReactions, function(v, reaction_uid) {
      if (!v) {
        toDelete.push(reaction_uid);
        //delete that.map[1].reactions[reaction_uid];
      }
    })


    return toDelete
  }
}