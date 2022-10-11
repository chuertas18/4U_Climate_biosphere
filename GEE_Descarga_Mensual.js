var geomPoly = ee.FeatureCollection('projects/western-antonym-354508/assets/ValleMagdalena')


// Make start and end layers
var start = ee.Date.fromYMD(2018,01,01);
var months = ee.List.sequence(0, 11);
var startDates = months.map(function(d) {
  return start.advance(d, 'month');
});
print("Start dates",startDates);

// MAPA BASE
Map.addLayer (ee.Image(0).byte(), {}, "Background",true);
var SRTM = ee.Image('CGIAR/SRTM90_V4');
var HillShade = ee.Terrain.hillshade(SRTM);
Map.addLayer (HillShade, {min: 100, max:255}, 'Hillshade',false);
Map.setCenter (-73.11, 3.94, 6); 

// CLIMATOLOGIA
var WORLDCLIM = ee.ImageCollection('WORLDCLIM/V1/MONTHLY').select('tavg').mean().multiply (0.1);
Map.addLayer (WORLDCLIM, {min: 1, max :20,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red']},
'Temperatura media',false);


// Collect imagery by month
var monthmap = function(m){
  var start = ee.Date(m);
  var end = ee.Date(m).advance(1,'month');
  var date_range = ee.DateRange(start,end);
  var S3Month = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    .filterDate(date_range)
    .filterBounds(geomPoly)
    .select('precipitation')
    .sum()
    .clip(geomPoly);
  return(S3Month);
};
print("monthmap",monthmap);


var list_of_images = startDates.map(monthmap);
print('list_of_images', list_of_images);
var mt = ee.ImageCollection(list_of_images);
print("Monthly Precipitation", mt);


Map.addLayer (mt, {min: 1.0, max :5000,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000']},
'Precipitacion',true);


var batch = require('users/fitoprincipe/geetools:batch');

batch.Download.ImageCollection.toDrive(mt, 'CHIRPS_Collection', {
  name: 'CHIRPS_2015_{system:index}',
  type: 'float',
  folder: "GEE_Folder",         //folder name
  scale: 5566,
  region: geomPoly
});