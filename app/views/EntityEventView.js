/*
 * Entity Event View
 */
define(['gv', 'views/BookView'], 
    function(gv, BookView) {
    
    var state = gv.state;
    
    // View: Entity Event View
    return BookView.extend({
        className: 'entity-event-view',
        template: '#entity-event-template',
        
        initialize: function() {
            var view = this;
			 this.eventTemplate = _.template($('#event-item-template').html());
        },
        
        clear: function() {
            var view = this;
            BookView.prototype.clear.call(view);
        },
        
        // render and update functions
        render: function() {
                 var view = this,
                book = view.model,
                entityId = state.get('entityid'),
				api_variable = 'actor',
				heading;
				// if no map or entity has been set, give up
				if (!entityId) {
					return;
				}
				if (entityId.indexOf('org')!= -1 || entityId.indexOf('pers')!= -1){
					heading="This entity is an actor in the following events";
				}
				else {
					heading ="This entity is the place of the following events";
					api_variable = 'place';
				}
				view.$el.empty();
				// add loading spinner
				view.$el.addClass('loading');
				$.ajax({			
                url: "http://hellespont.dainst.org/ThucDb/e5Event/"+api_variable+"/"+entityId,
                dataType: 'jsonp',
				
                success: function(data) {
                    view.$el.removeClass('loading');
					view.renderTemplate();
					view.$('#entity-event-heading').append(heading);
                    var manualEvents = data.manual;
					var automaticEvents = data.automatic;
                    // XXX hide on fail?
                    if (manualEvents.length) {                       
                        manualEvents.forEach(function(event) {
                            view.$('#entity-manual').append(view.eventTemplate(event))
                        });
                    } else {
                        view.$('#entity-manual').append('<p>No manually extracted events for this '+api_variable+'.</p>');
                    }
					if (automaticEvents.length) {                       
                        automaticEvents.forEach(function(event) {
                            view.$('#entity-automatic').append(view.eventTemplate(event))
                        });
                    } else {
                        view.$('#entity-automatic').append('<p>No automatically extracted events for this '+api_variable+'.</p>');
                    }
					  
						view.$('li')
								.css('pointer','default')
								.css('list-style-image','none');
							view.$('li:has(ul)')
								.click(function(event){
								
									if (this == event.target) {
									
										$(this).css('list-style-image',
											(!$(this).children().is(':hidden')) ? 'url(images/plusbox.gif)' : 'url(images/minusbox.gif)');
										$(this).children().toggle('slow');
									}})							
								.css({cursor:'pointer', 'list-style-image':'url(images/minusbox.gif)'})
								.each(function(){
									 var elem = $(this);
										if (elem.find("li").length >10) {
											elem.children().hide();
											elem.css('list-style-image', 'url(images/plusbox.gif)');
										}
									});
							//	.children().hide();
                }
            });
				
        },
		events: {
            'click .switchview':       'switchToTree',
			'click .switchevent':       'switchEvent',
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
        }
    });
    
});