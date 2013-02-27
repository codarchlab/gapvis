/*
 * Related Entities View
 */
define(['gv', 'views/BookView', 'models/Collection',], function(gv, BookView, Collection) {
    var state = gv.state,
        BookRefs;
        
    // make a nonce collection to hold related books
    BookRefs = Collection.extend({
        model: Backbone.Model,
        initialize: function(models, opts) {
            this.entityId = opts.entityId;
        },
        url: function() {
            return gv.settings.API_ROOT + '/entities/' + this.entityId + '/uris.json';
        },
        comparator: function(book) {
            return -book.get('souce');
        }
    });
    
    // View: BookReferencesView (list of entities)
    return BookView.extend({
        className: 'book-refs-view loading',
        
        // render and update functions
        
        render: function() {
            var view = this,
                book = view.model,
                entityId = state.get('entityid'),
                refs;
            // if no entity has been set, give up
            if (!entityId) return;
            // create collection and fetch
            refs = view.refs = new BookRefs([], { entityId: entityId });
            refs.fetch({
                success: function() {
                    view.renderRefs();
                },
                error: function() {
                    if (DEBUG) console.error('Failed to load related entities');
                }
            });
            // create content			
			view.$el.append('<h4>External URIs</h4>');
            return this;
        },
        
        renderRefs: function() {
            var view = this,
                refs = view.refs,
                bookId = state.get('bookid'),
                // just make the template inline
                template = _.template('<p><span class="book-title control on"><a href="<%= url %>" target="_blank">' +
                    '<%= source %></a></span></p>');
            view.$el.removeClass('loading');
            // create list
            /*refs = refs.filter(function(book) {
                return book.id != bookId;
            });*/
            if (refs.length)
               // refs.slice(0, gv.settings.bookRefCount)
                refs.forEach(function(book) {
                    view.$el.append(template(book.toJSON()));
                });			
            else view.$el.append('<p>No other book references were found.</p>');
        }
    });
    
});