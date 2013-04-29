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
					 root = document.getElementById('svgCanvas');
					setupHandlers(root);
                       
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
			 treeView = state.get('treeview');
			//Fill sentence container
			view.addSentence(data.sentence);
			//Build trees
			view.createSVG("tree-container", data);

		},
		createSVG: function (containerName, data, customOptions, hidden){
			var view = this,
			options = $.extend({
				nodeRadius: 3, fontSize: 8
			}, customOptions);
			
			 var $container = $('<div id ="'+containerName+'"></div>').appendTo(view.$el).toggle(!hidden);
			 $(data.svg).appendTo($container[0]);				

		}   		 
        
    });  
    
    return TreeView;
    
});