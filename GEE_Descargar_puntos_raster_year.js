// Define a Point object.
var pt = ee.FeatureCollection("projects/western-antonym-354508/assets/Random_points");

// Define years
var startYear = 2000;
var endYear = 2000;

// Variable to be analyzed
var coleccion = "LANDSAT/LE07/C01/T1_8DAY_NDVI"
var name_coleccion = "T1_8DAY_NDVI"
var variable0 = "NDVI"

// Statistical to be used
//var stats = "sum"; // "mean" "sum"
var stats = "mean"; // "mean" "sum"


///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
// Apply the coordinates method to the Point object.

// Display relevant geometries on the map.
Map.setCenter(-75.48, 3.23, 6);
print("Colección a utilizar =",coleccion)

Map.addLayer(pt, null, 'Random points');
// Set years and month
var years = ee.List.sequence(startYear, endYear);
var months = ee.List.sequence(1,12);
// load the image collection
var  dataset = ee.ImageCollection(coleccion);
var col = dataset.select(variable0);

if (stats == "mean") {
var climateYEAR =  ee.ImageCollection(ee.List.sequence(startYear, endYear).map(function (year){
  var date_start = ee.Date.fromYMD(year, 1, 1);
  var date_end = date_start.advance(1, "year");
 
  return(ee.ImageCollection(col)
        .filterDate(date_start, date_end)
        .filterBounds(pt)
          .mean()
          .set({year: year, 'system:time_start':date_start}));
}));
 
// filter the empty one out
var outputYearly = climateYEAR.filter(ee.Filter.listContains('system:band_names', 'constant').not())
  .sort('system:time_start').toBands();
 
var features = outputYearly.reduceRegions(pt, ee.Reducer.first(), 30);
print(features);
  var variable = "Se aplica mean";
} else if(stats == "sum") {
var climateYEAR =  ee.ImageCollection(ee.List.sequence(startYear, endYear).map(function (year){
  var date_start = ee.Date.fromYMD(year, 1, 1);
  var date_end = date_start.advance(1, "year");
 
  return(ee.ImageCollection(col)
        .filterDate(date_start, date_end)
        .filterBounds(pt)
          .sum()
          .set({year: year, 'system:time_start':date_start}));
}));
 
// filter the empty one out
var outputYearly = climateYEAR.filter(ee.Filter.listContains('system:band_names', 'constant').not())
  .sort('system:time_start').toBands();
 
var features = outputYearly.reduceRegions(pt, ee.Reducer.first(), 30);
print(features);
var variable = "Se aplica suma";
}else {
  var variable = "No hay eleccion";
}

print(variable)

// Properties to save it in Drive
var task_name = variable0+"_"+stats+"_"+name_coleccion+"_Year_"+startYear
var folder = "GEE_Folder"
var file = variable0+"_"+stats+"_"+name_coleccion+"_Year_"+startYear

Export.table.toDrive(features,
task_name,   //task name
folder,         //folder name
file);  //file name