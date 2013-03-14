/*
 * Entity Detail Arachne Pictures View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        ARACHNE_ENTITY_URL_BASE = gv.settings.API_ROOT + '/entities/[id]/images.json';
    
    // View: BookEntityArachnePicturesView (Arachne photos for the entity detail page)
    return BookView.extend({
        className: 'entity-flickr-view',
        template: '#arachne-photos-template',
    
        initialize: function() {
            this.photoTemplate = _.template($('#arachne-photo-template').html());
        },
        
        render: function() {
            var view = this,
                book = view.model,
                entityId = state.get('entityid').replace(/\D/g, "");
				
                
            // render main template
            view.$el.html(view.template);
                
            // die if no entity
            if (!entityId) return;
            
            // add loading spinner
            view.$el.addClass('loading');
             
            // get Flickr data for this entity
			
            $.ajax({			
                url: ARACHNE_ENTITY_URL_BASE.replace('[id]', entityId),
                dataType: 'jsonp',
				
                success: function(data) {
                    view.$el.removeClass('loading');
                    var photos = data.images;
                    // XXX hide on fail?
                    if (photos.length) {
                        view.$('span.flickr-link a')
                            .attr('href', data.link)
                            .parent().show();
                        photos.slice(0,4).forEach(function(photo) {
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