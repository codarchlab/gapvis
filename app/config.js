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
				'book/:bookid/read/:pageid/',
                'book/:bookid/read/:pageid/:entityid',
				'book/:bookid/read/:pageid/readingview/:readingviewid',
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
                        '.top-slot': 'views/ReadingView',
                        '.bottom-slot': 'views/ReadingNavigationView'
                    }
                }
            }
        },
		 'tree-view': {
            layout:  '#layout-book-2panel',
            className: 'tree-view',
            router: [
                
                'book/:bookid/read/:pageid/tree',
                'book/:bookid/read/:pageid/tree/:treeid'
            ],
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/SentenceView',
                        '.bottom-slot': 'views/PageControlView'
                    }					
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    slots: {
                        '.top-slot': 'views/TreeView',
                        '.bottom-slot': 'views/TreeControlView'
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
							'views/BookEntityArachnePicturesView',
                            'views/BookReferencesView',
                            'views/RelatedEntitiesView',
							'views/EntityEventView'
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
        },
		'event-view': {
            layout:  '#layout-book-2panel',
            className: 'event-view',
            router: 'book/:bookid/event/:eventid',
            refreshOn: 'change:eventid',
            slots: {
                '.navigation-view': 'views/NavigationView',
                '.book-title-view': 'views/BookTitleView',
                '.left-panel': {
                    className: 'event-summary panel fill padded-scroll',
                    slots: {
                        'this': [
                            'views/EventSummaryView'
							//'views/BookEntityArachnePicturesView',
                            //'views/BookReferencesView',
                            //'views/RelatedEntitiesView'
                        ]
                    }
                },
                '.right-panel': {
                    layout: '#layout-full-top',
                    className: 'event-view-right',
                    slots: {
                        '.top-slot': 'views/EventTimelineView',
                        '.bottom-slot': 'views/EventTimelineLegendView'
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