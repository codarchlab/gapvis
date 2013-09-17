/*
 * Reading View
 */
define(['gv', 'views/BookView', 'views/EventListView','views/TimeMapView', 'views/SecondaryLiteratureView'], function(gv, BookView, EventListView, TimeMapView, SecondaryLiteratureView) {
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
			view.secondaryLiteratureView = new SecondaryLiteratureView();
            
            		
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
				view.$el.append(view.eventListView.$el.toggle(false));
				view.$el.append(view.timeMapView.$el.toggle(false));
				view.secondaryLiteratureView.model = book;
				view.secondaryLiteratureView.render();
				view.$el.append(view.secondaryLiteratureView.$el.toggle(false));
				if (state.get('readingview')== null || state.get('readingview')=="")
					state.set({ 'readingview': 'timemap' }); 
				view.$el.children("."+state.get('readingview')+"-view").toggle(true);
            
            return this;
        },
		changeView: function() {	
			if (state.get('readingview')=="timemap"){
				this.render();			
			}
			else {
				$(".reading-view-left").children("div").toggle(false);
				$("."+state.get('readingview')+"-view").toggle(true);
			}
		}
        
       
    });
    
});