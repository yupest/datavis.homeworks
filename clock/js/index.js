function startClock(){
	var d = new Date();
	var t_hour = 6*(d.getHours() + (1/60)*d.getMinutes());
	var t_min = 6*(d.getMinutes() + (1/60)*d.getSeconds());
	var t_sec = 6*(d.getSeconds());
	document.getElementById('hour').style = "transform: rotate("+t_hour.toString()+"deg); transform-origin: 50% 50%";
	document.getElementById('minute').style = "transform: rotate("+t_min.toString()+"deg); transform-origin: 50% 50%";
	document.getElementById('second').style = "transform: rotate("+t_sec.toString()+"deg); transform-origin: 50% 50%";
};
window.onload = function(){
    window.setInterval(
	function(){
		startClock();
	}
    , 1000);
}

