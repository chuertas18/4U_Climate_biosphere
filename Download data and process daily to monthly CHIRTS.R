rm(list=ls()) 
# Script for downloading daily CHIRTS data
# Description: This script allows the download of CHIRTS raster data, the cut to the study area and its storage.
# Modified by Claudia Huertas
# Source code: Fabio Castro (https://github.com/fabiolexcastro)

# Required libraries
library(raster)

# Parallelization process 
library(foreach)
library(parallel)
library(doSNOW)
library(stringr)

# Download directory : The Climate Hazards Center
root0<-"http://data.chc.ucsb.edu/products/CHIRTSdaily/v1.0/global_tifs_p05/"
# Variable Tmin, Tmax
variable<-"Tmax"

# Local work directory
setwd("D:/MIMI/BOULOT/4U/Spatial_DB")

# Years to download
year<-seq(2009, 2016, by = 1) 

# Shapefile the clipping layer
shp<-shapefile("D:/MIMI/BOULOT/CAPAS_SIG/Capas_Paises/colombia_epsg4326_buf1km.shp")
crs(shp) <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0" 

##############################################################################################################
# Parallelization process 
ncores<-detectCores(all.tests = FALSE, logical=TRUE) # Number of cores
c1<-makeCluster(5) # Number of cores to use
registerDoSNOW(c1)

# Code can be improved by avoiding loops and using family apply
for(y in year){
  print(y) 
  outf <- paste0('./chirts/',variable,"/",y)
  dir.create(outf, recursive = TRUE)
  root<-paste0(root0,variable,"/",y,"/",variable,".")
  # date <- seq(as.Date("2016/1/1"), as.Date("2016/12/31"), by = "day")
  date <- seq(as.Date(paste0(y,"/1/1")), as.Date(paste0(y,"/12/31")), by = "day")
  date <- gsub('-', '\\.', date)
  urls <- paste0(root, date, '.tif')
  
  # For to download each raster automatically
  for(i in 1:length(urls)){  
    out_file<-paste0(outf, '/','T',i,'_',basename(urls[i]))
    print(urls[i])
    #download.file(url = urls[i], destfile = paste0(outf, '/', basename(urls[i])), mode = 'wb') 
    download.file(url = urls[i], destfile = out_file, mode = 'wb') 
    r<-raster(out_file)
    crs(r) <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0" 
    r_clip<-crop(r, extent(shp))  
    r_clip<-mask(r_clip,shp)
    #out_file2<-paste0(outf, '/','T',i,'_',basename(urls[i]))
    writeRaster(r_clip,out_file,format="GTiff", overwrite=TRUE)
    print('Done!')
  }
}






