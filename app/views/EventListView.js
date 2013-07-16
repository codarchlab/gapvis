/*
 * EventList View
 */
define(['gv', 'views/BookView'], 
    function(gv, BookView) {
    
    var state = gv.state;
    
    // View: EventListView
    return BookView.extend({
        className: 'eventlist-view',
        template: '#eventlist-template',
        
        initialize: function() {
            var view = this;
			 this.eventTemplateAutomatic = _.template($('#event-item-automatic-template').html());
			 this.eventTemplateManual = _.template($('#event-item-manual-template').html());
            // listen for state changes
            view.bindState('change:pageid',    view.render, view);
			view.bindState('change:sectionid',    view.render, view);
        },
        
        clear: function() {
            var view = this;
            BookView.prototype.clear.call(view);
        },
        
        // render and update functions
        render: function() {
                 var view = this,
                book = view.model,
                map = view.map;
				//view.renderTemplate();
				 // render main template
				//view.$el.html(view.template);                
				
				//view.$('#manual').remove('p');
				//view.$('#automatic').remove('p');
				view.$el.empty();
				// add loading spinner
				view.$el.addClass('loading');
				$.ajax({			
                url: "http://crazyhorse.archaeologie.uni-koeln.de/ThucDb/e5Event/ctsUrn/"+state.getCtsUrn(),
                dataType: 'jsonp',
				
                success: function(data) {
                    view.$el.removeClass('loading');
					view.renderTemplate();
                    var manualEvents = data.manual;
					var automaticEvents = data.automatic;
                    // XXX hide on fail?
                    if (manualEvents.length) {                       
                        manualEvents.forEach(function(event) {
                            view.$('#manual').append(view.eventTemplateManual(event))
                        });
                    } else {
                        view.$('#manual').append('<p>No manually extracted events for this passage.</p>');
                    }
					if (automaticEvents.length) {                       
                        automaticEvents.forEach(function(event) {
                            view.$('#automatic').append(view.eventTemplateAutomatic(event))
                        });
                    } else {
                        view.$('#automatic').append('<p>No automatically extracted events for this passage.</p>');
                    }
					  
				//	$('#event-list-div').append(view.$el);
                }
            });
				
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
        }
    });
    
});