from frappe import _

def get_data():
	return [
		{
			"label": _("Flexone"),
			"items": [
				{
					"type": "page",
					"name": "dashboard",
				}
			]
		},
				{
			"label": _("Accounts"),
			"items": [

				{
					"type": "doctype",
					"name": "Journal Entry",
					"description": _("Bills raised by Suppliers.")
				},
				{
					"type": "doctype",
					"name": "Payment Request",
					"description": _("Payment Request")
				},
				{
					"type": "doctype",
					"name": "Payment Entry",
					"description": _("Bank/Cash transactions against party or for internal transfer")
				},
				{
					"type": "page",
					"name": "pos",
					"label": _("POS"),
					"description": _("Point of Sale")
				},
				{
					"type": "doctype",
					"name": "Subscription",
					"label": _("Subscription"),
					"description": _("To make recurring documents")
				},
				{
					"type": "report",
					"name": "Accounts Receivable",
					"doctype": "Sales Invoice",
					"is_query_report": True
				},
				{
					"type": "report",
					"name": "Accounts Payable",
					"doctype": "Purchase Invoice",
					"is_query_report": True
				},
			]

		},
    ]
