/*
 * Entity Frequency Bar Chart View
 */
define(['gv', 'views/BookView'], function(gv, BookView) {
    var state = gv.state,
        EntityFrequencyBarsView;
    
    // View: BookTitleView (title and metadata)
    EntityFrequencyBarsView =  BookView.extend({
        className: 'freq-bars-view panel padded-scroll fill loading',
        template: '#bars-header-template',
        
        settings: {
            //buckets: 30,
            color: 'steelblue',
            hicolor: 'orange'
        },
        
        initialize: function(opts) {
            var view = this;
            _.extend(view.settings, view.options);
            // listen for state changes
            view.bindState('change:barsort', function() {
                // XXX: is this the right entity for this logic?
                var entities = view.model.entities,
                    sort = state.get('barsort');
                entities.comparator = function(entity) {
                    if (sort == 'ref') 
                        return -entity.get('frequency') ;
					else if (sort == 'alpha')	
                        return entity.get('title');
					else
						return entity.get('type');						
                };
                entities.sort();
                view.render();
            });
        },
        
        render: function() {
            var view = this,
                singleEntity = !!view.options.entity,
                book = view.model,
                entities = singleEntity ? [view.options.entity] : book.entities.models,
                settings = view.settings,
                buckets = settings.buckets ? settings.buckets : book.pages.length,
                color = settings.color,
                hicolor = settings.hicolor,
                frequency = function(d) { return d.get('frequency') },
                max = d3.max(entities, frequency),
                bh = 15,
                w = 250,
                lw = singleEntity ? 0 : 200,
                spacing = 5,
                x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, w]),
                y = function(d, i) { return i * (bh + spacing) },
                bw = function(d) { return x(frequency(d)) };
                
            // remove loading spinner
            view.$el
                .empty()
                .removeClass('loading');
                
            // make div container (for padding)
            var $container = $('<div></div>').appendTo(view.el);
            
            // title if we're showing the whole book
            if (!singleEntity) {
                $container.append(view.template);
                view.renderControls();
            }
        
            // create svg container
            var svg = d3.select($container[0])
              .append('svg:svg')
                .attr('height', (bh + spacing) * entities.length + (singleEntity ? 0 : 10))
				.attr('width', '100%')
                // delegated handler: click
                .on('click', function() {
                    var target = d3.event.target,
                        data = target.__data__,
                        pdata = target.parentNode.__data__;
                    // bar click
                    if ($(target).is('rect')) {
                        var pageId = pages.at(~~((pages.length * data.idx)/buckets)).id;
                        state.set({
                            // scrolljump: true,
                            entityid: pdata.id,
                            pageid: pageId,
                            view: 'reading-view'
                        });
                    }
                    // label click
                    if ($(target).is('text.title')) {
                        state.set({
                            entityid: pdata.id,
                            view: 'entity-view'
                        });
                    }
                })
                // delegated handler: mouseover
                .on('mouseover', function() {
                    var $target = $(d3.event.target);
                    if ($target.attr('class')=='changecolor') {
                        d3.select(d3.event.target)
                            .style('fill', hicolor)
                    }
                })
                // delegated handler: mouseout
                .on('mouseout', function() {
                    var $target = $(d3.event.target);
                    if ($target.attr('class')=='changecolor' && !$target.is('.selected')) {
                        d3.select(d3.event.target)
                            .style('fill', color)
                    }
                });
            
            var pages = book.pages,
                sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, buckets)),
                sx = d3.scale.linear()
                    .domain([0, buckets])
                    .range([0, w]);
                    
            // create and cache spark data
            entities.forEach(function(entity) {
                if (!entity.get('sparkData')) {
                    // make the sparkline data
                    var sdata = d3.range(0, buckets)
                        .map(function(d,i) {
                            return {
                                count: 0,
                                idx: i
                            }
                        });
						
                    pages.each(function(p, pi) {
                        var pentities = p.get('entities'),
                            pidx = sidx(pi);
                        if (pentities && pentities.indexOf(entity.id) >= 0) {
                            sdata[pidx].count++;
                        }
                    });
                    entity.set({ sparkData: sdata });
                }
            });
                
            var sparkMax = d3.max(entities, function(d) { 
                    return d3.max(d.get('sparkData'), function(sd) { return sd.count }) 
                }),
                sy = d3.scale.linear()
                    .domain([0, sparkMax])
                    .range([0, bh]);
            
            // sparkline container
            var spark = svg.selectAll('g.spark')
                .data(entities)
              .enter().append('svg:g')
                .attr('class', 'spark')
                .attr("transform", function(d, i) { return "translate(0," + y(d,i) + ")"; });
            
            // baseline
            spark.append('svg:line')
                .attr('x1', lw)
                .attr('x2', lw + w)
                .attr('y1', bh)
                .attr('y2', bh)
                .style('stroke', '#999')
                .style('stroke-width', .5);
				
			
            // bars	
			
            spark.selectAll('rect')
                .data(function(d) { return d.get('sparkData') })
              .enter().append('svg:rect')
                .each(function(d, i) {					
                    if (d.count) {
                        var height = Math.max(2, sy(d.count))
                        d3.select(this)
                            .attr('y', bh - height)
                            .attr('x', sx(i) + lw)
                            .attr('width', w/buckets)
                            .attr('height', height)
                            .style('fill', color)
							.attr('class', 'changecolor')
                            .style('cursor', 'pointer');
                    }
                });			
            
            // leave out labels for single entity
            if (!singleEntity) {
				// colourful background for title	
				spark.append('svg:rect')
					.attr('y', 0)
					.attr('x', 0)
					.attr('width', lw)
					.attr('height', bh)
					.attr('class', function(d) { return d.get('type') });
				
                // entity title
                spark.append('svg:text')
                    .attr('class', 'title')
                    .style('fill', 'black')
                    .attr('x', lw - 8)
                    .attr('y', 0)
                    .attr("dx", 3)
                    .attr("dy", "1em")
                    .text(function(d) { var returnstring = (d.get('title').length > 32) ?  d.get('title').substr(0,29)+'...' :  d.get('title'); return returnstring });
                
                // frequency label
                svg.selectAll('text.freq')
                    .data(entities)
                  .enter().append('svg:text')
                    .attr('class', 'freq')
                    .style('fill', 'black')
                    .style('font-size', '12px')
                    .attr('x', lw + w)
                    .attr('y', y)
                    .attr("dx", 3)
                    .attr("dy", ".9em")
                    .text(frequency);
            }
              
            return this;
        },
        
        renderControls: function() {
            var view = this,
                barSort = state.get('barsort');
            // render
            view.$('.ref').toggleClass('on', barSort != 'ref');
            view.$('.alpha').toggleClass('on', barSort != 'alpha');
			view.$('.type').toggleClass('on', barSort != 'type');
        },
        
        // highlight the current page
        updateHighlight: function() {
            var pages = this.model.pages,
                settings = this.settings,
                pageId = state.get('pageid'),
				maxRange = settings.buckets ? settings.buckets : pages.length,
                sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, maxRange));
                    
            // clear existing highlights
            d3.select(this.el)
              .selectAll('rect')
                .attr('class', '')
                .style('fill', settings.color);
                
            // let's assume we're in single-page view 
            if (pageId) {
                var i = pages.indexOf(pages.get(pageId));
                d3.select($('rect:eq(' + (sidx(i)) + ')', this.el)[0])
                    .attr('class', 'selected')
                    .style('fill', settings.hicolor);
            }
        },
        
        // UI Event Handlers - update state
        
        events: {
            'click .ref.on':       'uiSort',
            'click .alpha.on':     'uiSort',
			'click .type.on':     'uiSort'
        },
        
        uiSort: function(e) {
			var setsort;
			if ($(e.target).is('.ref'))
				setsort = 'ref';
			else if ($(e.target).is('.alpha'))
				setsort = 'alpha';	
			else
				setsort = 'type';
            state.set({ barsort: setsort })
        }
        
    });
    
    // no d3 option
    if (window.nod3) {
        EntityFrequencyBarsView = EntityFrequencyBarsView.extend({
            render: $.noop,
            updateHighlight: $.noop
        });
    }
    
    return EntityFrequencyBarsView;
    
});