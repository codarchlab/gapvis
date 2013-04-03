/*
 * Page model
 */
define(['gv', 'models/Model', 'models/Collection'], function(gv, Model, Collection) {
    var settings = gv.settings,
        Page;
       
    // Model: Page
    Page = Model.extend({
        type: 'page',
        
        defaults: {
            entities: [],
			trees: []
        }, 
        
        initialize: function() {
            this.set({
                title:'Page ' + this.id
            });
        },
        
        isFullyLoaded: function() {
            return !!this.get('text');
        },
		containsTree: function(idx){
			var trees = this.get('trees');  
			var returnvalue = false;
                    if (trees.length) {
						 trees.forEach(function(tree) {						
                            if ((tree/1)==(idx/1)){							
								returnvalue = tree;
								}
                        });
					}					
                //tree = this.get('trees').at(idx);
            return returnvalue;
		},
		 // next/prev ids
        nextPrevId: function(treeId, prev) {
           
				idx = (treeId)/1 + (prev ? -1 : 1) ;
				
				return this.containsTree(idx);
        },
        
        // next tree id
        nextId: function(treeId) {
            return this.nextPrevId(treeId);
        },
        
        // previous tree id
        prevId: function(treeId) {
            return this.nextPrevId(treeId, true);
        }
    });
    
    // Collection: PageList
    return Collection.extend({
        model: Page,
        url: function() {
            return settings.API_ROOT +  '/books/' + this.book.id + '/page';
        }
    });
    
});