//-------------------
// GLOBAL variables
//-------------------
let model;

var canvasWidth = 300;
var canvasHeight = 300;
var canvasStrokeStyle = "#00ff9d";
var canvasLineJoin = "round";
var canvasLineWidth = 10;
var canvasBackgroundColor = "black";
var canvasId = "canvas";


var clickX = new Array();
var clickY = new Array();
var clickD = new Array();
var drawing;

document.getElementById('chart_box').innerHTMl="";
document.getElementById('chart_box').style.display = "none";

//---------------
// Create canvas
//---------------
var canvasBox = document.getElementById('canvas_box');
var canvas = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}
ctx = canvas.getContext("2d");

//---------------
// Drawing function
//---------------

//---------------
// Mouse Down function
//---------------
$("#canvas").mousedown(function(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX- rect.left;;
	var mouseY = e.clientY- rect.top;
	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});

//---------------
// MOUSE Move function
//---------------
$("#canvas").mousemove( e => {
  if(drawing){
    var rect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;;
    var mouseY = e.clientY - rect.top;
    addUserGesture(mouseX, mouseY, true);
    drawOnCanvas();
  }
});

//---------------
// MOUSE Up function
//---------------
$("#canvas").mouseup( e => drawing = false);

//---------------
// MOUSE leave function
//---------------
$("#canvas").mouseleave( e => drawing = false);

//---------------
// Add click function
//---------------
function addUserGesture(x, y, dragging){
  clickX.push(x);
  clickY.push(y);
  clickD.push(dragging);
}

//---------------
// Re draw function
//---------------
function drawOnCanvas(){
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.strokeStyle = canvasStrokeStyle;
  ctx.lineJoin = canvasLineJoin;
  ctx.lineWidth = canvasLineWidth;

  for (let i = 0; i < clickX.length; i++){
    ctx.beginPath();
    if (clickD[i] && i) {
      ctx.moveTo(clickX[i-1], clickY[i-1]);
    } else {
      ctx.moveTo(clickX[i]-1, clickY[i]);
    }
    ctx.lineTo(clickX[i], clickY[i]);
    ctx.closePath();
    ctx.stroke();
  }
}

//---------------
// Clear Canvas function
//---------------
$("#clear-button").click(async function() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    clickX = new Array();
    clickY = new Array();
    clickD = new Array();
    $(".prediction-text").empty();
    $("#result_box").addClass('d-none');
})

//---------------
// loader for cnn model
//---------------
async function loadModel(){
  console.log("model loading...");
  model = undefined;
  model = await tf.loadLayersModel("../models/model.json");
  console.log("model loaded...");
}
loadModel();

//---------------
// preprocess the canvas
//---------------
function preprocessCanvas(image){
  let tensor = tf.browser.fromPixels(image)
    .resizeNearestNeighbor([28, 28])
    .mean(2)
    .expandDims(2)
    .expandDims()
    .toFloat();
  console.log(tensor.shape);
  return tensor.div(255.0);
}

//---------------
// predict function
//---------------
$("#predict-button").click(async function(){
  var imageData = canvas.toDataURL();

  let tensor = preprocessCanvas(canvas);

  let predictions = await model.predict(tensor).data();

  let results = Array.from(predictions);

  $("#result_box").removeClass('d-none');
  displayChart(results);
  displayLabel(results);

  console.log(results);
});

//---------------
// Chart to display predictions
//---------------
var chart;
var firstTime = 0;
function loadChart(label, data, modelSelected) {
	var ctx = document.getElementById('chart_box').getContext('2d');
	chart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: label,
	        datasets: [{
	            label: modelSelected + " prediction",
	            backgroundColor: '#00ff9d',
	            borderColor: '#5bffc0',
	            data: data,
	        }]
	    },
	    options: {}
	});
}

//---------------
// display chart with updated drawing from canvas
//---------------
function displayChart(data) {
	var select_model  = document.getElementById("select_model");
  	var select_option = "CNN";

	label = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	if (firstTime == 0) {
		loadChart(label, data, select_option);
		firstTime = 1;
	} else {
		chart.destroy();
		loadChart(label, data, select_option);
	}
	document.getElementById('chart_box').style.display = "block";
}

function displayLabel(data) {
	var max = data[0];
    var maxIndex = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
	$(".prediction-text").html("Predicting you draw <b>"+maxIndex+"</b> with <b>"+Math.trunc( max*100 )+"%</b> confidence")
}