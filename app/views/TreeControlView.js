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
            //view.renderTreeView();
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
		
		renderTreeView: function() {
            var view = this,
                treeView = state.get('treeview');
				
            // very ugly!            
			if (treeView=='syntactical'){
				d3.select($('#tree_a-container').find('.viewport')[0]).attr('class','viewport on');
				d3.select($('#tree_a-container').find('.svgCanvas')[0]).attr('class','svgCanvas on');
				d3.select($('#tree_t-container').find('.viewport')[0]).attr('class','viewport');
				d3.select($('#tree_t-container').find('.svgCanvas')[0]).attr('class','svgCanvas');
			}
			if (treeView=='tectogrammatical'){
				d3.select($('#tree_a-container').find('.viewport')[0]).attr('class','viewport');
				d3.select($('#tree_a-container').find('.svgCanvas')[0]).attr('class','svgCanvas');
				d3.select($('#tree_t-container').find('.viewport')[0]).attr('class','viewport on');
				d3.select($('#tree_t-container').find('.svgCanvas')[0]).attr('class','svgCanvas on');
			}
			$('#tree_a-container').toggle(treeView=='syntactical');
            $('#tree_t-container').toggle(treeView=='tectogrammatical');
			view.$('.showtecto').toggleClass ('on', !(treeView=='tectogrammatical'));
			view.$('.showsyntac').toggleClass ('on', !(treeView=='syntactical'));
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .next.on':       'uiNext',
            'click .prev.on':       'uiPrev',
         //   'click .showtecto.on':    'uiShowTecto',
         //   'click .showsyntac.on':   'uiShowSyntac',
            'change .tree-id':      'uiJumpToPage'
        },
        
        uiNext: function() {
            state.set({ treeid: this.next });
        },
        
        uiPrev: function() {
            state.set({ treeid: this.prev });
        },
        
        uiShowTecto: function() {
            state.set({ treeview:'tectogrammatical' });
        },
        
        uiShowSyntac: function() {
            state.set({ treeview:'syntactical' });
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