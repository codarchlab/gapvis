/*
 * Page View
 */
define(['gv', 'views/BookView', 'util/slide'], function(gv, BookView, slide) {
    var state = gv.state;
    
    // View: PageView (page content)
    return BookView.extend({
        className: 'single-page panel',
        template: '#page-template',
        
        initialize: function() {
            var view = this,
                page = view.model;
            // listen for state changes
            view.bindState('change:pageview',   view.renderPageView, view);
            view.bindState('change:entityid',    view.renderEntityHighlight, view);
			view.bindState('change:hoverurn', view.render, view);
            // set backreference
            page.view = view;
            // load page
            page.ready(function() {
                view.render();
            });
        },
        
        render: function() {
            var view = this;			
            view.renderTemplate();
            view.renderPageView();
            view.renderEntityHighlight();
			view.renderEventHighlight();
			view.delegateEvents();
            return view;
        },
        renderPageView: function() {
            var view = this,
                pageView = state.get('pageview');
            // render
			if (pageView== null || pageView==""){
				pageView = 'grc';
				state.set({ 'pageview': pageView }); 
			}
            view.$('.text').toggle(pageView == 'grc');
            view.$('.engText').toggle(pageView == 'eng');
        },
        
        renderEntityHighlight: function() {
            var entityId = state.get('entityid');
            // render
            this.$('span.entity').each(function() {
                $(this).toggleClass('hi', $(this).attr('data-entity-id') == entityId);
            });
			
        },
        renderEventHighlight: function(){
			if (state.get('sectionid')!=null){
				this.$("span[section-id='"+state.get('sectionid')+"']").addClass('highlighted');
			}
			var text = this.$('.text').html();
			// To do: do this in the backend already
			text=text.replace(/<br><h4/g,"</div><br><h4").replace(/Section ([\d]+)<\/span><\/h4>/g,"Section $1 </span></h4><div class='$1'>");
			text+="</div>";
			this.$('.text').html(text);
			// Highlighting the current CTS-URN: very ugly.
			
			// 1. There is only one part
			if (state.start_array.length && !state.end_array.length){
			// Index 0: Book, Index 1: Chapter, Index 2: Section, Index 3: Word
				
				// Chapter level
				if (!state.start_array[2]){
					if (state.get('pageid') == state.start_array[1])
						this.$("div:not(.text,.engText),span[section-id]").addClass("highlight-eventtext");
				}
				// Passage level
				else if (!state.start_array[3]){
					this.$("span[section-id='"+state.start_array[2]+"'],."+state.start_array[2])
					.addClass("highlight-eventtext");					
				}				
				// Word level
				else if (state.start_array[3]){
					text = this.$('div.'+state.start_array[2]).html();
					var regex = /\[(\d+)\]/;
					regex.exec(state.start_array[3]);
					var indexWord1 = RegExp.$1;
					var word1 = state.start_array[3].replace(regex,"");
					word1 = this.replaceDiacritics(word1);					
					var indexStr1 = this.xIndexOf(word1, text, indexWord1/1);
					regex.exec(state.end_array[3]);
					var newText = text.substring(0,(indexStr1/1))+"<span class='highlight-eventtext'>"+word1+"</span>"+text.substr((indexStr1/1)+word1.length-1, text.length-1);
					this.$('div.'+state.start_array[2]).html(newText);					
				}
			}
			
			// 2. There are two parts, URN includes multiple chapters, passages or words (depending on level of URN)
			else if (state.start_array.length && state.end_array.length){
			
				// Chapter level
				if (!state.start_array[2] && !state.end_array[2]){
					 if (state.get('pageid')>= (state.start_array[1])/1 && state.get('pageid')<= (state.end_array[1])/1){
						this.$("div:not(.text,.engText),span[section-id]").addClass("highlight-eventtext");						
						}
				}
				// Passage level
				else if (!state.start_array[3]&& !state.end_array[3]){
					// start and end are in the same chapter
					if (state.start_array[1]==state.end_array[1]){
						for (i=state.start_array[2]; i<=state.end_array[2]; i++){
							this.$("span[section-id='"+i+"'],."+i).addClass("highlight-eventtext");
						}
					}
					else {
						// start and end are in different chapters -> three possibilities:
						// URN starts before and ends after current chapter
						if ((state.start_array[1]/1)<(state.get('pageid')/1)&& (state.get('pageid')/1)<(state.end_array[1]/1)){
							this.$("div:not(.text,.engText),span[section-id]").addClass("highlight-eventtext");
						}
						// URN starts in current chapter
						else if ((state.start_array[1]/1) == state.get('pageid')) {
							for (i=state.start_array[2]; i<=this.$('span[section-id]').length; i++){
								this.$("span[section-id='"+i+"'],."+i).addClass("highlight-eventtext");
							}
						}
						// URN ends in current chapter
						else if ((state.end_array[1]/1) == state.get('pageid')){
							for (i=1; i<=state.end_array[2]; i++){
								this.$("span[section-id='"+i+"'],."+i).addClass("highlight-eventtext");
							}
						}
						
					}	
				}
				// Word level
				else if (state.start_array[3]&&state.end_array[3]){
					text = this.$('div.'+state.start_array[2]).html();
					if (text){
						text= this.replaceDiacritics(text);	
						var regex = /\[(\d+)\]/;
						regex.exec(state.start_array[3]);
						var indexWord1 = RegExp.$1;
						var word1 = state.start_array[3].replace(regex,"");
						word1 = this.replaceDiacritics(word1);					
						var indexStr1 = this.xIndexOf(word1, text, indexWord1/1);
						regex.exec(state.end_array[3]);
						var indexWord2 = RegExp.$1;
						var word2 = state.end_array[3].replace(regex,"");
						word2 = this.replaceDiacritics(word2);						
						var indexStr2 = this.xIndexOf(word2, text, indexWord2/1);
						if ((indexStr1/1)<(indexStr2/1)){
							var partToHighlight = "";
							var newText = "";
							if (text.charAt((indexStr1/1)-1)=='>'){
								// complicated ugly stuff
							
									var textTilWord = text.substring(0, (indexStr1/1));
									var spanStarts = textTilWord.lastIndexOf("<");
									partToHighlight = text.substring(spanStarts, (indexStr2/1)+word2.length);
									newText = text.substring(0,(spanStarts))+"<span class='highlight-eventtext'>"+partToHighlight+"</span>"+text.substring((indexStr2/1)+word2.length, text.length);								

							}
							else {
								partToHighlight = text.substring(indexStr1, (indexStr2/1)+word2.length);
								newText = text.substring(0,(indexStr1/1))+"<span class='highlight-eventtext'>"+partToHighlight+"</span>"+text.substring((indexStr2/1)+word2.length, text.length);
							}					
							this.$('div.'+state.start_array[2]).html(newText);
						}
						
					}
				}
			}	
		},
		replaceDiacritics : function(replaceString){
			var find = ["ά", "έ", "ί", "ή", "ό", "ώ", "ύ"];
			var replace	= ["ά", "έ", "ί", "ή", "ό", "ώ", "ύ"];		
  			var regex; 

 			 for (var i = 0; i < find.length; i++) {
   				 regex = new RegExp(find[i], "g");
   				 replaceString = replaceString.replace(regex, replace[i]);
 			 }
 		 return replaceString;
		},
		 xIndexOf: function(Val, Str, x)  {  
			   if (x <= (Str.split(Val).length - 1)) {  
				 Ot = Str.indexOf(Val);  
				 if (x > 1) { for (var i = 1; i < x; i++) { var Ot = Str.indexOf(Val, Ot + 1) } }  
				 return Ot;  
			   } else { return -1 }  
			 },		
		
        open: function(width, fromRight) {
            this.$el.width(width - 24); // deal with padding
            slide(this.$el, true, fromRight ? 'right' : 'left');
        },
        
        close: function(fromRight) {
            this.$el.hide();
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .entity':     'uiEntityClick',
			'click .connected-tree': 'uiTreeClick',
			'click .section-heading': 'uiSectionClick',
			'click .chapter-heading': 'uiChapterClick'
        },
        uiSectionClick: function(e) {
			var section = $(e.target).attr('section-id');
			if (section) {
				state.set('sectionid', section);
				$(".highlighted").removeClass('highlighted');
				$(e.target).addClass('highlighted');
			}
		},
		 uiChapterClick: function(e) {			
				state.set('sectionid', null);
				$(".highlighted").removeClass('highlighted');
				$(e.target).addClass('highlighted');
			
		},
        uiEntityClick: function(e) {
            var entityId = $(e.target).attr('data-entity-id');
            if (entityId) {
                state.set('entityid', entityId);
            }			
			state.set({ 'readingview': 'timemap' });
        },
		uiTreeClick: function(e) {
            var treeId = $(e.target).attr('tree-id');			
            if (treeId) {
                state.set('treeid', treeId);
				state.set({ 'view': 'tree-view' });
            }
        }
        
    });
    
});