/*
 * Entity Detail Flickr View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        FLICKR_URL_BASE = 'http://api.flickr.com/services/feeds/photos_public.gne?tags=pleiades%3Adepicts%3D[id]&format=json&jsoncallback=?';
    
    // View: BookEntityFlickrView (Flickr photos for the entity detail page)
    return BookView.extend({
        className: 'entity-flickr-view panel',
        template: '#flickr-photos-template',
    
        initialize: function() {
            this.photoTemplate = _.template($('#flickr-photo-template').html());
        },
        
        render: function() {
            var view = this,
                book = view.model,
                entityId = state.get('entityid'),
                entity;
				entity = book.entities.get(entityId);
				
                
            // render main template
            view.$el.html(view.template);
                
            // die if no entity
            if (!entityId) return;
            
            // add loading spinner
            view.$el.addClass('loading');
             
            // get Flickr data for this entity
            $.ajax({
                url: FLICKR_URL_BASE.replace('[id]', entity.get('pleiadesid')),
                dataType: 'jsonp',
                success: function(data) {
                    view.$el.removeClass('loading');
                    var photos = data && data.items || [];
                    // XXX hide on fail?
                    if (photos.length && entity.get('pleiadesid') != 0) {
                        view.$('span.flickr-link a')
                            .attr('href', data.link)
                            .parent().show();
                        photos.slice(0,10).forEach(function(photo) {
                            // get the thumbnail image
                            photo.src = photo.media.m.replace('_m.jpg', '_s.jpg');
                            view.$('.photos').append(view.photoTemplate(photo))
                        });
                    } else {
                        view.$('.photos').append('<p>No photos were found.</p>');
                    }
                }
            });
        }
    });
    
});