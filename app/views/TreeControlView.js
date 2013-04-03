/*
 * Tree Control View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: TreeControlView (control buttons)
    return BookView.extend({
        className: 'page-control-view',
        template: '#tree-control-template',
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            view.bindState('change:treeid', view.renderNextPrev, view);
            view.bindState('change:treeview', view.renderPageView, view);
			view.bindState('change:pageid', view.render, view);
        },
        
        render: function() {
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
				page =  book.pages.get(pageId);
				this.trees = page.get('trees');
            // fill in template
            view.renderTemplate(page.toJSON());
            view.renderNextPrev();
          //  view.renderPageView();
        },
        
        renderNextPrev: function() {
            // update next/prev
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
				page =  book.pages.get(pageId),
				treeId = state.get('treeid') || page.get('trees')[0];
                prev = view.prev = page.prevId(treeId),
                next = view.next = page.nextId(treeId);
            // render
            view.$('.prev').toggleClass('on', !!prev);
            view.$('.next').toggleClass('on', !!next);
            view.$('.tree-id').val(treeId);
        },
        
        /*
		TODO: implement the two different kinds of linguistic trees
		renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
            view.$('.showimg').toggleClass('on', pageView == 'text');
            view.$('.showtext').toggleClass('on', pageView == 'image');
        },
        */
        // UI Event Handlers - update state
        
        events: {
            'click .next.on':       'uiNext',
            'click .prev.on':       'uiPrev',
            'click .showimg.on':    'uiShowImage',
            'click .showtext.on':   'uiShowText',
            'change .tree-id':      'uiJumpToPage'
        },
        
        uiNext: function() {
            state.set({ treeid: this.next });
        },
        
        uiPrev: function() {
            state.set({ treeid: this.prev });
        },
        
        uiShowImage: function() {
            state.set({ treeview:'2' })
        },
        
        uiShowText: function() {
            state.set({ treeview:'1' })
        },
        
        uiJumpToPage: function(e) {
			 var view = this,
                book = view.model,
				treeId = e.target.value;
			pageId = state.get('pageid') || book.firstId();
			page =  book.pages.get(pageId);
            if (treeId && page.containsTree(treeId)){
				
                // valid pageId
                state.set({ scrolljump: true });
                state.set('treeid', treeId);
            } else {
                // not valid
                this.renderNextPrev();
                state.set({ 
                    message: {
                        text: "Sorry, there isn't a sentence '" + treeId + "' in this chapter.",
                        type: "error"
                    }
                });
            }
        }
    });
    
});