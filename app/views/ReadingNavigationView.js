/*
 * Book Navigation View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: NavigationView
    return BookView.extend({
	 className: 'reading-navigation-view',
        template: '#reading-navigation-view-template',
    
        initialize: function() {
            var view = this;
            // listen for all state changes
            view.bindState('change', view.updatePermalink, view);
           // view.bindState('change:entityid', view.updateNavButtons, view);
            view.bindState('change:readingview', view.updateNavButtons, view);
			view.bindState('change:view', view.updateNavButtons, view);
        },
        
        render: function() {
            var view = this;
            // render content and append to parent
            view.renderTemplate();
            // button it
            view.$('.btn-group').button();
            // update
          //  view.updatePermalink();
          //  view.updateNavButtons();
            return view;
        },
        
        updatePermalink: function() {
            this.$('a.permalink').attr('href', gv.router.getPermalink());
        },
        
        updateNavButtons: function() {
            // check the appropriate button
            this.$('button').each(function() {
                var $this = $(this);
                $this.toggleClass('active', $this.attr('reading-view-id') == state.get('readingview'));
            });
        },
        
        // UI event handlers
        
        events: {
            "click button":      "uiGoToView"
        },
        
        uiGoToView: function(evt) {
            
				if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0){
					document.getElementsByClassName('right-panel')[0].removeEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
					}
				else{
					document.getElementsByClassName('right-panel')[0].removeEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
					}
				var viewKey = $(evt.target)
					.closest('[reading-view-id]')
					.attr('reading-view-id');
				state.set({ 'readingview': viewKey });			
        }
        
    
    });
    
});