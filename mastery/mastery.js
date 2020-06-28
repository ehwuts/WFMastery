WFMastery = (function () {
	o = {};
	config_mastered = false;
	config_founder = false;
	
	function toggle(e) {
		t = e.target;
		console.log(t);
		if (t.classList.contains("checked")) {
			t.classList.remove("checked");
			return false;
		} else {
			t.classList.add("checked");
			if (config_mastered && !(config_founder && t.classList.contains("founder"))) {
				t.classList.add("hide");
			}
			return true;
		}
	}
	
	//whee code duplication
	function toggle_founder(e) {
		config_founder = toggle(e);
		founded = document.getElementsByClassName("founder");
		let L = founded.length;
		for (let i = 0; i < L; i++) {
			if (config_founder) {
				founded[i].classList.add("hide");
			} else if (!(config_mastered&&founded[i].classList.contains("checked"))) {
				founded[i].classList.remove("hide");
			}
		}
	}
	function toggle_mastered(e) {
		config_mastered = toggle(e);
		mastered = document.getElementsByClassName("checked");
		let L = mastered.length;
		for (let i = 0; i < L; i++) {
			if (config_mastered && !mastered[i].classList.contains("config")) {
				mastered[i].classList.add("hide");
			} else if (!(config_founder && founded[i].classList.contains("founder"))) {
				for (let i = 0; i < L; i++) mastered[i].classList.remove("hide");
			}
		}
	}
	
	function init_config_mastered_style() {
	}
	
	o.init = function () {
		init_config_mastered_style();
		
		e = document.getElementsByClassName("button");
		let L = e.length;
		for (let i = 0; i < L; i++) {
			e[i].onclick = toggle;
		}
		document.getElementById("config_founder").onclick = toggle_founder;
		document.getElementById("config_mastered").onclick = toggle_mastered;
	}
	
	return o;
})();


window.addEventListener("load", () => { WFMastery.init(); });