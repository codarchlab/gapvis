/*
 * TimeMap View
 */
define(['gv', 'views/BookView'], 
    function(gv, BookView) {
    
    var state = gv.state;
    
    // View: EntitySummaryView
    return BookView.extend({
        className: 'event-summary-view loading',
        
		initialize: function () {
			var view = this;
			 this.mainTemplate = _.template($('#event-summary-template').html());
			 view.bindState('change:eventid', view.render, view);
		
		},
        clear: function() {           
            BookView.prototype.clear.call(this);
        },
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                eventId = state.get('eventid'),
                entity;
            // if no map or entity has been set, give up
            if (!eventId) {
                return;
            }
            // get the entity
            //entity = book.entities.get(entityId);
			 // add loading spinner
            view.$el.addClass('loading');
             
            // get event from ThucDb
			
            $.ajax({			
                url: 'http://localhost/ThucDb/event/'+eventId+'.json',
                dataType: 'json',
				
                success: function(data) {
                    view.$el.removeClass('loading');
                    var event = data.e5Event;
					
                    if (event.value.length||event.keyword.length) {
						view.$el.html(view.mainTemplate(event));
                    } else {
                       // view.$('.photos').append('<p>No photos were found.</p>');
                    }
                }
            });

            return this;
        },
		events: {
            'click .switchview':       'switchEvent',
			'click .entityswitch':		'switchEntity'
        },
        
        switchEvent: function(evt) {		
			var eventId=$(evt.target).attr('eventId');
			state.set({eventid: eventId});
        },
		 switchEntity: function(evt) {		
			var entityId=$(evt.target).attr('entityId');
			state.set({entityid: entityId});
			state.set({view: 'entity-view'});
        }
    });
    
});