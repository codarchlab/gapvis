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
                     view.buildTree("#tree-container", data);
					 
                       
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
		buildTree: function (containerName, treeData, customOptions)
		{
			 var view = this;
			// build the options object
			var options = $.extend({
				nodeRadius: 3, fontSize: 8
			}, customOptions);

			
			
			// Calculate total nodes, max label length
			var totalNodes = 0;
			var maxLabelLength = 0;
			var maxWidth = 0;
			view.visit(treeData.treeNodes, function(d)
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

			var nodes = tree.nodes(treeData.treeNodes);
			var links = tree.links(nodes);		
			
			 var $container = $('<div id ="tree-container"></div>').appendTo(view.$el);
            // Write sentence in sentence container
			var words = treeData.sentence.split(" ");
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
               
			var layoutRoot = d3.select( $container[0])
				.append("svg:svg").attr("width", size.width).attr("height", size.height).attr('id','svgCanvas').attr("onmouseup" , "handleMouseUp(evt)").attr("onmousedown" , "handleMouseDown(evt)").attr(	"onmousemove" , "handleMouseMove(evt)")
				.append("svg:g")
				.attr("class", "container")
				.attr('id', 'viewport')
				.attr("transform", "translate(0,10)");


			// Edges between nodes as a <path class="link" />
			var link = d3.svg.diagonal()
				.projection(function(d)
				{
					//return [d.y, d.x];
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
					return d.afun;
				});			

		}   
  
        
    });
    
    // no d3 option
    /*if (window.nod3) {
        EntityFrequencyBarsView = EntityFrequencyBarsView.extend({
            render: $.noop,
            updateHighlight: $.noop
        });
    }*/
    
    return TreeView;
    
});