from __future__ import unicode_literals

import frappe
import frappe.defaults
from frappe.utils import cstr, flt, fmt_money, formatdate, getdate

def on_session_creation(login_manager):
	info = frappe.db.get_value("User", frappe.local.session_obj.user,
			["home_page_link"], as_dict=1)

	frappe.local.response["home_page"] = info.home_page_link or "/desk"

def add_remark_in_journal_entry_account(self,method):
	frappe.msgprint(method)
	gl_entry=[]
	gl_entry=frappe.get_list('GL Entry', filters={'voucher_no': self.name}, fields=['name', 'remarks', 'account'])
	for d in gl_entry:
		for jv_acct in self.get("accounts"):
			if (jv_acct.account==d.account):
				gl_matched_entry = frappe.get_doc('GL Entry', d.name)
				gl_matched_entry.flags.ignore_permissions = 1
				df = frappe.get_meta('GL Entry').get_field("remarks")
				df.allow_on_submit = 1
				gl_matched_entry.remarks=jv_acct.remark
				gl_matched_entry.save()

				df = frappe.get_meta('GL Entry').get_field("remarks")
				df.allow_on_submit = 0