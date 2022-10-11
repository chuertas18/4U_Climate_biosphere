rm(list=ls()) 
# Code to extract multiple raster values to points
# Description: This script allows the download of CHIRTS raster data, the cut to the study area and its storage.
# Allows to extract from multiple raster TIF format values using a layer of points (csv or shapefile).
# Author Claudia Huertas
library(sf)
library(raster)

# Layer of points (shapefile or csv)
data = read.csv("D:/MIMI/BOULOT/4U/Spatial_DB/IDEAM/Estaciones/ETP/EV_Estaciones_unicos.csv", as.is=T)

# Directory where raster files are stored
path="C:/Users/clauh/Downloads/PMLV2-20220923T043858Z-001/PMLV2"
f <- list.files(path=path, pattern='tif$', full.names=TRUE)
r <- lapply(f, raster)
s <- stack(f)

# r1<-raster("C:/Users/clauh/Downloads/CHIRPS_Collection-20220923T125322Z-001/CHIRPS_Collection/ETP_2015_12_27.tif")
# r2<-raster("C:/Users/clauh/Downloads/CHIRPS_Collection-20220923T125322Z-001/CHIRPS_Collection/ETP_2015_12_19.tif")
# S<-stack(r1,r2)

points = st_as_sf(data, coords = c("Longitud", "Latitud"), crs = 4326)
plot(st_geometry(points), pch=16, col="navy")


dat <- do.call(cbind, lapply(points, function(b) {
  out <- do.call(rbind, lapply(extract(s, points, buffer=0, fun=mean), 
                               function(x) if(is.matrix(x)) colMeans(x) else x))
  colnames(out) <- paste(colnames(out), b, sep='_')
  out
}))

ETP_modis<-extract(s,points)
