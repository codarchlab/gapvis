/*
 * Entity models
 */
define(['gv', 'models/Model', 'models/Collection'], function(gv, Model, Collection) {
    var settings = gv.settings,
        Entity;
       
    // Model: Entity
    Entity = Model.extend({
        type: 'entity',
    
        defaults: {
            title: "Untitled Entity",
            frequency: 0
        },
        
        isFullyLoaded: function() {
            return !!this.get('uri');
        },
        
        // calculate related entities within a book
        related: function(book) {
            var entity = this,
                key = 'related-' + book.id,
                related = entity.get(key);
            if (!related) {
                // calculate related entities
                related = {};
                book.pages.each(function(page) {
                    var pentities = page.get('entities');
                    if (pentities && pentities.indexOf(entity.id) >= 0) {
                        pentities.forEach(function(p) {
                            if (p != entity.id) {
                                var rkey = [p, entity.id].sort().join('-');
                                if (!(rkey in related)) {
                                    related[rkey] = {
                                        entity: book.entities.get(p),
                                        count: 0
                                    };
                                }
                                related[rkey].count++;
                            }
                        })
                    }
                });
                related = _(_(related).values())
                    .sortBy(function(d) { return -d.count });
                // save
                var o = {};
                o[key] = related;
                entity.set(o);
            }
            return related;
        },
        
        gmapLatLng: function() {
            var ll = this.get('ll');
            return new google.maps.LatLng(ll[0], ll[1]);
        }
    });
    
    // Collection: EntityList
    return Collection.extend({
        model: Entity,
        url: function() {
            return settings.API_ROOT + '/entities' 
        },
        comparator: function(entity) {
            return -entity.get('frequency')
        }
    });
    
});