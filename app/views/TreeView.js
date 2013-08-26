/*
 * Tree View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        TreeView;
    
    // View: BookTitleView (title and metadata)
    TreeView =  BookView.extend({
        className: 'tree-view-right panel loading',
        template: '#tree-template',
        
        settings: {            
            color: 'steelblue',
            hicolor: 'orange'
        },
        
        initialize: function(opts) {
            var view = this;
            _.extend(view.settings, view.options);
			view.render = view.bindReady('render');
			this.treeControlTemplate = _.template($('#tree-control-box-template').html());
            // listen for state changes
            view.bindState('change:treeid', view.render, view);
			 view.bindState('change:pageid', view.updateTree, view);
			
        },
        updateTree: function (){
			var view = this,		
			 book = view.model,
              pageId = state.get('pageid')?state.get('pageid'):book.firstId(),
			  page=book.pages.get(pageId),
			trees = page.get('trees');
			if (state.get('treeid')){
				if (!page.containsTree(state.get('treeid'))){
					state.set({ treeid: trees[0] });
				}
			}
			else {
				state.set({ treeid: trees[0] });
			}
		},
        render: function() {
            var view = this,
                book = view.model,
                pageId = state.get('pageid')?state.get('pageid'):book.firstId(),
				page = book.pages.get(pageId),
				sentenceId = state.get('treeid') ? state.get('treeid') : page.get('trees')[0];
				if (!page.containsTree(sentenceId)){
					state.set({ treeid: page.get('trees')[0] });		
					return;					
				}
				view.$el.empty().addClass('loading');
                
                $("#sentence-container").empty();
             $.ajax({			
                url: API_ROOT+"/tree/"+sentenceId+".json",
                dataType: 'jsonp',
				
                success: function(data) {					
                    view.$el.empty().removeClass('loading');
                     view.buildTree("tree-container", data);                      
                }
            }); 
			            
            return this;
        },
		
	/*	events: {
            'mouseover .node-dot':       'highlight',
            'mouseover text':     		'highlight'
        },	*/	
		visit: function (parent, visitFn, childrenFn)
		{
			var view = this;
			if (!parent) return;

			visitFn(parent);

			var children = childrenFn(parent);
			if (children) {
				var count = children.length;
				for (var i = 0; i < count; i++) {
					view.visit(children[i], visitFn, childrenFn);
				}
			}
		},
		addSentence: function (sentence){
			// Write sentence in sentence container
			var words = sentence.split(" ");
			for (var i= 0; i<words.length; i++){
				newspan = document.createElement('span');
				$(newspan).append(document.createTextNode(words[i]));
				$(newspan).attr('id','sentence-word'+(i+1));
				if (i != 0 && words[i]!= ',' && words[i] != '.')
					$('#sentence-container').append(document.createTextNode(" "));
				$('#sentence-container').append(newspan);				
				$(newspan).addClass("word"+(i+1));
				$(newspan).addClass("sentence-word");
			}
		},
		buildTree: function (containerName, data, customOptions)
		{
			 var view = this,
			 treeView = state.get('treeview'),
			                 book = view.model,
                pageId = state.get('pageid') || book.firstId(),
				page =  book.pages.get(pageId);	
            
			//Fill sentence container
			view.addSentence(data.sentence);
			//Build trees
			view.createSVG("tree-container", data);
			 view.$el.append(view.treeControlTemplate(page.toJSON()));
			 view.renderNextPrev();
			 view.renderNextPrevTree();

		},
		
		createSVG: function (containerName, data, customOptions, hidden){
			var view = this,
			options = $.extend({
				nodeRadius: 3, fontSize: 8
			}, customOptions);
			
			 var $container = $('<div id ="'+containerName+'"></div>').appendTo(view.$el).toggle(!hidden);
			$(data.svg).appendTo($container[0]);
			
			if (state.get('treebankid')!=null&&state.get('treebankid').length>0){		
				var svg =  d3.select($container[0]);
				svg.select("."+state.get('treebankid')).attr("fill", "#ffff00").attr("rx", 7).attr("ry", 7).attr("stroke", "#ffff00");
				$("."+state.get('treebankid')).trigger("mousedown");
			}
				

		},
		clickZoomPlus: function (evt) {
			this.clickZoom(evt,true);
		
		},
		clickZoomMinus: function (evt) {
			this.clickZoom(evt,false);
		
		},
		clickZoom: function (evt, magnify){
			var delta;
			if (magnify)
				delta = 2;
			else
				delta = -2;
			
			if (evt.originalEvent)
				evt = evt.originalEvent;
			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;
			var zoomScale = 0.2; 
			var z = Math.pow(1 + zoomScale, delta);

			var g = getRoot(svgDoc);		
			
			// hardcoded: circa middle of svg window
			var px=380;
			var py=280;			

			// Compute new scale matrix in current mouse position
			var root = $('.svgCanvas')[0];
			var k = root.createSVGMatrix().translate(px, py).scale(z).translate(-px, -py);

				setCTM(g, g.getCTM().multiply(k));
			if(typeof(stateTf) == "undefined")
				stateTf = g.getCTM().inverse();

			stateTf = stateTf.multiply(k.inverse());
		},
		handleMouseWheel: function (evt) {
		
			evt = evt.originalEvent;
			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;
			var zoomScale = 0.2; 
			var delta;
			
			if(evt.wheelDelta)
				delta = evt.wheelDelta / 360; // Chrome/Safari
			else if(evt.detail)
				delta = evt.detail / -9; // Mozilla	
			else
				delta = 2;
			
			var z = Math.pow(1 + zoomScale, delta);

			var g = getRoot(svgDoc);
			
			var p = getEventPoint(evt);

			p = p.matrixTransform(g.getCTM().inverse());		

			// Compute new scale matrix in current mouse position
			var root = $('.svgCanvas')[0];
			var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

				setCTM(g, g.getCTM().multiply(k));
			if(typeof(stateTf) == "undefined")
				stateTf = g.getCTM().inverse();

			stateTf = stateTf.multiply(k.inverse());
		},
		renderNextPrevTree: function() {
            // update next/prev
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
				page =  book.pages.get(pageId),
				treeId = state.get('treeid') || page.get('trees')[0];
                prev = view.prevTree = page.prevId(treeId),
                next = view.nextTree = page.nextId(treeId);
            // render
            view.$('.prev-tree').toggleClass('on', !!prev);
            view.$('.next-tree').toggleClass('on', !!next);
            view.$('.tree-id').val(treeId);
        }, 
		renderNextPrev: function() {
            // update next/prev
            var view = this,
                book = view.model,
                pageId = state.get('pageid') || book.firstId(),
                prev = view.prev = book.prevId(pageId),
                next = view.next = book.nextId(pageId);
				state.set('sectionid', null);
            // render
            view.$('.prev').toggleClass('on', !!prev);
            view.$('.next').toggleClass('on', !!next);
            view.$('.page-id').val(pageId);
        },		
		  uiNextTree: function() {
            state.set({ treeid: this.nextTree });
        },
        
        uiPrevTree: function() {
            state.set({ treeid: this.prevTree });
        },
		uiNext: function() {
            state.set({ pageid: this.next });
        },
        
        uiPrev: function() {
            state.set({ pageid: this.prev });
        },
		  uiJumpToTree: function(e) {
			 var view = this,
                book = view.model,
				treeId = e.target.value;
			pageId = state.get('pageid') || book.firstId();
			page =  book.pages.get(pageId);
            if (treeId && page.containsTree(treeId)){
				
                // valid pageId
                state.set({ scrolljump: true });
                state.set('treeid', treeId);
            } else {
                // not valid
                this.renderNextPrev();
                state.set({ 
                    message: {
                        text: "Sorry, there isn't a sentence '" + treeId + "' in this chapter.",
                        type: "error"
                    }
                });
            }
        },
		 uiJumpToPage: function(e) {
            var pageId = $(e.target).val();
            if (pageId && this.model.pages.get(pageId)) {
                // valid pageId
                state.set({ scrolljump: true });
                state.set('pageid', pageId);
            } else {
                // not valid
                this.renderNextPrev();
                state.set({ 
                    message: {
                        text: "Sorry, there isn't a page '" + pageId + "' in this book.",
                        type: "error"
                    }
                });
            }
        },
		
		events: {
            'mousewheel .svgCanvas':       'handleMouseWheel',
            'DOMMouseScroll .svgCanvas':     'handleMouseWheel',			
			'mousedown .icon-zoom-in': 'clickZoomPlus',
			'mousedown .icon-zoom-out': 'clickZoomMinus',
			 'click .next-tree.on':       'uiNextTree',
            'click .prev-tree.on':       'uiPrevTree',
            'change .tree-id':      'uiJumpToTree',
			  'click .next.on':       'uiNext',
            'click .prev.on':       'uiPrev',
            'change .page-id':      'uiJumpToPage'
        }	
        
    });  
    
    return TreeView;
    
});