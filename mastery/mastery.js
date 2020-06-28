WFMastery = (function (srcData) {
	data = {};
	o = {};
	config_mastered = false;
	config_founder = false;
	
	function toggle(e) {
		t = e.target;
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
		let founded = document.getElementsByClassName("founder");
		let L = founded.length;
		for (let i = 0; i < L; i++) {
			if (config_founder && !founded[i].classList.contains("config")) {
				founded[i].classList.add("hide");
			} else if (!(config_mastered && founded[i].classList.contains("checked"))) {
				founded[i].classList.remove("hide");
			}
		}
	}
	function toggle_mastered(e) {
		config_mastered = toggle(e);
		let mastered = document.getElementsByClassName("checked");
		let L = mastered.length;
		for (let i = 0; i < L; i++) {
			if (config_mastered && !mastered[i].classList.contains("config")) {
				mastered[i].classList.add("hide");
			} else if (!(config_founder && mastered[i].classList.contains("founder"))) {
				mastered[i].classList.remove("hide");
			}
		}
	}
	
	function initData() {
		try {
			data = this.response;
			//console.log(test);
		} catch (e) {
			console.log("Failed to load item lists, panic!");
			console.log(e);
		}
	}
	
	o.init = function () {
		document.getElementById("config_founder").onclick = toggle_founder;
		document.getElementById("config_mastered").onclick = toggle_mastered;
		
		var request = new XMLHttpRequest();
		request.open("GET", srcData);
		request.responseType = "json";
		request.onload = initData;
		request.send();
	}
	
	return o;
})("mastery/mastery_data.json");


window.addEventListener("load", () => { WFMastery.init(); });