/*
 * Page View
 */
define(['gv', 'views/BookView', 'util/slide'], function(gv, BookView, slide) {
    var state = gv.state;
    
    // View: PageView (page content)
    return BookView.extend({
        className: 'single-page panel',
        template: '#page-template',
        
        initialize: function() {
            var view = this,
                page = view.model;
            // listen for state changes
            view.bindState('change:pageview',   view.renderPageView, view);
            view.bindState('change:entityid',    view.renderEntityHighlight, view);
            // set backreference
            page.view = view;
            // load page
            page.ready(function() {
                view.render();
            });
        },
        
        render: function() {
            var view = this;
            view.renderTemplate();
            view.renderPageView();
            view.renderEntityHighlight();
			view.delegateEvents();
            return view;
        },
        
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
            view.$('.text').toggle(pageView == 'text');
            view.$('.img').toggle(pageView == 'image');
        },
        
        renderEntityHighlight: function() {
            var entityId = state.get('entityid');
            // render
            this.$('span.entity').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-entity-id') == entityId);
            });
        },
        
        open: function(width, fromRight) {
            this.$el.width(width - 24); // deal with padding
            slide(this.$el, true, fromRight ? 'right' : 'left');
        },
        
        close: function(fromRight) {
            this.$el.hide();
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .entity':     'uiEntityClick'
        },
        
        uiEntityClick: function(e) {
            var entityId = $(e.target).attr('data-entity-id');
            if (entityId) {
                state.set('entityid', entityId);
            }
        }
        
    });
    
});