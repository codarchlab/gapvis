/*
 * Tree View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        TreeView;
    
    // View: BookTitleView (title and metadata)
    TreeView =  BookView.extend({
        className: 'tree-view panel fill loading',
        template: '#tree-template',
        
        settings: {            
            color: 'steelblue',
            hicolor: 'orange'
        },
        
        initialize: function(opts) {
            var view = this;
            _.extend(view.settings, view.options);
			view.render = view.bindReady('render');
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
			root = document.getElementById('svgCanvas');
			setupHandlers(root);
             
            return this;
        },
		
		events: {
            'mouseover .node-dot':       'highlight',
            'mouseover text':     		'highlight'
        },		
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
		buildTree: function (containerName, treeData, customOptions)
		{
			 var view = this,
			 treeView = state.get('treeview');
			//Fill sentence container
			view.addSentence(treeData.sentence);
			//Build a_tree
			view.createSVG("tree_a-container", treeData.treeNodes_a, customOptions, !(treeView=='syntactical'));
			//Build t_tree
			view.createSVG("tree_t-container", treeData.treeNodes_t, customOptions, !(treeView=='tectogrammatical'));

		},
		createSVG: function (containerName, treeData, customOptions, hidden){
			var view = this,
			options = $.extend({
				nodeRadius: 3, fontSize: 8
			}, customOptions);
			
			// Calculate total nodes, max label length
			var totalNodes = 0;
			var maxLabelLength = 0;
			var maxWidth = 0;
			view.visit(treeData, function(d)
			{
				totalNodes++;
				maxLabelLength = Math.max(d.name.length, maxLabelLength);
				maxWidth =  Math.max(d.contents.length, maxWidth);
			}, function(d)
			{
			
				return d.contents && d.contents.length > 0 ? d.contents : null;
			});

			// size of the diagram
			
			var size = { width:maxLabelLength*options.fontSize*maxWidth*2.5, height: 475};

			var tree = d3.layout.tree()
				.sort(null)
				.size([size.width-75,size.height-50])				
				.children(function(d)
				{
					return (!d.contents || d.contents.length === 0) ? null : d.contents;
				});

			var nodes = tree.nodes(treeData);
			var links = tree.links(nodes);		
			
			 var $container = $('<div id ="'+containerName+'"></div>').appendTo(view.$el).toggle(!hidden),
			 canvasClass,
			 viewportClass;
			
			if (hidden){
				canvasClass = "svgCanvas";
				viewportClass = "container viewport";
			}
			else {
				canvasClass = "svgCanvas on";
				viewportClass = "container viewport on";
			}
               
			var layoutRoot = d3.select( $container[0])
				.append("svg:svg").attr("width", size.width).attr("height", size.height).attr('class', canvasClass).attr("onmouseup" , "handleMouseUp(evt)").attr("onmousedown" , "handleMouseDown(evt)").attr(	"onmousemove" , "handleMouseMove(evt)")
				.append("svg:g")
				.attr('class', viewportClass)
				.attr("transform", "translate(0,10)");


			// Edges between nodes as a <path class="link" />
			var link = d3.svg.diagonal()
				.projection(function(d)
				{
					return [d.x, d.y];
				});

			layoutRoot.selectAll("path.link")
				.data(links)
				.enter()
				.append("svg:path")
				.attr("class", "link")
				.attr("d", link);


			/*
				Nodes as
				<g class="node">
					<circle class="node-dot" />
					<text />
				</g>
			 */
			var nodeGroup = layoutRoot.selectAll("g.node")
				.data(nodes)
				.enter()
				.append("svg:g")
				.attr("class", "node")
				.attr("transform", function(d)
				{
				   return "translate(" + d.x + "," + d.y + ")";
				});

			nodeGroup.append("svg:circle")
				.attr("class", "node-dot")
				.attr("id",function(d)
				{
					return "node"+d.order;
				})
				.attr("r", options.nodeRadius);
				
			// word/lemma
			nodeGroup.append("svg:text")
				.attr("text-anchor", function(d)
				{
					return d.children ? "end" : "start";
				})
				.attr("dx", function(d)
				{            
					if (d.name.length<50)
						return 0;
					else
						return d.name.length/2+100;
				})
				.attr("dy", function(d)
				{
					return 3;
				})
				.attr("font-size", options.fontSize)
				.attr("class",function(d)
				{
					return "word"+d.order;
				})
				.attr("id",function(d)
				{
					return "wordNode"+d.order;
				})
				.text(function(d)
				{
					return d.name;
				});
				
				//afun/functor
				 nodeGroup.append("svg:text")
				.attr("text-anchor", function(d)
				{
					return d.children ? "end" : "start";
				})
				.attr("dx", function(d)
				{            
					return 0;
				})
				.attr("dy", function(d)
				{				
					return 10;
				})
				.attr("font-size", options.fontSize)
				.attr("class", "afun")
				.text(function(d)
				{	 
					if (d.afun)
						return d.afun;
					else if (d.functor)
						return d.functor;
					else
						return "";
				});			
				
				//sempos
				 nodeGroup.append("svg:text")
				.attr("text-anchor", function(d)
				{
					return d.children ? "end" : "start";
				})
				.attr("dx", function(d)
				{            
					return 0;
				})
				.attr("dy", function(d)
				{				
					return 17;
				})
				.attr("font-size", options.fontSize)
				.attr("class", "afun")
				.text(function(d)
				{	 
					if (d.sempos)
						return d.sempos;
					else
						return "";
				});			

		   
		//number
				 nodeGroup.append("svg:text")
				.attr("text-anchor", function(d)
				{
					return d.children ? "end" : "start";
				})
				.attr("dx", function(d)
				{            
					return 0;
				})
				.attr("dy", function(d)
				{				
					return 24;
				})
				.attr("font-size", options.fontSize)
				.attr("class", "afun")
				.text(function(d)
				{	 
					if (d.number)
						return d.number;
					else
						return "";
				});	
				
			//gender
				 nodeGroup.append("svg:text")
				.attr("text-anchor", function(d)
				{
					return d.children ? "end" : "start";
				})
				.attr("dx", function(d)
				{            
					return 0;
				})
				.attr("dy", function(d)
				{				
					return 31;
				})
				.attr("font-size", options.fontSize)
				.attr("class", "afun")
				.text(function(d)
				{	 
					if (d.gender)
						return d.gender;
					else
						return "";
				});			
				

		}   				

		   
  
        
    });  
    
    return TreeView;
    
});