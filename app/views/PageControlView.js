/*
 * Page Control View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: PageControlView (control buttons)
    return BookView.extend({
        className: 'page-control-view',
        template: '#page-control-template',
        
        initialize: function(opts) {
            var view = this;
            // listen for state changes
            view.bindState('change:pageid', view.render, view);
			 view.bindState('change:pageid', view.revertSection, view);
            view.bindState('change:pageview', view.renderPageView, view);
        },
        
        render: function() {
            var view = this;
            // fill in template
            view.renderTemplate();
            view.renderNextPrev();
            view.renderPageView();
        },
        
        renderNextPrev: function() {
            // update next/prev
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
                prev = view.prev = book.prevId(pageId),
                next = view.next = book.nextId(pageId);
				
            // render
            view.$('.prev').toggleClass('on', !!prev);
            view.$('.next').toggleClass('on', !!next);
            view.$('.page-id').val(pageId);
        },
        revertSection: function() {
			state.set('sectionid', null);
		},
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
			if (state.get('view') == 'reading-view'){
				view.$('.showeng').toggleClass('on', pageView == 'grc');
				view.$('.showgrc').toggleClass('on', pageView == 'eng');
			}
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .next.on':       'uiNext',
            'click .prev.on':       'uiPrev',
            'click .showeng.on':    'uiShowEnglish',
            'click .showgrc.on':   'uiShowGreek',
            'change .page-id':      'uiJumpToPage'
        },
        
        uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
        
        uiShowEnglish: function() {
            state.set({ pageview:'eng' })
        },
        
        uiShowGreek: function() {
            state.set({ pageview:'grc' })
        },
        
        uiJumpToPage: function(e) {
            var pageId = $(e.target).val();
            if (pageId && this.model.pages.get(pageId)) {
                // valid pageId
                state.set({ scrolljump: true });
                state.set('pageid', pageId);
            } else {
                // not valid
                this.renderNextPrev();
                state.set({ 
                    message: {
                        text: "Sorry, there isn't a page '" + pageId + "' in this book.",
                        type: "error"
                    }
                });
            }
        }
    });
    
});