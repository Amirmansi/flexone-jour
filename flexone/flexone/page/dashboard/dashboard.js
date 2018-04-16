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
		var $container = $(frappe.render_template('dashboard', data)).appendTo(this.body);

		me.render_widget("total_sales");
		me.render_widget("total_collection");
		me.render_widget("due_amount");
		me.render_date_widget("current_date");
		me.render_chart("profit_and_loss_chart");
		me.render_outstanding_chart("top_10_customer_outstanding");
		me.render_email_digest($container);
		me.render_item_table($container);
	},

	render_email_digest: function ($container) {

		frappe
			.call({
				method: "flexone.flexone.page.dashboard.dashboard.weekly_data"
			})
			.then(function (r) {
				if (!r.exc && r.message) {
					$container.find("#email-digest").html(r.message);

				}
			});
	},

	render_item_table: function ($container) {
		var me = this;
		$("#moving_item_header").html(__("Top 5 Items"));

		frappe
			.call({
				method: "flexone.flexone.page.dashboard.dashboard.top_moving_items"
			})
			.then(function (r) {
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
			if (index == 0) {
				item_class = "first";
			} else if (index == 1) {
				item_class = "second";
			} else if (index == 2) {
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
		const fields = ['name', 'value'];

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


render_chart: function (chart_id) {
		frappe
			.call({
				method: "flexone.flexone.page.dashboard.dashboard." + chart_id
			})
			.then(function (r) {
				if (!r.exc && r.message) {
					let data = r.message;
					if (data) {
						cust_colors = ['#7cd6fd', '#e084f9', '#743ee2']
						var inputdata = {
							x: 'x',
							columns: [
								['x']
							],
							colors: {},
							type: 'bar',
							label: true,
							bar: {
								width: {
									ratio: 0.5
								}
							},
							axis: {
								x: {
									type: 'category',
								}
							}
						};
						for (i = 0; i < data.data.labels.length; i++) {
							inputdata.columns[0].push(data.data.labels[i])
						}
						for (i = 0; i < data.data.datasets.length; i++) {
							inputdata.columns[i + 1] = [data.data.datasets[i].title]
							inputdata.colors[data.data.datasets[i].title] = cust_colors[i]
							for (d = 0; d < data.data.datasets[i].values.length; d++) {
								inputdata.columns[i + 1].push(data.data.datasets[i].values[d].toString());
							}
						}
						var chart = c3.generate({
							bindto: '#ProfitLossChart',
							data: inputdata
						});
						$("#" + chart_id + "_title").html(__("Profit and Loss"));
					}
					$("#" + chart_id + "_title").html(__("Profit and Loss"));
				}
			});
	},

	render_outstanding_chart: function (chart_id) {
		frappe.call({
			method: "erpnext.utilities.page.leaderboard.leaderboard.get_leaderboard",
			args: {
				doctype: "Customer",
				timespan: "Year",
				company: frappe.defaults.get_default('company'),
				field: "outstanding_amount",
			},
			callback: function (r) {
				if (r.message != undefined) {
					let results = r.message || [];
					let graph_items = results.slice(0, 5);
					cust_colors = ['#78fca4', '#f7fc78', '#78a4fc', '#fc7986', '#788cfc']
					var inputdata = {
						columns: [
							[]
						],
						colors: {},
						type: 'pie',
						label: true
					};
					for (i = 0; i < graph_items.length; i++) {
						val = graph_items[i].name + "-" + graph_items[i].value
						inputdata.columns[i] = [val]
						inputdata.colors[val] = cust_colors[i]
						inputdata.columns[i].push(graph_items[i].value)
					}
					var chart = c3.generate({
						bindto: '#OutstandingCustomerChart',
						data: inputdata,
						// 	pie: {
						// 		label: {
						// 				format: function (value, ratio, id) {
						// 						return value;
						// 				}
						// 		}
						// }
					});
					$("#outstanding_customer_header").html(__("Top 5 Outstanding Customer"));
				}
				$("#outstanding_customer_header").html(__("Top 5 Outstanding Customer"));
			}
		});
	},
	render_widget(function_name) {
		var me = this;
		const company = frappe.defaults.get_default('company');
		const currency = frappe.get_doc(":Company", company).default_currency;
		frappe.call({
				method: "flexone.flexone.page.dashboard.dashboard." + function_name,
			})
			.then(function (r) {
				if (!r.exc && r.message) {
					let data = r.message;
					amount = format_currency(data[1], currency)
					if (data) {
						$("#" + function_name + "_name").html(__(data[0]));
						$("#" + function_name + "_value").html(amount);
					}
				}
			});
	},
	render_date_widget(function_name) {
		var me = this;
		current_date = frappe.datetime.get_today();
		$("#" + function_name + "_name").html(__('Today'));
		$("#" + function_name + "_value").html(current_date);
	}
});