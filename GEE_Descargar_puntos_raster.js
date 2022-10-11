// Statistical to be used
var stats = "sum"; // "mean" "sum"

// Define a Point object.
var fg_points = ee.FeatureCollection("projects/western-antonym-354508/assets/Random_points");

// Define years
var startYear = 2000;
var endYear = 2000;

// Variable to be analyzed
var coleccion = "UCSB-CHG/CHIRPS/DAILY"
print("Colección a utilizar =",coleccion)

// Properties to save it in Drive
var task_name = "Precipitacion_2000"
var folder = "GEE_Folder"
var file = "Precipitacion_2000"


///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
// Apply the coordinates method to the Point object.

// Display relevant geometries on the map.
Map.setCenter(-75.48, 3.23, 6);

Map.addLayer(fg_points, null, 'Random points');
// Set years and month
var years = ee.List.sequence(startYear, endYear);
var months = ee.List.sequence(1,12);
// load the image collection
var Daily = ee.ImageCollection(coleccion);

if (stats == "mean") {
  // make monthly averaged mosaics
// loop over the years and months to get mean monthly images
var byMonth_mean = ee.ImageCollection(ee.FeatureCollection(years.map(function(y){
  var yearCollection = Daily.filter(ee.Filter.calendarRange(y, y, 'year'));
  var byYear = ee.ImageCollection.fromImages(
    months.map(function(m) {
      var averagedImage = yearCollection.filter(ee.Filter.calendarRange(m, m, 'month'))
        .reduce(ee.Reducer.mean()); 
      var date = ee.Date.fromYMD(y, m, 1).format("MM_dd_YYYY");
      return averagedImage.set('system:time_start', ee.Date.fromYMD(y, m, 1)).rename(date);
      //.set('month', m).set('year', y); // eventually set year and month 
  }));
  return byYear;
})).flatten());
// filter the empty one out
var outputMonthly = byMonth_mean.filter(ee.Filter.listContains('system:band_names', 'constant').not())
  .sort('system:time_start').toBands();
print(outputMonthly);
  var variable = "Se aplica mean";
} else if(stats == "sum") {
  // make monthly summed mosaics
// loop over the years and months to get summed monthly images
var byMonth_sum = ee.ImageCollection(ee.FeatureCollection(years.map(function(y){
  var yearCollection = Daily.filter(ee.Filter.calendarRange(y, y, 'year'));
  var byYear = ee.ImageCollection.fromImages(
    months.map(function(m) {
      var summedImage = yearCollection.filter(ee.Filter.calendarRange(m, m, 'month'))
        .reduce(ee.Reducer.sum()); 
      var date = ee.Date.fromYMD(y, m, 1).format("MM_dd_YYYY");
      return summedImage.set('system:time_start', ee.Date.fromYMD(y, m, 1)).rename(date);
      //.set('month', m).set('year', y); // eventually set year and month 
  }));
  return byYear;
})).flatten());
// filter the empty one out
var outputMonthly = byMonth_sum.filter(ee.Filter.listContains('system:band_names', 'constant').not())
  .sort('system:time_start').toBands();
print(outputMonthly);
var variable = "Se aplica suma";
}else {
  var variable = "No hay eleccion";
}

print(variable)


 
var features = outputMonthly.reduceRegions(fg_points, ee.Reducer.first(), 30);
//print(features);


Export.table.toDrive(features,
task_name,   //task name
folder,         //folder name
file);  //file name