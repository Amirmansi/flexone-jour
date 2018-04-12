$(document).ready(function() {
	$('header').prepend(frappe.render_template("logo"));
	$('.navbar-desk').prepend(frappe.render_template("company-name"));
	$('.main-section').append(frappe.render_template("main-sidebar"));
	$('head').append(frappe.render_template("material-icons"));
	$('head').append(frappe.render_template("poppins"));

	$('header').addClass('main-header');
	$('.dropdown-help').addClass('hidden');
	$('#toolbar-user [href*="/index"]').addClass('hidden');
	$('#toolbar-user [href*="#background_jobs"]').addClass('hidden');
	// $('.dropdown-navbar-new-comments').addClass('hidden');
	$('header .navbar').removeClass('navbar-fixed-top');
	
	$('#navbar-breadcrumbs').addClass('hidden');
	$('.navbar-home').addClass('hidden');
	$('body').addClass('skin-origin sidebar-mini sidebar-collapse');	
	$('#body_div').addClass('content-wrapper');
	
	flexone.set_user_background();
	
});




frappe.provide("flexone");

// add toolbar icon
$(document).bind('toolbar_setup', function() {
	frappe.app.name = "bdoop Erp";
	$('.navbar-home').html(frappe._('Home'));



});

flexone.set_user_background = function(src, selector, style){
	if(!selector) selector = "#page-desktop";
	if(!style) style = "Fill Screen";
	if(src) {
		if (window.cordova && src.indexOf("http") === -1) {
			src = frappe.base_url + src;
		}
		var background = repl('background: url("%(src)s") center center;', {src: src});
	} else {
		var background = "background-color: #FFFFFF;";
	}

	frappe.dom.set_style(repl('%(selector)s { \
		%(background)s \
		%(style)s \
	}', {
		selector:selector,
		background:background,
		style: ""
	}));
}


frappe.templates["logo"] = '<a href="https://www.flexsofts.com/" target="_blank" class="logo">'
+     ' <span class="logo-mini"><b>or</b></span>'
+'      <span class="logo-lg"><b>Origin Aquatech</b></span>'
+'    </a>';

frappe.templates["sidebar-toggle"] = '<a href="#" class="sidebar-toggle hidden-item" data-toggle="offcanvas" role="button">'
+	        '<span class="sr-only">Toggle navigation</span>'
+	    '</a>';
var company=frappe.defaults.get_default("company"); 
frappe.templates["company-name"] = '<span class="navbar-company" style="color:white">'+company+'</span>';

frappe.templates["material-icons"] = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
frappe.templates["poppins"] = '<link href="https://fonts.googleapis.com/css?family=Poppins:300,400" rel="stylesheet">';
