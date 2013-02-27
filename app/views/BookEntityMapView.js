/*
 * Entity Detail Map View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        settings = gv.settings,
        // map styles
        mapStyle = settings.mapStyle,
        colorThemes = settings.colorThemes;
    
    // View: BookEntityMapView (map content for the entity detail page)
    return BookView.extend({
        className: 'entity-map-view panel fill',
        
        // render and update functions
        
        render: function() {
            if (DEBUG && !window.google) return;
            var view = this,
                entityId = state.get('entityid'),
                book = view.model,
                entity;
                
            // if no entity has been set, give up
            if (!entityId) return;
            // get the entity
            entity = book.entities.get(entityId),
            
            // load map when the entity is ready 
            entity.ready(function() {
                var related = entity.related(book).slice(0, settings.relatedCount),
                    entityPoint = entity.gmapLatLng(),
                    gmaps = google.maps,
                    colorScale = d3.scale.quantize()
                        .domain([1, book.entities.first().get('frequency')])
                        .range(colorThemes),
                    strokeScale = d3.scale.linear()
                        .domain([1, d3.max(related, function(d) { return d.count })])
                        .range([1,10]),
                    // determine bounds
                    bounds = related.reduce(function(bounds, r) {
                            return bounds.extend(r.entity.gmapLatLng());
                        }, new gmaps.LatLngBounds())
                        // include current entity
                        .extend(entityPoint),
                    $container = $('<div></div>').appendTo(view.el);
                
                // deal with layout issues - div must be visible in DOM before map initialization
                setTimeout(function() {
                    // init map
                    var gmap = new gmaps.Map($container[0], {
                            center: bounds.getCenter(),
                            zoom: 4,
                            mapTypeId: gmaps.MapTypeId.TERRAIN,
                            streetViewControl: false,
                            styles: mapStyle
                        }),
                        markers = view.markers = [];
                    
                    // set bounds
                    gmap.fitBounds(bounds);
                    
                    function addMarker(entity, opts) {
                        opts = opts || {};
                        var theme = colorScale(entity.get('frequency')),
                            w = 18,
                            c = w/2,
                            size = new gmaps.Size(w, w),
                            anchor = new gmaps.Point(c, c);
                            
                        title = opts.title || entity.get('title');
                        icon = opts.icon || TimeMapTheme.getCircleUrl(w, theme.color, '99');
                        
                        // add marker
                        var mopts = 
                            marker = new gmaps.Marker({
                            icon: new gmaps.MarkerImage(
                                icon,
                                size,
                                new gmaps.Point(0,0),
                                anchor,
                                size
                            ),
                            position: entity.gmapLatLng(), 
                            map: gmap, 
                            title: title,
                            clickable: !opts.noclick,
                            zIndex: opts.zIndex
                        });
                        
                        if (!opts.noclick) {
                            // UI listener
                            gmaps.event.addListener(marker, 'click', function() {
                                state.set({ entityid: entity.id });
                                gv.app.updateView(true);
                            });
                        }
                        
                        markers.push(marker);
                    }
                    
                    // add markers for current entity
                    addMarker(entity, { 
                        icon: 'images/star.png',
                        noclick: true,
                        zIndex: 1000
                    });
                    
                    // add markers and lines for related entities
                    related.forEach(function(r) {
                        // add polyline
                        new gmaps.Polyline({
                            path: [entityPoint, r.entity.gmapLatLng()],
                            map: gmap,
                            clickable: false,
                            geodesic: true,
                            strokeColor: 'steelblue',
                            strokeOpacity: .7,
                            strokeWeight: strokeScale(r.count)
                        });
                        // add marker
                        addMarker(r.entity, {
                            title: r.entity.get('title') + ': ' + 
                                r.count + ' co-reference' + 
                                (r.count > 1 ? 's' : '')
                        });
                    });
                }, 0);
            });
            
        }
    });
    
});