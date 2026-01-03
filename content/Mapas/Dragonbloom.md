---
mapCalc1: NaN
map_height_y: 3871
map_width_x: 4333
---

---
map_height_y: 3871
map_width_x: 4333
scale_pixels: 268  
scale_pixels_range: 25  
mapCalc1: 0  
---

> [!NOTE]- Quick Calculator  
> Map Height in Pixels: `INPUT[number:map_height_y]`  
> Map Width in Pixels: `INPUT[number:map_width_x]`  
> lat: `VIEW[{map_height_y} / 2][math]`  
> long: `VIEW[{map_width_x} / 2][math]`  
> How Many Pixels In Scale: `INPUT[number:scale_pixels]`  
> How Many Units in Scale: `INPUT[number:scale_pixels_range]`  
> Scale: `VIEW[1/({scale_pixels}/{scale_pixels_range})][math:mapCalc1]`


```leaflet
id: Dragonbloom
image: Mapa/dragonbloom.png
crs: Simple
bounds: [[0,0],[3871,4333]]
height: 500px
width: 100%
lat: 1935.5
long: 2166.5
minZoom: -7
maxZoom: 2
defaultZoom: -3
zoomDelta: 0.5
recenter: false
darkmode: false
```
