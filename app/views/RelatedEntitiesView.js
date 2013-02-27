/*
 * Related Entities View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: RelatedEntitiesView (list of related entities based on collocation)
    return BookView.extend({
        className: 'related-entities-view',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                entityId = state.get('entityid'),
                entity;
            // if no entity has been set, give up
            if (!entityId) return;
            // get the entity
            entity = book.entities.get(entityId);
            entity.ready(function() {
                var related = entity.related(book).slice(0, gv.settings.relatedCount);
                // create content
                view.$el.append('<h4>Top Related Entities</h4>');
                related.forEach(function(r) {
                    $('<p><span class="entity '+r.entity.get('type')+'" data-entity-id="' + 
                        r.entity.id + '">' + r.entity.get('title') +
                        '</span> (' + r.count + ')</p>').appendTo(view.el);
                });
            });
            return this;
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.entity':             'uiEntityClick'
        },
        
        uiEntityClick: function(e) {
            var entityId = $(e.target).attr('data-entity-id');
            if (entityId) {
                state.set('entityid', entityId);
                gv.app.updateView(true);
            }
        }
    });
    
});