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
		//	view.renderConnectedTrees();
			view.delegateEvents();
            return view;
        },
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
			if (pageView== null || pageView==""){
				pageView = 'grc';
				state.set({ 'pageview': pageView }); 
			}
            view.$('.text').toggle(pageView == 'grc');
            view.$('.engText').toggle(pageView == 'eng');
        },
        
        renderEntityHighlight: function() {
            var entityId = state.get('entityid');
            // render
            this.$('span.entity').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-entity-id') == entityId);
            });
        },
		
		renderConnectedTrees: function() {
			 var view = this,
			 page = view.model;
			
				 var trees = page.get('trees');                    
                    if (trees.length) {
                         view.$('.trees').append('<h4>Linguistic Trees for this Page:</h4>');
                       trees.forEach(function(tree) {
                            view.$('.trees').append('<p><span class="connected-tree" tree-id="'+tree+'">Linguistic Tree for Sentence #' +
                    tree+'</span></p>')
                        });
					}
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
            'click .entity':     'uiEntityClick',
			'click .connected-tree': 'uiTreeClick',
			'click .section-heading': 'uiSectionClick',
			'click .chapter-heading': 'uiChapterClick'
        },
        uiSectionClick: function(e) {
			var section = $(e.target).attr('section-id');
			if (section) {
				state.set('sectionid', section);
				$(".highlighted").removeClass('highlighted');
				$(e.target).addClass('highlighted');
			}
		},
		 uiChapterClick: function(e) {			
				state.set('sectionid', null);
				$(".highlighted").removeClass('highlighted');
				$(e.target).addClass('highlighted');
			
		},
        uiEntityClick: function(e) {
            var entityId = $(e.target).attr('data-entity-id');
            if (entityId) {
                state.set('entityid', entityId);
            }			
			state.set({ 'readingview': 'timemap' });
        },
		uiTreeClick: function(e) {
            var treeId = $(e.target).attr('tree-id');			
            if (treeId) {
                state.set('treeid', treeId);
				state.set({ 'view': 'tree-view' });
            }
        }
        
    });
    
});