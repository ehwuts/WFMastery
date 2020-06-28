WFMastery = (function () {
	o = {};
	style_mastered = ["style_hide_mastered", "<style type=\"text/css\" id=\"style_hide_mastered\"> div.checked { display: none; }</style>"];
	style_founder = ["style_hide_founder", "<style type=\"text/css\" id=\"style_hide_founder\"> div.checked.founder { display: none; }</style>"];
	
	function toggle(e) {
		t = e.target;
		if (t.classList.contains("checked")) {
			t.classList.remove("checked");
			return false;
		} else {
			t.classList.add("checked");
			return true;
		}
	}
	//turns out this was a bad idea and currently forces the whole page to flash unstyled
	function style_toggle(e, t) {
		if (toggle(e)) {
			document.head.innerHTML += t[1];
		} else {
			e = document.getElementById(t[0]);
			e.parentElement.removeChild(e);
		}
	}
	
	function toggle_founder(e) {
		style_toggle(e, style_founder);
	}
	function toggle_mastered(e) {
		style_toggle(e, style_mastered);
	}
	
	function init_config_mastered_style() {
	}
	
	o.init = function () {
		init_config_mastered_style();
		
		document.getElementById("config_founder").onclick = toggle_founder;
		document.getElementById("config_mastered").onclick = toggle_mastered;
		document.getElementById("test_button").onclick = toggle;
	}
	
	return o;
})();


window.addEventListener("load", () => { WFMastery.init(); });