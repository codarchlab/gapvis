/*
 * TimeMap View
 */
define(['gv', 'views/BookView', 'views/EntityFrequencyBarsView'], 
    function(gv, BookView, EntityFrequencyBarsView) {
    
    var state = gv.state;
    
    // View: EntitySummaryView
    return BookView.extend({
        className: 'entity-summary-view loading',
        template: '#entity-summary-template',
        
        clear: function() {
            this.freqBars && this.freqBars.clear();
            BookView.prototype.clear.call(this);
        },
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                entityId = state.get('entityid'),
                entity;
            // if no map or entity has been set, give up
            if (!entityId) {
                return;
            }
            // get the entity
            entity = book.entities.get(entityId);
            entity.ready(function() {
                view.$el.removeClass('loading');
                // create content
                view.renderTemplate(entity.toJSON());
                // add frequency bars
                var freqBars = view.freqBars = new EntityFrequencyBarsView({
                    model: book,
                    entity: entity,
                    el: view.$('div.frequency-bars')[0]
                });
                // render sub-elements
                freqBars.render();
                view.renderBarHighlight();
            });
            return this;
        },
        
        renderBarHighlight: function() {
            this.freqBars.updateHighlight();
        }
    });
    
});