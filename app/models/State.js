/*
 * State model
 */
define(['gv'], function(gv) {
    
    // model to hold current state
    gv.State = gv.State.extend({
		
    
        initialize: function() {
            var state = this;
			this.start_array= new Array();
			this.end_array= new Array();
            // listen for state changes
            state.on('change:bookid', function() {
                state.clearBookState(true);
            });
        },
    
        defaults: {
            pageview: 'grc',
            barsort: 'ref',
			readingview: 'timemap'
        },
		    
		getCtsUrn: function(){
			return	"urn:cts:greekLit:tlg0003.tlg001.perseus-grc1:"+this.get('bookid')
			+"."+this.get('pageid')
			+((this.get('sectionid')!=null&&this.get('sectionid').length>0)?("."+this.get('sectionid')):"")
		},
		setCtsUrn: function(urnString, changePage){
			if (urnString && urnString.length){
				var urn = new CanonicalReference(urnString);
				
				var passage = urn.getPassage();
				if (passage){
						if (passage.indexOf('-')!=-1){
							var start = passage.split('-')[0];
							var end = passage.split('-')[1];
							var start_chunks = start.split(/[.#]/);
							var end_chunks = end.split(/[.#]/);
							this.start_array=start_chunks;
							this.end_array=end_chunks;
							//alert(start_chunks+"; "+end_chunks);
						
						}
						else {
							var start_chunks = passage.split(/[.#]/);
							this.start_array=start_chunks;
							this.end_array = new Array();
							//alert(start_chunks+"; "+end_chunks);
							
						
						}	
						if	(this.start_array)	{
							/*if	(this.start_array[2]){	
								this.set( 'sectionid', this.start_array[2] );
							}*/
							if (changePage){
								this.set({ pageid: this.start_array[1] });	
							}
							this.set({view: 'reading-view'});
							this.set({ 'readingview': 'eventlist' });
					}
					this.set({'hoverurn': urnString});
					console.log(urnString);
				}
			}			
			
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