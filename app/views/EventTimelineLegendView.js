/*
 * Event Timeline Legend View
 */
define(['gv'], function(gv) {
    
    // View: Event Timeline Legend
    return gv.View.extend({
        className: 'event-timeline-legend-view',
        template: '#event-timeline-legend-template',
        
        render: function() {
            var view = this;
            // render template
            view.$el.html(view.template);
           
            return view;
        }
        
    });
    
});