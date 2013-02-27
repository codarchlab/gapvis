/*
 * Application configuration
 */
define({
    appElement: '#app-view',
    globalViews: ['views/MessageView'],
    views: {
        'index': {
            layout: '#layout-2col',
            className: 'index-view',
            router: ['', 'index'],
            slots: {
                '.left-column': {
                    layout: 'views/BookListView'
                },
                '.right-column': '#index-overview-template'
            }
        },
        'book-summary': {
            layout: '#layout-book-3panel',
            className: 'summary-view',
            router: 'book/:bookid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.text-slot': 'views/BookSummaryTextView',
                '.left-panel': 'views/BookSummaryMapView',
                '.right-panel': 'views/EntityFrequencyBarsView'
            }
        },
        'reading-view': {
            layout:  '#layout-book-2panel',
            className: 'reading-view',
            router: [
                'book/:bookid/read', 
                'book/:bookid/read/:pageid',
                'book/:bookid/read/:pageid/:entityid'
            ],
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/PagesView',
                        '.bottom-slot': 'views/PageControlView'
                    }
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/TimeMapView',
                        '.bottom-slot': 'views/FrequencyLegendView'
                    }
                }
            }
        },
        'entity-view': {
            layout:  '#layout-book-2panel',
            className: 'entity-view',
            router: 'book/:bookid/entity/:entityid',
            refreshOn: 'change:entityid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    className: 'entity-summary panel fill padded-scroll',
                    slots: {
                        'this': [
                            'views/EntitySummaryView',
                            'views/BookReferencesView',
                            'views/RelatedEntitiesView'
                        ]
                    }
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    className: 'entity-view-right',
                    slots: {
                        '.top-slot': 'views/BookEntityMapView',
                        '.bottom-slot': 'views/BookEntityFlickrView'
                    }
                }
            }
        }
    },
    // number of related entities to show
    relatedCount: 8,
    // number of book references to show
    bookRefCount: 5,
    // whether to fake PUT/DELETE
    emulateHTTP: true
});