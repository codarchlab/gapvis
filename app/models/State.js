/*
 * State model
 */
define(['gv'], function(gv) {
    
    // model to hold current state
    gv.State = gv.State.extend({
    
        initialize: function() {
            var state = this;
            // listen for state changes
            state.on('change:bookid', function() {
                state.clearBookState(true);
            });
        },
    
        defaults: {
            pageview: 'text',
            barsort: 'ref'
        },
		    
		getCtsUrn: function(){
			return	"urn:cts:greekLit:tlg0003.tlg001.perseus-grc1:"+this.get('bookid')
			+"."+this.get('pageid')
			+((this.get('sectionid')!=null&&this.get('sectionid').length>0)?("."+this.get('sectionid')):"")
		},
        
		getCurrentEvents: function(){
		$.ajax({			
                url: "http://crazyhorse.archaeologie.uni-koeln.de/ThucDb/e5Event/ctsUrn/"+this.getCtsUrn(),
                dataType: 'jsonp',
				
                success: function(data) {
                   return(data);
                       
                }
            }); 
		},
        // clear all data relating to the current book
        clearBookState: function(silent) {
            var s = this,
                opts = silent ? {silent:true} : {};
            _(_.keys(s.attributes))
                .without('view','bookid','pageview','barsort')
                .forEach(function(k) {
                    s.unset(k, opts)
                });
        }
    });
    
    // reset to use new class
    gv.resetState();
    
});