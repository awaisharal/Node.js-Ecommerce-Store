	<script src="../../js/dashboard/jquery-1.11.1.min.js"></script>
	<script src="../../js/dashboard/bootstrap.min.js"></script>
	<script src="../../js/dashboard/chart.min.js"></script>
	<script src="../../js/dashboard/chart-data.js"></script>
	<script src="../../js/dashboard/easypiechart.js"></script>
	<script src="../../js/dashboard/easypiechart-data.js"></script>
	<script src="../../js/dashboard/bootstrap-datepicker.js"></script>
	<script src="../../js/dashboard/custom.js"></script>
	<script>
		window.onload = function () {
	var chart1 = document.getElementById("line-chart").getContext("2d");
	window.myLine = new Chart(chart1).Line(lineChartData, {
	responsive: true,
	scaleLineColor: "rgba(0,0,0,.2)",
	scaleGridLineColor: "rgba(0,0,0,.05)",
	scaleFontColor: "#c5c7cc"
	});
};
	</script>
</body>
</html>