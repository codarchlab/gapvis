/*
 * Event Detail Timeline View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: EventTimelineView
    return BookView.extend({
        className: 'event-timeline-view panel fill',
		
        template: '#event-timeline-template',
		centerDate: "-459",
        initialize: function(){
			var view= this,
			 resizeTimerID = null;
			 view.bindState('resize:body',     view.onResize, view);			 
		},
        // render and update functions
        onResize: function (){
		 if (resizeTimerID == null) {
			 resizeTimerID = window.setTimeout(function() {
				 resizeTimerID = null;
				 tl.layout();
			 }, 500);
		 }

		},
		clear: function() {
            BookView.prototype.clear.call(this);
        },
        /*  scrollTo: function() {          
            var view = this,
                book = view.model,
                eventId = state.get('eventid'); 
		}*/
		
        render: function() { 
            var view = this,
                book = view.model,
                eventId = state.get('eventid'),
				tl;
				view.$el.empty();
				// add loading spinner
				view.$el.addClass('loading');
           
				view.$el.html(view.template);
				
				 setTimeout(function() {
						var eventSource = new Timeline.DefaultEventSource();
						var theme = Timeline.ClassicTheme.create();
					   var bandInfos = [
						 Timeline.createBandInfo({
							 width:          "87%", 			 	 
							date:           "-459",
						theme:          theme, // Apply the theme
							eventSource:    eventSource,	
							 intervalUnit:   Timeline.DateTime.YEAR, 
							 intervalPixels: 100
						 }),
						 Timeline.createBandInfo({		 
							overview:       true,        
							 width:          "13%",  			 	 
							date:           "-459",
						 theme:          theme, // Apply the theme
							eventSource:    eventSource,	
							 intervalUnit:   Timeline.DateTime.DECADE, 
							 intervalPixels: 200
						 })
					   ];
						  bandInfos[1].syncWith = 0;
						bandInfos[1].highlight = true;
					   tl = Timeline.create(view.$("#my-timeline").get(0), bandInfos);
					   var eventData;
					   $.ajax({
								url: 'http://hellespont.dainst.org/ThucDb/e5Event/list.json',
								dataType: 'jsonp',
								success: function(data) {
									view.$el.removeClass('loading');
									var events = new Array();
									for (i=0; i<data.events.length; i++){
										events[i] = new Array();
										var start;
										var end;
										var durationEvent;
										if (data.events[i].p4HasTimeSpan.length==1){
											if (data.events[i].p4HasTimeSpan[0]!=null&&
											data.events[i].p4HasTimeSpan[0].p78IsIdentifiedBy[0]!=null&&
											data.events[i].p4HasTimeSpan[0].p78IsIdentifiedBy[0].alter[0]!=null){
												start=data.events[i].p4HasTimeSpan[0].p78IsIdentifiedBy[0].alter[0].value;
												end=start;
												durationEvent = false;
												}
										}
										else if (data.events[i].p4HasTimeSpan.length==2){
											for (j=0; j<2; j++){
												if (data.events[i].p4HasTimeSpan[j].type=="beginning"){
													start=data.events[i].p4HasTimeSpan[j].p78IsIdentifiedBy[0].alter[0].value;
												}
												else {
													end=data.events[i].p4HasTimeSpan[j].p78IsIdentifiedBy[0].alter[0].value;
												}
											}								
											durationEvent = true;
										}
										var icon = "/gapvis/images/blue-circle.png";
										var color = "#58A0DC";
										
										if (eventId==data.events[i].id && start!=null){
											icon = "/gapvis/images/orange-circle.png";
											this.centerDate = start;							
											 color = "#ffa500";
										}
										
										events[i]={"title" : data.events[i].title, 
										"description" : "ID "+data.events[i].id, 
										"end" : end, "start" : start, "durationEvent" : durationEvent, 
										"icon":icon, "color":color, "textColor": "#00000",
										"classname":data.events[i].id};
										
										
									} 
									eventData = new Array();
									eventData = {"dateTimeFormat":"iso8601","events":events};
									 eventSource.clear();
									eventSource.loadJSON(eventData, document.location.href);
									tl.layout();
									 tl.getBand(0).scrollToCenter(Timeline.DateTime.parseGregorianDateTime(this.centerDate));
									
								}
						});
		},0);
               return this;
        },
		events: {
            'click .timeline-event-label': 'goToEvent',
			'click .timeline-event-icon': 'goToEvent',
			'click .timeline-event-tape': 'goToEvent'
        },
		goToEvent: function(evt){
			var eventId=$(evt.target).attr('class').replace(/(([^\s\d]+)-*\d*)|\s/g, "");
			if (eventId){
				state.set({eventid: eventId});
			}
		}		
		
    });
    
});