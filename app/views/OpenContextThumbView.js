/*
 * Open Context Thumbnail view
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        OC_URL_BASE = 'http://opencontext.org/sets/.json?targURI=http%3A%2F%2Fpleiades.stoa.org%2Fentities%2F[id]&callback=?';
    
    // View: OpenContextThumbView (photos for the entity detail page)
    return BookView.extend({
        className: 'entity-flickr-view panel fill',
    
        initialize: function() {
            this.template = '<div><h4>Open Context Items</h4><div class="photos"></div></div>';
            this.photoTemplate = _.template($('#flickr-photo-template').html());
        },
        
        render: function() {
            var view = this,
                entityId = state.get('entityid');
                
            // render main template
            view.$el.html(view.template);
                
            // die if no entity
            if (!entityId) return;
            
            // add loading spinner
            view.$el.addClass('loading');
             
            // get Flickr data for this entity
            $.ajax({
                url: OC_URL_BASE.replace('[id]', entityId),
                dataType: 'jsonp',
                success: function(data) {
                    view.$el.removeClass('loading');
                    var photos = data && data.results || [];
                    // XXX hide on fail?
                    if (photos.length) {
                        photos.slice(0,10).forEach(function(photo) {
                            // add the thumbnail image
                            view.$('.photos').append(view.photoTemplate({
                                src: photo.thumbIcon,
                                link: photo.uri,
                                title: photo.label
                            }))
                        });
                    } else {
                        view.$('.photos').append('<p>No photos were found.</p>');
                    }
                }
            });
        }
    });
    
});