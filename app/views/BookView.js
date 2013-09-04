/*
 * Book View
 */
define(['gv'], function(gv) {

    // View: BookView (parent class for book views)
    return gv.View.extend({
        // utility - render an underscore template to this el's html
        renderTemplate: function(context) {
            var view = this,
                template = _.template(view.template);
            context = context || view.model.toJSON();
            $(view.el).html(template(context));
        },
        highlight: function(e){
		var view = this;		
			if (e){		
				var Ergebnis = $(e.target).attr('class').search(/ord\d+/);
				 var regX = /.*(urn:cts:[^\s]+).*/;
				regX.exec($(e.target).attr('class'));
				if (RegExp.$1){				
					var className = RegExp.$1;
					$('.highlight').removeClass('highlight');
					$("[class*='"+className+"']:not(.highlight-p)").addClass('highlight');
					var $container = $('#tree-container');
					var svg =  d3.select($container[0]);
					svg.selectAll("ellipse:not(.highlight-p)").attr("rx", 3.5).attr("ry", 3.5).attr("stroke","#000000").attr("stroke-width","1");
					svg.selectAll("[class*='"+className+"']:not(.highlight-p)").attr("rx", 7).attr("ry", 7).attr("stroke","#ffff00").attr("stroke-width","4");					
				}			
			}
		},
		highlightPermanent: function(e){
		var view = this;		
			if (e){		
				var Ergebnis = $(e.target).attr('class').search(/ord\d+/);
				 var regX = /.*(urn:cts:[^\s]+).*/;
				regX.exec($(e.target).attr('class'));
				if (RegExp.$1){				
					var className = RegExp.$1;
					$('.highlight-p').removeClass('highlight-p');
					$("[class*='"+className+"']").addClass('highlight-p');
					var $container = $('#tree-container');
					var svg =  d3.select($container[0]);
					svg.selectAll("ellipse").attr("rx", 3.5).attr("ry", 3.5).attr("stroke","#000000").attr("stroke-width","1").classed('highlight-p', false);
					svg.selectAll("[class*='"+className+"']").attr("rx", 7).attr("ry", 7).attr("stroke","#ff00ff").attr("stroke-width","4").classed('highlight-p', true);					
				}			
			}
		},
        ready: function(callback) {
            var view = this,
                state = gv.state,
                bookId = state.get('bookid'),
                book = view.model;
            if (!book || book.id != bookId || !book.isFullyLoaded()) {
                book = view.model = gv.books.getOrCreate(bookId);
                book.ready(function() {
                    // set the page id if not set
                    if (!state.get('pageid')) {
                        state.set({ pageid: book.firstId() });
                    }
                    callback();
                });
            } else {
                callback();
            }
        }
        
    });
    
});