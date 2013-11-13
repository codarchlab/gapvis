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
                url: "http://hellespont.dainst.org/ThucDb/e5Event/ctsUrn/"+state.getCtsUrn(),
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
		events: {
            'click .switchview':       'switchToTree',
			'click .switchevent':       'switchEvent',
			'mouseover .switchevent':	'highlightInText',
			'mouseout .switchevent':	'resetUrn'
        },
        
        switchToTree: function(evt) {
		var treebank = $(evt.target).attr('treebank'),
		eventId=$(evt.target).attr('id');
			state.set({eventid: eventId});
			state.set({ treebankid: treebank });
			state.set({treeid: treebank.substr(treebank.indexOf('s')+1,(treebank.indexOf('n')-2)-treebank.indexOf('s'))});
            state.set({ view: "tree-view" });
        },
		  switchEvent: function(evt) {		
			var eventId=$(evt.target).attr('eventId');
			state.set({eventid: eventId});       
			state.set({view: 'event-view'});
        },
		highlightInText: function(evt) {
			var urnString = $(evt.target).attr('urn');
			state.setCtsUrn(urnString);
		},
		resetUrn: function(evt) {
			state.setCtsUrn('');
		}
    });
    
});