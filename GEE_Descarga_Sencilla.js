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

// PRECIPITACION
var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').filter(ee.Filter.date('2015-01-01', '2015-12-31')).select('precipitation').sum().multiply (0.1);
Map.addLayer (CHIRPS, {min: 1.0, max :5000,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000']},
'Precipitacion',true);

var CHIRPSClip = CHIRPS.clip(geomPoly);
Map.addLayer (CHIRPSClip, {min: 1.0, max :5000,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000']},
'Precipitacion',true);