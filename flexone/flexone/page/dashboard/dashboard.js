frappe.pages['dashboard'].on_page_load = function (wrapper) {

	frappe.require([

	], function () {
		frappe.dashboard = new frappe.Dashboard(wrapper);
	});
};


frappe.Dashboard = Class.extend({
	init: function (parent) {
		frappe.ui.make_app_page({
			parent: parent,
			title: __("Dashboard"),
			single_column: true
		});

		this.parent = parent;
		this.page = this.parent.page;
		this.make();
},


make: function () {
		var me = this;
    this.body = $('<div></div>').appendTo(this.page.main);
    var data = "";
    var $container =$(frappe.render_template('dashboard', data)).appendTo(this.body);

    me.render_widget("total_sales");
    me.render_widget("total_collection");
		me.render_widget("due_amount");
		me.render_date_widget("current_date");
   	me.render_chart("profit_and_loss_chart");
	  me.render_pie_chart("top_10_customer_outstanding");
	  me.render_email_digest($container);
	  me.render_item_table($container);
  },

  render_email_digest: function($container) {

    frappe
      .call({
        method: "flexone.flexone.page.dashboard.dashboard.weekly_data"
      })
      .then(function(r) {
        if (!r.exc && r.message) {
			//me.message = null;
			$container.find("#email-digest").html(r.message);

        }
      });
  },

  render_item_table: function($container) {
	var me = this;
	$("#moving_item_header").html(__("Top 5 Items"));

    frappe
      .call({
        method: "flexone.flexone.page.dashboard.dashboard.top_moving_items"
      })
      .then(function(r) {
         if (!r.exc && r.message) {
			me.message = null;
      $container.find(".leaderboard-list").html(me.render_list_view(r.message));
     
		}
	});
  },

  render_list_view: function (items = []) {
	var me = this;

	var html =
		`${me.render_message()}
		 <div class="result" style="${me.message ? "display:none;" : ""}">
			 ${me.render_result(items)}
		 </div>`;

	return $(html);
},

render_result: function (items) {
	var me = this;

	var html =
		`${me.render_list_header()}
		${me.render_list_result(items)}`;

	return html;
},

render_list_header: function () {
	var me = this;
	//const _selected_filter = me.options.selected_filter
	//	.map(i => frappe.model.unscrub(i));
	const fields = ['Name', 'Total Sales Amount'];

	const html =
		`<div class="list-headers">
			<div class="list-item list-item--head" data-list-renderer="${"List"}">
				${
				fields.map(filter => {
						const col = frappe.model.unscrub(filter);
						return (
							`<div class="leaderboard-item list-item_content ellipsis text-muted list-item__content--flex-2
								header-btn-base
								${(col && "Item".indexOf(col) !== -1) ? "text-right" : ""}">
								<span class="list-col-title ellipsis">
									${col}
								</span>
							</div>`);
					}).join("")
				}
			</div>
		</div>`;
	return html;
},

render_list_result: function (items) {
	var me = this;

	let _html = items.map((item, index) => {
		const $value = $(me.get_item_html(item));

		let item_class = "";
		if(index == 0) {
			item_class = "first";
		} else if (index == 1) {
			item_class = "second";
		} else if(index == 2) {
			item_class = "third";
		}
		const $item_container = $(`<div class="list-item-container  ${item_class}">`).append($value);
		return $item_container[0].outerHTML;
	}).join("");

	let html =
		`<div class="result-list">
			<div class="list-items">
				${_html}
			</div>
		</div>`;

	return html;
},

render_message: function () {
	var me = this;

	let html =
		`<div class="no-result text-center" style="${me.message ? "" : "display:none;"}">
			<div class="msg-box no-border">
				<p>No Item found</p>
			</div>
		</div>`;

	return html;
},

get_item_html: function (item) {
	var me = this;
	const company = frappe.defaults.get_default('company');
	const currency = frappe.get_doc(":Company", company).default_currency;
	const fields = ['name','value'];

	const html =
		`<div class="list-item">
			${
		fields.map(col => {
				let val = item[col];
				if(col=="name") {
					var formatted_value = `<a class="grey list-id ellipsis" 
						href="#Form/${"Item"}/${item["name"]}"> ${val} </a>`
				} else {
					var formatted_value = `<span class="text-muted ellipsis">
						${("total_sales_amount".indexOf('qty') == -1) ? format_currency(val, currency) : val}</span>`
				}

				return (
					`<div class="list-item_content ellipsis list-item__content--flex-2
						${(col == "value") ? "text-right" : ""}">
						${formatted_value}
					</div>`);
				}).join("")
			}
		</div>`;

	return html;
},

  
  render_chart: function(chart_id) {
    
    frappe
      .call({
        method: "flexone.flexone.page.dashboard.dashboard." + chart_id
      })
      .then(function(r) {
        if (!r.exc && r.message) {
          let data = r.message;
          if (data) {
            const chart = new Chart({
              parent: "#" + chart_id,
             // title: chart_id.toUpperCase(),
              type: data.type,
              height:250,
              data: data.data,
              colors: ['#7cd6fd','#5e64ff','#743ee2'],
              format_tooltip_x: d => (d + '').toUpperCase(),
              format_tooltip_y: d => d + ' pts'
            });
            $("#"+chart_id+"_title").html(__("Profit and Loss"));
          }

        }
      });
  },
    
 render_pie_chart: function(chart_id) {
    
    frappe
      .call({
        method: "erpnext.utilities.page.leaderboard.leaderboard.get_leaderboard",
        args: {
          doctype: "Customer",
          timespan: "Year",
          company: frappe.defaults.get_default('company'),
          field: "outstanding_amount",
        }
      })
      .then(function(r) {
        let results = r.message || [];
        let graph_items = results.slice(0, 5);

        let args = {
        parent: "#" + chart_id,
        data: {
          datasets: [
            {
              values:graph_items.map(d=>d.value) ,
              type:'line',
              label: graph_items.map(d=>d.name) 
            }
          ],
          labels: graph_items.map(d=>d.name)
        },
        format_tooltip_x: d=>d["outstanding_amount"],
        type: 'line', // or 'bar', 'line', 'pie', 'percentage'
       height: 250,
        colors: ['purple', '#ffa3ef', 'red'],
        //maxLegendPoints: 5,    // default: 20
        //maxSlices: 5,         // default: 20
        lineOptions: {
          dotSize: 50,          // default: 4
          hideLine: 0,         // default: 0
          hideDots: 0,         // default: 0
          heatline: 10,         // default: 0
          regionFill: 10        // default: 0
        }
      };
      //graph_items.map(d=>d.name)
      //graph_items.map(d=>d.name)
      //
      //args.data=[300, 210, 500, 375];
      const chart =new Chart(args);
    //  console.log(args.data)

    $("#outstanding_customer_header").html(__("Top 5 Outstanding Customer"));

      });
    },
	render_widget(function_name) {
    var me = this;
    const company = frappe.defaults.get_default('company');
    const currency = frappe.get_doc(":Company", company).default_currency;
		frappe.call({
			method: "flexone.flexone.page.dashboard.dashboard."+function_name,
      })
      .then(function(r) {
        if (!r.exc && r.message) {
          let data = r.message;
          amount=format_currency(data[1], currency)
          if (data) {
            $("#"+function_name+"_name").html(__(data[0]));
            $("#"+function_name+"_value").html(amount);
          }
        }
      });
	},
	render_date_widget(function_name) {
    var me = this;
		current_date=frappe.datetime.get_today();
		$("#"+function_name+"_name").html(__('Today'));
		$("#"+function_name+"_value").html(current_date);
	}
});

