/*
 * SecondaryLiterature View
 */
define(['gv', 'views/BookView'], 
    function(gv, BookView) {
    
    var state = gv.state;
    
    // View: SecondaryLiteratureView
    return BookView.extend({
        className: 'secondaryliterature-view',
        template: '#secondary-literature-template',
        
        initialize: function() {
            var view = this;
			 this.documentTemplate = _.template($('#document-template').html());
			 this.citationTemplate = _.template($('#citation-template').html());
            // listen for state changes
            view.bindState('change:pageid',    view.render, view);
			view.bindState('change:sectionid',    view.render, view);
        },
        
        clear: function() {
            var view = this;
            BookView.prototype.clear.call(view);
        },
        
        // render and update functions
        render: function() {
	//	alert("hallo");
                 var view = this,
                book = view.model;	
				view.$el.empty();
				// add loading spinner
				view.$el.addClass('loading');
					// the way to get this variable from Gapvis interface is gv.state.getCtsUrn()
				var passageInFocus = gv.state.getCtsUrn().replace(".perseus-grc1","");
				//var passageInFocus = "urn:cts:greekLit:tlg0003.tlg001:1";

				/*
				
				All the data for the SecondaryLiterature view is located in the "./json/". You need two files, index.json and docs.json

				*/
				$.getJSON('./json/index.json', function(data) {
						
						/*
			
						First off we extract from the index only those JSTOR articles that contain one or more
						citations to the passage which is in focus in the UI (var passageInFocus). Only those articles will
						be displayed in the SecLit view.

						*/
						var docs = [];
						 $.each(data, function(key, val) {
							if(key.indexOf(passageInFocus)>=0){
								docs.push(val[0]);
							}
						});
						// docs contains the id of documents containing citations to the passageInFocus
						docs = _.uniq(docs);
						//console.log(docs);

						$.getJSON('./json/docs.json', function(data) {
							view.$el.empty();
							view.$el.removeClass('loading');
							view.renderTemplate();
							/*

							Then we get all the document and citations contained therein from docs.json.

							*/
							
							if (docs.length==0){
								view.$('.article').append('Nothing found for this section!');
							}
							$.each(docs,function(key,value){
								/*

								But we display only the articles that we have previously selected!

								*/
								var doc = data[value];								
								console.log(doc);

								// first we isolate those citations that refer to the text passage that is 
								// displayed in the ReadingView
								var inFocusCitations=[];
								for(x in doc.citations){
									var ctsurn = doc.citations[x].ctsurn;
									//console.log(ctsurn);
									if(ctsurn.indexOf(passageInFocus)>=0){
										inFocusCitations.push(doc.citations[x]);
									}
								}
								console.log(inFocusCitations);

								// the templates use the underscore library as in GapVis
							//	var cit_tmpl = _.template($("#citation-template").html());
							//	var doc_tmpl = _.template($("#document-template").html());

								var cits = [];
								for(cit in inFocusCitations){
									//cits.push(cit_tmpl(inFocusCitations[cit]))
									
									view.$('.citations-in-focus').append(view.citationTemplate(inFocusCitations[cit])+"; ");
								}

								var other_cits = [];
								for(n in doc.citations){
									var ctsurn = doc.citations[n].ctsurn;
									//console.log(ctsurn);
									if(ctsurn.indexOf(passageInFocus)<0){
										other_cits.push(doc.citations[n]);
									}
								}

								/*
								
								The grouping of citations for the "Also cited:" section
								is done by exploiting the semantics of CTS URNs. 

								Citations are grouped by author (TextGroup) and work (Work) they refer to. 


								*/
								var groups = _.groupBy(other_cits,function(cit){
									var urn = new CanonicalReference(cit.ctsurn)
									return urn.getTextGroup()+"."+urn.getWork();
								});

								var cits_by_author=[];
								view.$('.other-citations').children('ul').append('<p>Also cited:</p>');
								for (group in groups){
									for(cit in groups[group]){										
										view.$('.other-citations').children('ul').append('<li>'+view.citationTemplate(groups[group][cit])+'</li>');
									}
								}
								view.$('.article').append(view.documentTemplate(doc));
								
							});
						});
						// for doc in docs
					});
				
        }
    });
    
});