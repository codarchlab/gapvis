/*
 * Book model
 */
define(['gv', 'models/Model', 'models/Entities', 'models/Pages'], 
    function(gv, Model, Entities, Pages) {
    
    var settings = gv.settings;
       
    // Model: Book
    return Model.extend({
        type: 'book',
        
        defaults: {
            title: "Untitled Book"
        },
        
        url: function() {
            return settings.API_ROOT + '/books/' + this.id + '.json';
        },
        
        initialize: function() {
            var book = this,
                // create collections
                entities = book.entities = new Entities(),
                pages = book.pages = new Pages();
            // set backreferences
            entities.book = book;
            pages.book = book;
        },
        
        parse: function(data) {
            this.initCollections(data.entities, data.pages);
            return data;
        },
        
        // reset collections with current data
        initCollections: function(entityData, pageData) {
            if (DEBUG) console.log('Initializing book ' + this.id + ': ' +
                pageData.length + ' pages and ' +
                entityData.length + ' entities');
            var entities = this.entities,
                pages = this.pages;
            entities.reset(entityData);
            // convert page ids to strings
            pages.reset(pageData.map(function(p) {
                p.id = String(p.id);
                return p;
            }));
            // calculate frequencies
            pages.each(function(page) {
                page.get('entities').forEach(function(entityId) {
                    var entity = entities.get(entityId);
                        freq = entity.get('frequency');
                    entity.set({ frequency: freq+1 })					
                });
            });
            entities.sort();
        },
        
        isFullyLoaded: function() {
            return !!(this.pages.length && this.entities.length);
        },
        
        // array of page labels for timemap
        labels: function() {
            return this.pages.map(function(p) { return p.id });
        },
        
        // array of items for timemap
        timemapItems: function(startId, endId) {
            var book = this,
                items = [],
                pages = book.pages,
                startIndex = startId ? pages.indexOf(pages.get(startId)) : 0,
                endIndex = endId ? pages.indexOf(pages.get(endId)) : pages.length - 1;
            pages.models.slice(startIndex, endIndex)
                .forEach(function(page) {
                    var entities = _.uniq(page.get('entities'));
                    entities.forEach(function(entityId) {
                        var entity = book.entities.get(entityId),
                            ll = entity.get('ll');
                        items.push({
                            title: entity.get('title'),
                            point: {
                                lat: ll[0],
                                lon: ll[1]
                            },
                            options: {
                                entity: entity,
                                page: page
                            }
                        });
                    });
                });
            return items;
        },
        
        // bounding box for entities, returned as {s,w,n,e}
        bounds: function() {
            // get mins/maxes for bounding box
            var lat = function(ll) { return ll[0] },
                lon = function(ll) { return ll[1] },
                points = _(this.entities.pluck('ll'));
                
            return {
                s: lat(points.min(lat)),
                w: lon(points.min(lon)),
                n: lat(points.max(lat)),
                e: lon(points.max(lon))
            }
        },
        
        // return a google maps API bounding box
        gmapBounds: function() {
            if (DEBUG && !window.google) return;
            var gmaps = google.maps,
                entityBounds = this.bounds();
            return new gmaps.LatLngBounds(
                new gmaps.LatLng(entityBounds.s, entityBounds.w),
                new gmaps.LatLng(entityBounds.n, entityBounds.e)
            );
        },
        
        // next/prev ids
        nextPrevId: function(pageId, prev) {
            var pages = this.pages,
                currPage = pages.get(pageId),
                idx = currPage ? pages.indexOf(currPage) + (prev ? -1 : 1) : -1,
                page = pages.at(idx)
            return page && page.id;
        },
        
        // next page id
        nextId: function(pageId) {
            return this.nextPrevId(pageId);
        },
        
        // previous page id
        prevId: function(pageId) {
            return this.nextPrevId(pageId, true);
        },
        
        // first page id
        firstId: function() {
            var first = this.pages.first()
            return first && first.id;
        },
        
        // next/prev entity references
        nextPrevEntityRef: function(pageId, entityId, prev) {
            var pages = this.pages,
                currPage = pages.get(pageId);
            if (currPage) {
                var idx = pages.indexOf(currPage),
                    test = function(page) {
                        var entities = page.get('entities');
                        return entities.indexOf(entityId) >= 0;
                    },
                    increment = function() { idx += (prev ? -1 : 1); return idx };
                while (currPage = pages.at(increment(idx))) {
                    if (test(currPage)) {
                        return currPage.id;
                    }
                }
            }
        },
        
        // next page id
        nextEntityRef: function(pageId, entityId) {
            return this.nextPrevEntityRef(pageId, entityId);
        },
        
        // previous page id
        prevEntityRef: function(pageId, entityId) {
            return this.nextPrevEntityRef(pageId, entityId, true);
        }
    });
    
});