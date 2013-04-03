/*
 * Sentence View
 */
define(['gv', 'views/BookView', 'util/slide'], function(gv, BookView, slide) {
    var state = gv.state;
    
    // View: SentenceView (page content)
    return BookView.extend({
        className: 'page-view panel full-height',
        template: '#sentence-template',
        
        initialize: function() {
            var view = this;
            view.render();
        },
        
        render: function() {
            var view = this;
			template = _.template(view.template);
            $(view.el).html(template);
			view.delegateEvents();
			 
            return view;
        },      

        events: {            
			'mouseover .sentence-word':     'highlight'
        },
        open: function(width, fromRight) {
            this.$el.width(width - 24); // deal with padding
            slide(this.$el, true, fromRight ? 'right' : 'left');
        },
        
        close: function(fromRight) {
            this.$el.hide();
        }       
        
    });
    
});