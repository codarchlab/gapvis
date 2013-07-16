/*
 * Reading View
 */
define(['gv', 'views/BookView', 'views/EventListView','views/TimeMapView'], function(gv, BookView, EventListView, TimeMapView) {
    var state = gv.state;
    
    // View: TimemapView
    return BookView.extend({
        className: 'reading-view-left panel fill',
        template: '#reading-view-template',
        
        initialize: function() {
            var view = this,
                book = view.model; 
				view.timeMapView = new TimeMapView();
			view.eventListView = new EventListView();	
            
            		
			view.bindState('change:readingview', view.changeView, view);
        },
        
        clear: function() {
            //this.timeMapView.clear();
			this.eventListView.clear();
            BookView.prototype.clear.call(this);
        },
        
        render: function() {
            var view = this,
                book = view.model;   
            // render template HTML
			//view.$el.html(view.template);   
				view.eventListView.model = book;
				view.eventListView.render();
				view.timeMapView.model = book;
				view.timeMapView.render();
				view.$el.append(/*$("<div class='eventlist-view fill'></div>").append(*/view.eventListView.$el.toggle(false));
			view.$el.append(view.timeMapView.$el);
			
           //    state.set({ 'readingview': "timemap" }); 
            
            return this;
        },
		changeView: function() {			
			$(".reading-view-left").children("div").toggle(false);
			$("."+state.get("readingview")+"-view").toggle(true);
		}
        
       
    });
    
});