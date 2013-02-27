/*
 * Book Summary Text View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state;
    
    // View: BookSummaryTextView (text content for the book summary)
    return BookView.extend({
        template: '#book-summary-text-template',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model, 
                context = _.extend({}, book.toJSON(), {
                    pageCount: book.pages.length,
                    topEntities: book.entities.toJSON().slice(0,4)
                });
            // fill in template
            view.renderTemplate(context);
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click span.entity':             'uiEntityClick',
            'click button.goto-reading':    'uiGoToReading'
        },
        
        uiEntityClick: function(e) {
            var entityId = $(e.target).attr('data-entity-id');
            if (entityId) {
                state.set('entityid', entityId);
                state.set({ 'view': 'entity-view' });
            }
        },
        
        uiGoToReading: function() {
            state.set({ 'view': 'reading-view' });
        }
    });
    
});