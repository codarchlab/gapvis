/*
 * TimeMap View
 */
define(['gv', 'views/BookView', 'views/EntityFrequencyBarsView'], 
    function(gv, BookView, EntityFrequencyBarsView) {
    
    var state = gv.state;
    
    // View: InfoWindowView (content for the map infowindow)
    return BookView.extend({
        className: 'infowindow',
        template: '#info-window-template',
        
        initialize: function() {
            var view = this;
            // listen for state changes
            view.bindState('change:entityid',    view.render, view);
            view.bindState('change:pageid',     view.renderNextPrevControl, view);
            view.bindState('change:pageid',     view.renderBarHighlight, view);
            view.bindState('change:mapzoom',    view.renderZoomControl, view);
        },
        
        clear: function() {
            var view = this;
            view.freqBars && view.freqBars.clear();
            BookView.prototype.clear.call(view);
        },
        
        // render and update functions
        render: function() {
            var view = this;
            view.ready(function() {
                view.openWindow();
            })
        },
        
        openWindow: function() {
            var view = this,
                book = view.model,
                map = view.map,
                entityId = state.get('entityid'),
                entity;
            // if no map has been set, give up
            if (!map) return;
            // if there's no entity selected, close the window
            if (!entityId) {
                map.closeBubble();
                return;
            }
            // get the entity
            entity = book.entities.get(entityId);
            // if the entity isn't fully loaded, do so
            entity.ready(function() {
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
                view.renderZoomControl();
                view.renderNextPrevControl();
                // open bubble
                map.openBubble(view.getPoint(), view.el);
                // set a handler to unset entity if close is clicked
                function handler() {
                    if (state.get('entityid') == entityId) {
                        state.unset('entityid');
                    }
                    map.closeInfoBubble.removeHandler(handler);
                }
                map.closeInfoBubble.addHandler(handler);
            });
        },
        
        renderZoomControl: function() {
            this.$('.zoom').toggleClass('on', state.get('mapzoom') < 12);
        },
        
        renderNextPrevControl: function() {
            var view = this,
                pageId = state.get('pageid'),
                entityId = state.get('entityid');
            view.ready(function() {
                var book = view.model,
                    prev = view.prev = book.prevEntityRef(pageId, entityId),
                    next = view.next = book.nextEntityRef(pageId, entityId);
                view.$('.prev').toggleClass('on', !!prev);
                view.$('.next').toggleClass('on', !!next);
                view.$('.controls').toggle(!!(prev || next));
            });
        },
        
        renderBarHighlight: function() {
            var view = this;
            view.ready(function() {
                view.freqBars && view.freqBars.updateHighlight();
            });
        },
        
        getPoint: function() {
            var entityId = state.get('entityid'),
                entity = this.model.entities.get(entityId),
                ll = entity.get('ll');
            return new mxn.LatLonPoint(ll[0], ll[1]);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.zoom.on':       'uiZoom',
            'click span.next.on':       'uiNext',
            'click span.prev.on':       'uiPrev',
            'click span.goto-entity':    'uiGoToEntity'
        },
        
        uiZoom: function() {
            var zoom = state.get('mapzoom');
            zoom = Math.min(zoom+2, 12);
            state.set({ 
                mapzoom: zoom, 
                mapcenter: this.getPoint()
            });
        },
        
        uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
        
        uiGoToEntity: function() {
            state.set({ 'view': 'entity-view' });
        }
    });
    
});